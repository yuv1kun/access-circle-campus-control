
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BookTransaction } from '@/hooks/useLibraryData';

interface ReturnBookFormProps {
  isOpen: boolean;
  onClose: () => void;
  onReturn: (transactionId: string) => Promise<void>;
  transactions: BookTransaction[];
}

const ReturnBookForm = ({ isOpen, onClose, onReturn, transactions }: ReturnBookFormProps) => {
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const issuedBooks = transactions.filter(t => t.status === 'issued');

  const handleBookSelect = (transactionId: string) => {
    setSelectedBooks(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleSubmit = async () => {
    if (selectedBooks.length === 0) return;

    setIsLoading(true);
    try {
      for (const transactionId of selectedBooks) {
        await onReturn(transactionId);
      }
      setSelectedBooks([]);
      onClose();
    } catch (error) {
      console.error('Return books error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Return Books</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {issuedBooks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No books currently issued</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {issuedBooks.map((transaction) => (
                <div 
                  key={transaction.transaction_id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedBooks.includes(transaction.transaction_id.toString()) 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleBookSelect(transaction.transaction_id.toString())}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Book ID: {transaction.book_id}</p>
                      <p className="text-sm text-gray-600">NFC UID: {transaction.nfc_uid_scanner}</p>
                      <p className="text-xs text-gray-500">
                        Issued: {new Date(transaction.issue_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={
                        new Date(transaction.due_date) < new Date() ? 'destructive' : 'default'
                      }>
                        {transaction.status}
                      </Badge>
                      <input
                        type="checkbox"
                        checked={selectedBooks.includes(transaction.transaction_id.toString())}
                        onChange={() => handleBookSelect(transaction.transaction_id.toString())}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              className="flex-1" 
              disabled={isLoading || selectedBooks.length === 0}
            >
              {isLoading ? 'Processing...' : `Return Selected (${selectedBooks.length})`}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnBookForm;
