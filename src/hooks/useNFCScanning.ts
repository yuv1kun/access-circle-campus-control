
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScannedStudent {
  usn: string;
  name: string;
  image_url?: string;
  blood_group?: string;
  contact_no?: string;
  valid_upto: string;
}

export const useNFCScanning = () => {
  const [scannedStudent, setScannedStudent] = useState<ScannedStudent | null>(null);
  const [showScanPopup, setShowScanPopup] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const { toast } = useToast();

  const handleNFCScan = useCallback(async (nfcUid: string) => {
    console.log('Processing NFC scan:', nfcUid);
    
    try {
      // Find the student associated with this NFC UID
      const { data: nfcData, error: nfcError } = await supabase
        .from('nfc_rings')
        .select(`
          student_usn,
          students!inner(
            usn,
            name,
            image_url,
            blood_group,
            contact_no,
            valid_upto
          )
        `)
        .eq('nfc_uid', nfcUid)
        .eq('status', 'active')
        .single();

      if (nfcError || !nfcData) {
        console.error('Student not found for NFC UID:', nfcUid);
        setScanSuccess(false);
        setScannedStudent(null);
        setShowScanPopup(true);
        return;
      }

      const student = nfcData.students;
      console.log('Found student:', student);
      
      // Record the entry
      const { error: entryError } = await supabase
        .from('library_access_logs')
        .insert({
          nfc_uid_scanner: nfcUid,
          entry_time: new Date().toISOString(),
          log_date: new Date().toISOString().split('T')[0],
        });

      if (entryError) {
        console.error('Error recording entry:', entryError);
        throw entryError;
      }

      // Show success popup
      setScanSuccess(true);
      setScannedStudent(student);
      setShowScanPopup(true);

      // Play success sound (if available)
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(() => {
          // Audio play failed, ignore silently
        });
      } catch (error) {
        // Audio not available, ignore
      }

      toast({
        title: "Entry Recorded",
        description: `Welcome ${student.name}!`,
      });

    } catch (error) {
      console.error('NFC scan processing error:', error);
      setScanSuccess(false);
      setScannedStudent(null);
      setShowScanPopup(true);
      
      toast({
        title: "Scan Error",
        description: "Failed to process NFC scan",
        variant: "destructive",
      });
    }
  }, [toast]);

  const closeScanPopup = useCallback(() => {
    setShowScanPopup(false);
    setScannedStudent(null);
  }, []);

  return {
    scannedStudent,
    showScanPopup,
    scanSuccess,
    handleNFCScan,
    closeScanPopup
  };
};
