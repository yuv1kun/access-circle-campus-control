
-- Create a storage bucket for student photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-photos',
    'student-photos', 
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create storage policies for the student-photos bucket
-- Allow public read access to photos
CREATE POLICY "Public Access for Student Photos" ON storage.objects
FOR SELECT USING (bucket_id = 'student-photos');

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload student photos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'student-photos' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update/replace photos
CREATE POLICY "Authenticated users can update student photos" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'student-photos' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete photos
CREATE POLICY "Authenticated users can delete student photos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'student-photos' 
    AND auth.role() = 'authenticated'
);
