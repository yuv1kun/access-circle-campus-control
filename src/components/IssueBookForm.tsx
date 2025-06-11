
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Student } from '@/hooks/useLibraryData';

interface IssueBookFormProps {
  isOpen: boolean;
  onClose: () => void;
  onIssue: (studentUsn: string, bookTitle: string, bookId: string) => Promise<void>;
  currentStudent?: Student | null;
}

const IssueBookForm = ({ isOpen, onClose, onIssue, currentStudent }: IssueBookFormProps) => {
  const [studentUsn, setStudentUsn] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookId, setBookId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (currentStudent) {
      setStudentUsn(currentStudent.usn);
    }
  }, [currentStudent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentUsn || !bookTitle || !bookId) return;

    setIsLoading(true);
    try {
      await onIssue(studentUsn, bookTitle, bookId);
      setStudentUsn('');
      setBookTitle('');
      setBookId('');
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
            <Label htmlFor="studentUsn">Student USN</Label>
            <Input
              id="studentUsn"
              value={studentUsn}
              onChange={(e) => setStudentUsn(e.target.value)}
              placeholder="Enter student USN"
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
            <Label htmlFor="bookId">Book ID</Label>
            <Input
              id="bookId"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              placeholder="Enter book ID"
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
