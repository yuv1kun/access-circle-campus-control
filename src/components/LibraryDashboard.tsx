
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, BookOpen, Clock, User, AlertTriangle } from 'lucide-react';

interface LibraryDashboardProps {
  onLogout: () => void;
}

interface Student {
  id: string;
  name: string;
  photo: string;
  lastVisits: string[];
}

interface BookTransaction {
  id: string;
  studentId: string;
  studentName: string;
  bookTitle: string;
  issueDate: string;
  status: 'issued' | 'returned' | 'overdue';
}

const LibraryDashboard = ({ onLogout }: LibraryDashboardProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentActivity, setRecentActivity] = useState<BookTransaction[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  // Sample data
  const sampleTransactions: BookTransaction[] = [
    { id: '1', studentId: 'CS21001', studentName: 'John Doe', bookTitle: 'Data Structures', issueDate: '2024-06-10', status: 'issued' },
    { id: '2', studentId: 'CS21002', studentName: 'Jane Smith', bookTitle: 'Machine Learning', issueDate: '2024-06-09', status: 'returned' },
    { id: '3', studentId: 'CS21003', studentName: 'Mike Johnson', bookTitle: 'Database Systems', issueDate: '2024-06-05', status: 'overdue' },
  ];

  useEffect(() => {
    setRecentActivity(sampleTransactions);
  }, []);

  const handleNFCScan = (type: 'in' | 'out') => {
    setIsScanning(true);
    
    // Simulate NFC scan
    setTimeout(() => {
      const mockStudent: Student = {
        id: 'CS21004',
        name: 'Alice Brown',
        photo: '/placeholder.svg',
        lastVisits: ['2024-06-09 14:30', '2024-06-08 10:15', '2024-06-07 16:45']
      };

      setCurrentStudent(mockStudent);
      setIsScanning(false);
      
      toast({
        title: `Student ${type === 'in' ? 'Check-In' : 'Check-Out'} Successful`,
        description: `${mockStudent.name} (${mockStudent.id}) recorded at ${new Date().toLocaleTimeString()}`,
      });
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      issued: 'default',
      returned: 'secondary',
      overdue: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Library Admin Dashboard</h1>
            <p className="text-blue-200">AccessCircle - Library Management</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="text-white border-white hover:bg-blue-800">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Alert
            </Button>
            <Button variant="secondary" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NFC Scanning Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              NFC Scanning System
            </CardTitle>
            <CardDescription>Scan student NFC rings for entry/exit tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button 
                size="lg" 
                className="h-20 bg-green-600 hover:bg-green-700"
                onClick={() => handleNFCScan('in')}
                disabled={isScanning}
              >
                {isScanning ? 'Scanning...' : 'Scan In'}
              </Button>
              <Button 
                size="lg" 
                className="h-20 bg-red-600 hover:bg-red-700"
                onClick={() => handleNFCScan('out')}
                disabled={isScanning}
              >
                {isScanning ? 'Scanning...' : 'Scan Out'}
              </Button>
            </div>

            {currentStudent && (
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold mb-2">Last Scanned Student</h3>
                <div className="flex items-center gap-4">
                  <img 
                    src={currentStudent.photo} 
                    alt={currentStudent.name}
                    className="w-12 h-12 rounded-full bg-gray-200"
                  />
                  <div>
                    <p className="font-medium">{currentStudent.name}</p>
                    <p className="text-sm text-gray-600">{currentStudent.id}</p>
                    <p className="text-xs text-gray-500">Last visits: {currentStudent.lastVisits[0]}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Quick Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search">Student ID / Name</Label>
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students..."
                />
              </div>
              <Button className="w-full">Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Book Management */}
        <Card>
          <CardHeader>
            <CardTitle>Book Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Issue Books
              </Button>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                Return Books
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium">{transaction.studentName}</p>
                      <p className="text-sm text-gray-600">{transaction.bookTitle}</p>
                      <p className="text-xs text-gray-500">{transaction.issueDate}</p>
                    </div>
                  </div>
                  {getStatusBadge(transaction.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LibraryDashboard;
