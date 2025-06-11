
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HostelEntry {
  log_id: number;
  nfc_uid_scanner: string;
  entry_time: string | null;
  exit_time: string | null;
  reader_id: string | null;
  log_date: string;
  created_at: string;
  student?: {
    usn: string;
    name: string;
    contact_no: string;
  };
  nfc_ring?: {
    student_usn: string;
  };
}

export interface HostelStats {
  totalEntries: number;
  lateEntries: number;
  currentOccupancy: number;
  curfewTime: string;
}

export const useHostelData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  // Fetch hostel entries with student information
  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: ['hostel-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hostel_access_logs')
        .select(`
          *,
          nfc_rings!fk_nfc_uid_hostel (
            student_usn,
            students (
              usn,
              name,
              contact_no
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      return data?.map(entry => ({
        ...entry,
        student: entry.nfc_rings?.students,
        nfc_ring: entry.nfc_rings
      })) || [];
    }
  });

  // Real-time subscription for new entries
  useEffect(() => {
    const setupSubscription = async () => {
      // Prevent multiple subscriptions
      if (isSubscribedRef.current || subscriptionRef.current) {
        console.log('Subscription already exists, skipping...');
        return;
      }

      try {
        console.log('Setting up new subscription...');
        isSubscribedRef.current = true;
        
        subscriptionRef.current = supabase
          .channel(`hostel_access_logs_${Date.now()}`) // Unique channel name
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'hostel_access_logs' },
            (payload) => {
              console.log('Real-time update received:', payload);
              queryClient.invalidateQueries({ queryKey: ['hostel-entries'] });
            }
          )
          .subscribe((status) => {
            console.log('Subscription status:', status);
            if (status === 'CLOSED') {
              isSubscribedRef.current = false;
            }
          });
      } catch (error) {
        console.error('Subscription setup error:', error);
        isSubscribedRef.current = false;
      }
    };

    setupSubscription();

    return () => {
      const cleanup = async () => {
        if (subscriptionRef.current && isSubscribedRef.current) {
          console.log('Cleaning up subscription...');
          try {
            await supabase.removeChannel(subscriptionRef.current);
            subscriptionRef.current = null;
            isSubscribedRef.current = false;
            console.log('Subscription cleaned up successfully');
          } catch (error) {
            console.error('Error cleaning up subscription:', error);
          }
        }
      };
      
      cleanup();
    };
  }, [queryClient]);

  // Add new entry mutation
  const addEntryMutation = useMutation({
    mutationFn: async ({ nfcUid, type, readerId }: { nfcUid: string; type: 'in' | 'out'; readerId: string }) => {
      const now = new Date().toISOString();
      const entryData = {
        nfc_uid_scanner: nfcUid,
        reader_id: readerId,
        log_date: new Date().toISOString().split('T')[0],
        ...(type === 'in' ? { entry_time: now } : { exit_time: now })
      };

      const { data, error } = await supabase
        .from('hostel_access_logs')
        .insert([entryData])
        .select(`
          *,
          nfc_rings!fk_nfc_uid_hostel (
            student_usn,
            students (
              usn,
              name,
              contact_no
            )
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['hostel-entries'] });
      const student = data.nfc_rings?.students;
      const isLate = data.entry_time && new Date(data.entry_time).getHours() >= 22;
      
      toast({
        title: isLate ? "Late Entry Detected" : "Entry Recorded",
        description: student ? `${student.name} (${student.usn})` : "Unknown student",
        variant: isLate ? "destructive" : "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record entry",
        variant: "destructive",
      });
      console.error('Entry error:', error);
    }
  });

  // Calculate statistics
  const stats: HostelStats = {
    totalEntries: entries.length,
    lateEntries: entries.filter(entry => 
      entry.entry_time && new Date(entry.entry_time).getHours() >= 22
    ).length,
    currentOccupancy: entries.filter(entry => 
      entry.entry_time && !entry.exit_time &&
      new Date(entry.created_at).toDateString() === new Date().toDateString()
    ).length,
    curfewTime: '22:00'
  };

  // Get late entries
  const lateEntries = entries.filter(entry => 
    entry.entry_time && new Date(entry.entry_time).getHours() >= 22
  );

  return {
    entries,
    lateEntries,
    stats,
    isLoading,
    error,
    addEntry: addEntryMutation.mutate,
    isAddingEntry: addEntryMutation.isPending
  };
};

export const useHostelSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchStudents = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          usn,
          name,
          contact_no,
          nfc_rings (
            nfc_uid,
            status,
            hostel_access_logs (
              entry_time,
              exit_time,
              created_at
            )
          )
        `)
        .or(`usn.ilike.%${query}%,name.ilike.%${query}%,contact_no.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchStudents
  };
};
