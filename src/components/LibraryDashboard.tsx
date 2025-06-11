import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, BookOpen, Clock, User, AlertTriangle, Download, Calendar } from 'lucide-react';
import { useLibraryData, Student } from '@/hooks/useLibraryData';
import IssueBookForm from '@/components/IssueBookForm';
import ReturnBookForm from '@/components/ReturnBookForm';
import EmergencyAlertDialog from '@/components/EmergencyAlertDialog';
import { exportToCSV, exportToPDF, getDateRangeFilter } from '@/utils/exportUtils';

interface LibraryDashboardProps {
  onLogout: () => void;
}

const LibraryDashboard = ({ onLogout }: LibraryDashboardProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const { toast } = useToast();

  const {
    students,
    transactions,
    entries,
    loading,
    searchStudents,
    recordEntry,
    issueBook,
    returnBook,
  } = useLibraryData();

  const handleNFCScan = async (type: 'in' | 'out') => {
    setIsScanning(true);
    
    try {
      // Simulate NFC scan - in real implementation, this would interface with NFC hardware
      setTimeout(async () => {
        const mockStudentUsn = 'CS21004'; // In real app, this comes from NFC scan
        const student = await recordEntry(mockStudentUsn, type);
        setCurrentStudent(student);
        setIsScanning(false);
      }, 2000);
    } catch (error) {
      setIsScanning(false);
      console.error('NFC scan error:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchStudents(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search students",
        variant: "destructive",
      });
    }
  };

  const handleExport = (format: 'csv' | 'pdf', dataType: 'transactions' | 'entries') => {
    const data = dataType === 'transactions' ? transactions : entries;
    const filteredData = getDateRangeFilter(data, dateFilter.start, dateFilter.end);
    
    if (filteredData.length === 0) {
      toast({
        title: "No Data",
        description: "No data available for export",
        variant: "destructive",
      });
      return;
    }

    const filename = `library_${dataType}_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') {
      exportToCSV(filteredData, filename);
    } else {
      exportToPDF(filteredData, filename);
    }

    toast({
      title: "Export Successful",
      description: `${dataType} exported as ${format.toUpperCase()}`,
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-blue-900">Loading library data...</p>
        </div>
      </div>
    );
  }

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
            <EmergencyAlertDialog>
              <Button variant="outline" className="text-black bg-white border-white hover:bg-gray-100">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Emergency Alert
              </Button>
            </EmergencyAlertDialog>
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
                    src={currentStudent.image_url || '/placeholder.svg'} 
                    alt={currentStudent.name}
                    className="w-12 h-12 rounded-full bg-gray-200"
                  />
                  <div>
                    <p className="font-medium">{currentStudent.name}</p>
                    <p className="text-sm text-gray-600">{currentStudent.usn}</p>
                    <p className="text-xs text-gray-500">
                      Scanned at: {new Date().toLocaleString()}
                    </p>
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
                <Label htmlFor="search">Student USN / Name</Label>
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button className="w-full" onClick={handleSearch}>Search</Button>
              
              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {searchResults.map((student) => (
                    <div 
                      key={student.usn}
                      className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => setCurrentStudent(student)}
                    >
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-gray-600">{student.usn}</p>
                    </div>
                  ))}
                </div>
              )}
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
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowIssueForm(true)}
              >
                Issue Books
              </Button>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={() => setShowReturnForm(true)}
              >
                Return Books
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export & Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export & Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-xs">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                    className="text-xs"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Export Transactions:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExport('csv', 'transactions')}
                  >
                    CSV
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExport('pdf', 'transactions')}
                  >
                    PDF
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Export Entries:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExport('csv', 'entries')}
                  >
                    CSV
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExport('pdf', 'entries')}
                  >
                    PDF
                  </Button>
                </div>
              </div>
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
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent transactions</p>
              ) : (
                transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.transaction_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="font-medium">Book ID: {transaction.book_id}</p>
                        <p className="text-sm text-gray-600">NFC UID: {transaction.nfc_uid_scanner}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.issue_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(transaction.status)}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forms */}
      <IssueBookForm 
        isOpen={showIssueForm}
        onClose={() => setShowIssueForm(false)}
        onIssue={issueBook}
        currentStudent={currentStudent}
      />
      
      <ReturnBookForm 
        isOpen={showReturnForm}
        onClose={() => setShowReturnForm(false)}
        onReturn={returnBook}
        transactions={transactions}
      />
    </div>
  );
};

export default LibraryDashboard;
