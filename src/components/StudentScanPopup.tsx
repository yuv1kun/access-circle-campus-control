
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Student {
  usn: string;
  name: string;
  image_url?: string;
  blood_group?: string;
  contact_no?: string;
  valid_upto: string;
}

interface StudentScanPopupProps {
  isOpen: boolean;
  student: Student | null;
  scanSuccess: boolean;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const StudentScanPopup = ({ 
  isOpen, 
  student, 
  scanSuccess, 
  onClose, 
  autoClose = true, 
  autoCloseDelay = 3000 
}: StudentScanPopupProps) => {
  const [timeLeft, setTimeLeft] = useState(autoCloseDelay / 1000);

  useEffect(() => {
    if (isOpen && autoClose) {
      setTimeLeft(autoCloseDelay / 1000);
      
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      const countdown = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdown);
      };
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  const isValidStudent = () => {
    if (!student) return false;
    const validUpto = new Date(student.valid_upto);
    const today = new Date();
    return validUpto > today;
  };

  const getStatusBadge = () => {
    if (!scanSuccess) {
      return <Badge variant="destructive">Scan Failed</Badge>;
    }
    if (!student) {
      return <Badge variant="destructive">Student Not Found</Badge>;
    }
    if (!isValidStudent()) {
      return <Badge variant="destructive">ID Expired</Badge>;
    }
    return <Badge variant="default" className="bg-green-600">Access Granted</Badge>;
  };

  const getStatusIcon = () => {
    if (!scanSuccess || !student || !isValidStudent()) {
      return <XCircle className="w-12 h-12 text-red-500" />;
    }
    return <CheckCircle className="w-12 h-12 text-green-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Scan Result</span>
            {autoClose && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {timeLeft}s
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          {/* Status Icon */}
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            {getStatusBadge()}
          </div>

          {/* Student Information */}
          {student ? (
            <div className="w-full space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage 
                    src={student.image_url} 
                    alt={student.name} 
                  />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.usn}</p>
                  {student.blood_group && (
                    <p className="text-sm text-gray-500">Blood Group: {student.blood_group}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Valid Until:</span>
                  <p className={`${isValidStudent() ? 'text-green-600' : 'text-red-600'}`}>
                    {new Date(student.valid_upto).toLocaleDateString()}
                  </p>
                </div>
                {student.contact_no && (
                  <div>
                    <span className="font-medium">Contact:</span>
                    <p className="text-gray-600">{student.contact_no}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600">
                {scanSuccess ? 'Student record not found in database' : 'Failed to read NFC tag'}
              </p>
            </div>
          )}

          {/* Entry Status */}
          <div className="w-full pt-4 border-t">
            <div className="text-center">
              <p className="text-sm font-medium">
                {scanSuccess && student && isValidStudent() 
                  ? '✅ Entry Recorded Successfully' 
                  : '❌ Entry Denied'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentScanPopup;
