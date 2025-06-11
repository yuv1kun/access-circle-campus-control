
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Student {
  id: string;
  name: string;
  email: string;
  photo_url?: string;
  created_at: string;
}

export interface BookTransaction {
  id: string;
  student_id: string;
  student_name: string;
  book_title: string;
  book_isbn: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: 'issued' | 'returned' | 'overdue';
  created_at: string;
}

export interface LibraryEntry {
  id: string;
  student_id: string;
  student_name: string;
  entry_time: string;
  exit_time?: string;
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
      const [studentsData, transactionsData, entriesData] = await Promise.all([
        supabase.from('students').select('*').order('name'),
        supabase.from('book_transactions').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('library_entries').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (studentsData.data) setStudents(studentsData.data);
      if (transactionsData.data) setTransactions(transactionsData.data);
      if (entriesData.data) setEntries(entriesData.data);
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
      .channel('book_transactions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'book_transactions' }, 
        (payload) => {
          console.log('Transaction change:', payload);
          fetchInitialData();
        })
      .subscribe();

    const entriesChannel = supabase
      .channel('library_entries_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'library_entries' }, 
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
    
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .or(`name.ilike.%${query}%,id.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Search error:', error);
      return [];
    }

    return data || [];
  };

  const recordEntry = async (studentId: string, type: 'in' | 'out') => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      if (type === 'in') {
        const { error } = await supabase
          .from('library_entries')
          .insert({
            student_id: studentId,
            student_name: student.name,
            entry_time: new Date().toISOString(),
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('library_entries')
          .update({ exit_time: new Date().toISOString() })
          .eq('student_id', studentId)
          .is('exit_time', null)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
      }

      toast({
        title: `Student ${type === 'in' ? 'Check-In' : 'Check-Out'} Successful`,
        description: `${student.name} (${studentId}) recorded at ${new Date().toLocaleTimeString()}`,
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

  const issueBook = async (studentId: string, bookTitle: string, bookIsbn: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days from now

      const { error } = await supabase
        .from('book_transactions')
        .insert({
          student_id: studentId,
          student_name: student.name,
          book_title: bookTitle,
          book_isbn: bookIsbn,
          issue_date: new Date().toISOString(),
          due_date: dueDate.toISOString(),
          status: 'issued'
        });

      if (error) throw error;

      toast({
        title: "Book Issued Successfully",
        description: `${bookTitle} issued to ${student.name}`,
      });
    } catch (error) {
      console.error('Book issue error:', error);
      toast({
        title: "Error",
        description: "Failed to issue book",
        variant: "destructive",
      });
      throw error;
    }
  };

  const returnBook = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('book_transactions')
        .update({
          return_date: new Date().toISOString(),
          status: 'returned'
        })
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Book Returned Successfully",
        description: "Book return has been recorded",
      });
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
