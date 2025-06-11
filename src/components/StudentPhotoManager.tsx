
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PhotoUpload from './PhotoUpload';

interface Student {
  usn: string;
  name: string;
  image_url?: string;
}

const StudentPhotoManager = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchStudents = async () => {
    if (!searchQuery.trim()) {
      setStudents([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('usn, name, image_url')
        .or(`name.ilike.%${searchQuery}%,usn.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpdated = (studentUsn: string, newUrl: string | null) => {
    // Update the student in the local state
    setStudents(prev => 
      prev.map(student => 
        student.usn === studentUsn 
          ? { ...student, image_url: newUrl || undefined }
          : student
      )
    );

    // Update selected student if it's the same one
    if (selectedStudent?.usn === studentUsn) {
      setSelectedStudent(prev => 
        prev ? { ...prev, image_url: newUrl || undefined } : null
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Photo Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student by name or USN..."
              onKeyPress={(e) => e.key === 'Enter' && searchStudents()}
            />
            <Button onClick={searchStudents} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {students.length > 0 && (
            <div className="space-y-2 mb-6">
              <h3 className="font-medium">Search Results:</h3>
              <div className="grid gap-2 max-h-40 overflow-y-auto">
                {students.map((student) => (
                  <div 
                    key={student.usn}
                    className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      selectedStudent?.usn === student.usn ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.usn}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.image_url ? 'Has Photo' : 'No Photo'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <div className="flex justify-center">
          <PhotoUpload
            studentUsn={selectedStudent.usn}
            currentPhotoUrl={selectedStudent.image_url}
            studentName={selectedStudent.name}
            onPhotoUpdated={(newUrl) => handlePhotoUpdated(selectedStudent.usn, newUrl)}
          />
        </div>
      )}
    </div>
  );
};

export default StudentPhotoManager;
