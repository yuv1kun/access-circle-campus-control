
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GateEntry {
  log_id: number;
  nfc_uid_scanner: string;
  entry_time: string;
  exit_time?: string;
  log_date: string;
  created_at: string;
  student?: {
    usn: string;
    name: string;
    image_url?: string;
  };
}

export const useGateData = () => {
  const [entries, setEntries] = useState<GateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyCount, setDailyCount] = useState(0);
  const [activeEntries, setActiveEntries] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchGateData();
    
    // Setup realtime subscription for gate entries
    const channel = supabase
      .channel(`gate_entries_${Date.now()}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'library_access_logs' 
      }, (payload) => {
        console.log('Gate entry change:', payload);
        fetchGateData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchGateData = async () => {
    try {
      console.log('Fetching gate data...');
      
      // Fetch recent entries with student information
      const { data: entriesData, error: entriesError } = await supabase
        .from('library_access_logs')
        .select(`
          *,
          nfc_rings!inner(
            student_usn,
            students!inner(
              usn,
              name,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (entriesError) {
        console.error('Entries fetch error:', entriesError);
        throw entriesError;
      }

      // Transform the data to match our interface
      const transformedEntries: GateEntry[] = (entriesData || []).map(entry => ({
        log_id: entry.log_id,
        nfc_uid_scanner: entry.nfc_uid_scanner,
        entry_time: entry.entry_time || '',
        exit_time: entry.exit_time || undefined,
        log_date: entry.log_date || '',
        created_at: entry.created_at || '',
        student: {
          usn: entry.nfc_rings.students.usn,
          name: entry.nfc_rings.students.name,
          image_url: entry.nfc_rings.students.image_url || undefined
        }
      }));

      setEntries(transformedEntries);

      // Calculate daily count (entries today)
      const today = new Date().toISOString().split('T')[0];
      const todayEntries = transformedEntries.filter(entry => 
        entry.log_date === today && entry.entry_time
      );
      setDailyCount(todayEntries.length);

      // Calculate active entries (entered but not exited)
      const activeCount = transformedEntries.filter(entry => 
        entry.entry_time && !entry.exit_time
      ).length;
      setActiveEntries(activeCount);

    } catch (error) {
      console.error('Error fetching gate data:', error);
      toast({
        title: "Error",
        description: "Failed to load gate data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const recordGateEntry = async (studentUsn: string) => {
    try {
      // Get the student's NFC UID
      const { data: nfcData, error: nfcError } = await supabase
        .from('nfc_rings')
        .select('nfc_uid')
        .eq('student_usn', studentUsn)
        .single();

      if (nfcError || !nfcData) {
        throw new Error('NFC ring not found for student');
      }

      // Record the entry
      const { error } = await supabase
        .from('library_access_logs')
        .insert({
          nfc_uid_scanner: nfcData.nfc_uid,
          entry_time: new Date().toISOString(),
          log_date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;

      toast({
        title: "Entry Recorded",
        description: `Gate entry recorded successfully`,
      });

      // Refresh data
      fetchGateData();
    } catch (error) {
      console.error('Entry recording error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record entry",
        variant: "destructive",
      });
      throw error;
    }
  };

  const searchStudents = async (query: string) => {
    if (!query.trim()) return [];
    
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .or(`name.ilike.%${query}%,usn.ilike.%${query}%`)
        .limit(10);

      if (error) {
        console.error('Search error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  return {
    entries,
    loading,
    dailyCount,
    activeEntries,
    recordGateEntry,
    searchStudents,
  };
};
