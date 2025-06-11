
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, Trash2, User } from 'lucide-react';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';

interface PhotoUploadProps {
  studentUsn: string;
  currentPhotoUrl?: string;
  studentName: string;
  onPhotoUpdated?: (newUrl: string | null) => void;
}

const PhotoUpload = ({ studentUsn, currentPhotoUrl, studentName, onPhotoUpdated }: PhotoUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, deletePhoto, uploading } = usePhotoUpload();

  const handleFileSelect = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const newUrl = await uploadPhoto(file, studentUsn);
    if (newUrl) {
      setPreview(null);
      onPhotoUpdated?.(newUrl);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (currentPhotoUrl) {
      const success = await deletePhoto(currentPhotoUrl, studentUsn);
      if (success) {
        onPhotoUpdated?.(null);
      }
    }
  };

  const displayUrl = preview || currentPhotoUrl;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Photo Display */}
          <div className="flex flex-col items-center">
            <Avatar className="w-32 h-32 mb-4">
              <AvatarImage src={displayUrl || undefined} alt={studentName} />
              <AvatarFallback className="text-2xl">
                <User className="w-16 h-16" />
              </AvatarFallback>
            </Avatar>
            
            <h3 className="font-medium text-center">{studentName}</h3>
            <p className="text-sm text-gray-600">{studentUsn}</p>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop an image here, or click to select
            </p>
            <p className="text-xs text-gray-500">
              JPEG, PNG, WebP up to 5MB
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3"
              disabled={uploading}
            >
              Select Photo
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {preview && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </Button>
            )}
            
            {currentPhotoUrl && !preview && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex-1"
                disabled={uploading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Photo
              </Button>
            )}
            
            {preview && (
              <Button
                variant="outline"
                onClick={() => {
                  setPreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUpload;
