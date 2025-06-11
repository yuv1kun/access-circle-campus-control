
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Student } from '@/hooks/useLibraryData';

interface IssueBookFormProps {
  isOpen: boolean;
  onClose: () => void;
  onIssue: (studentId: string, bookTitle: string, bookIsbn: string) => Promise<void>;
  currentStudent?: Student | null;
}

const IssueBookForm = ({ isOpen, onClose, onIssue, currentStudent }: IssueBookFormProps) => {
  const [studentId, setStudentId] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookIsbn, setBookIsbn] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (currentStudent) {
      setStudentId(currentStudent.id);
    }
  }, [currentStudent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !bookTitle || !bookIsbn) return;

    setIsLoading(true);
    try {
      await onIssue(studentId, bookTitle, bookIsbn);
      setStudentId('');
      setBookTitle('');
      setBookIsbn('');
      onClose();
    } catch (error) {
      console.error('Issue book error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Issue Book</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter student ID"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bookTitle">Book Title</Label>
            <Input
              id="bookTitle"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="Enter book title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bookIsbn">Book ISBN</Label>
            <Input
              id="bookIsbn"
              value={bookIsbn}
              onChange={(e) => setBookIsbn(e.target.value)}
              placeholder="Enter book ISBN"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Issuing...' : 'Issue Book'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IssueBookForm;
