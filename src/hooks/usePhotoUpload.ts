
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePhotoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadPhoto = async (file: File, studentUsn: string): Promise<string | null> => {
    try {
      setUploading(true);

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP images.');
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Please upload images under 5MB.');
      }

      // Create unique filename with timestamp
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${studentUsn}-${timestamp}.${fileExt}`;

      console.log('Uploading file:', fileName);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('student-photos')
        .getPublicUrl(fileName);

      const photoUrl = urlData.publicUrl;
      console.log('Generated URL:', photoUrl);

      // Update student record with new photo URL
      const { error: updateError } = await supabase
        .from('students')
        .update({ image_url: photoUrl })
        .eq('usn', studentUsn);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      toast({
        title: "Photo Uploaded",
        description: "Student photo uploaded successfully",
      });

      return photoUrl;

    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload photo",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoUrl: string, studentUsn: string): Promise<boolean> => {
    try {
      // Extract filename from URL
      const fileName = photoUrl.split('/').pop();
      if (!fileName) throw new Error('Invalid photo URL');

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('student-photos')
        .remove([fileName]);

      if (deleteError) throw deleteError;

      // Update student record to remove photo URL
      const { error: updateError } = await supabase
        .from('students')
        .update({ image_url: null })
        .eq('usn', studentUsn);

      if (updateError) throw updateError;

      toast({
        title: "Photo Deleted",
        description: "Student photo deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Photo deletion error:', error);
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete photo",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadPhoto,
    deletePhoto,
    uploading
  };
};
