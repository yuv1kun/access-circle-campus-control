
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Student {
  usn: string;
  name: string;
  contact_no?: string;
  image_url?: string;
  created_at: string;
}

export interface BookTransaction {
  transaction_id: string;
  nfc_uid_scanner: string;
  book_id: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: 'issued' | 'returned' | 'overdue';
  created_at: string;
}

export interface LibraryEntry {
  log_id: string;
  nfc_uid_scanner: string;
  entry_time: string;
  exit_time?: string;
  log_date: string;
  created_at: string;
}

export const useLibraryData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<BookTransaction[]>([]);
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
    setupRealtimeSubscriptions();
  }, []);

  const fetchInitialData = async () => {
    try {
      console.log('Fetching library data...');
      
      const [studentsData, transactionsData, entriesData] = await Promise.all([
        supabase.from('students').select('*').order('name'),
        supabase.from('library_book_transactions').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('library_access_logs').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      console.log('Students data:', studentsData);
      console.log('Transactions data:', transactionsData);
      console.log('Entries data:', entriesData);

      if (studentsData.error) {
        console.error('Students fetch error:', studentsData.error);
      } else if (studentsData.data) {
        setStudents(studentsData.data);
      }

      if (transactionsData.error) {
        console.error('Transactions fetch error:', transactionsData.error);
      } else if (transactionsData.data) {
        setTransactions(transactionsData.data);
      }

      if (entriesData.error) {
        console.error('Entries fetch error:', entriesData.error);
      } else if (entriesData.data) {
        setEntries(entriesData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load library data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const transactionsChannel = supabase
      .channel('library_book_transactions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'library_book_transactions' }, 
        (payload) => {
          console.log('Transaction change:', payload);
          fetchInitialData();
        })
      .subscribe();

    const entriesChannel = supabase
      .channel('library_access_logs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'library_access_logs' }, 
        (payload) => {
          console.log('Entry change:', payload);
          fetchInitialData();
        })
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(entriesChannel);
    };
  };

  const searchStudents = async (query: string): Promise<Student[]> => {
    if (!query.trim()) return [];
    
    try {
      console.log('Searching students with query:', query);
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .or(`name.ilike.%${query}%,usn.ilike.%${query}%`)
        .limit(10);

      if (error) {
        console.error('Search error:', error);
        return [];
      }

      console.log('Search results:', data);
      return data || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  const recordEntry = async (studentUsn: string, type: 'in' | 'out') => {
    try {
      // First get the student's NFC UID
      const { data: nfcData, error: nfcError } = await supabase
        .from('nfc_rings')
        .select('nfc_uid')
        .eq('student_usn', studentUsn)
        .single();

      if (nfcError || !nfcData) {
        throw new Error('NFC ring not found for student');
      }

      const student = students.find(s => s.usn === studentUsn);
      if (!student) {
        throw new Error('Student not found');
      }

      if (type === 'in') {
        const { error } = await supabase
          .from('library_access_logs')
          .insert({
            nfc_uid_scanner: nfcData.nfc_uid,
            entry_time: new Date().toISOString(),
            log_date: new Date().toISOString().split('T')[0],
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('library_access_logs')
          .update({ exit_time: new Date().toISOString() })
          .eq('nfc_uid_scanner', nfcData.nfc_uid)
          .is('exit_time', null)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
      }

      toast({
        title: `Student ${type === 'in' ? 'Check-In' : 'Check-Out'} Successful`,
        description: `${student.name} (${studentUsn}) recorded at ${new Date().toLocaleTimeString()}`,
      });

      return student;
    } catch (error) {
      console.error('Entry recording error:', error);
      toast({
        title: "Error",
        description: "Failed to record entry",
        variant: "destructive",
      });
      throw error;
    }
  };

  const issueBook = async (studentUsn: string, bookTitle: string, bookId: string) => {
    try {
      console.log('Issuing book:', { studentUsn, bookTitle, bookId });

      // First get the student's NFC UID
      const { data: nfcData, error: nfcError } = await supabase
        .from('nfc_rings')
        .select('nfc_uid')
        .eq('student_usn', studentUsn)
        .single();

      if (nfcError || !nfcData) {
        throw new Error('NFC ring not found for student');
      }

      const student = students.find(s => s.usn === studentUsn);
      if (!student) {
        throw new Error('Student not found');
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days from now

      const { error } = await supabase
        .from('library_book_transactions')
        .insert({
          nfc_uid_scanner: nfcData.nfc_uid,
          book_id: bookId,
          issue_date: new Date().toISOString(),
          due_date: dueDate.toISOString().split('T')[0], // Date only for due_date
          status: 'issued'
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      toast({
        title: "Book Issued Successfully",
        description: `${bookTitle} issued to ${student.name}`,
      });

      // Refresh data to show the new transaction
      fetchInitialData();
    } catch (error) {
      console.error('Book issue error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to issue book",
        variant: "destructive",
      });
      throw error;
    }
  };

  const returnBook = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('library_book_transactions')
        .update({
          return_date: new Date().toISOString(),
          status: 'returned'
        })
        .eq('transaction_id', transactionId);

      if (error) throw error;

      toast({
        title: "Book Returned Successfully",
        description: "Book return has been recorded",
      });

      // Refresh data
      fetchInitialData();
    } catch (error) {
      console.error('Book return error:', error);
      toast({
        title: "Error",
        description: "Failed to return book",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    students,
    transactions,
    entries,
    loading,
    searchStudents,
    recordEntry,
    issueBook,
    returnBook,
  };
};
