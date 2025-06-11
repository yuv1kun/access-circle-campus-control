
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Shield, Clock, User, AlertTriangle } from 'lucide-react';

interface HostelDashboardProps {
  onLogout: () => void;
}

interface HostelEntry {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  entryTime: string;
  exitTime?: string;
  isLate: boolean;
}

const HostelDashboard = ({ onLogout }: HostelDashboardProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEntries, setRecentEntries] = useState<HostelEntry[]>([]);
  const [lateEntries, setLateEntries] = useState<HostelEntry[]>([]);
  const { toast } = useToast();

  const sampleEntries: HostelEntry[] = [
    { id: '1', studentId: 'CS21001', studentName: 'John Doe', roomNumber: 'A-101', entryTime: '2024-06-11 19:30', isLate: false },
    { id: '2', studentId: 'CS21002', studentName: 'Jane Smith', roomNumber: 'B-205', entryTime: '2024-06-11 22:15', isLate: true },
    { id: '3', studentId: 'CS21003', studentName: 'Mike Johnson', roomNumber: 'C-304', entryTime: '2024-06-11 21:45', isLate: false },
  ];

  useEffect(() => {
    setRecentEntries(sampleEntries);
    setLateEntries(sampleEntries.filter(entry => entry.isLate));
  }, []);

  const handleNFCScan = (type: 'in' | 'out') => {
    setIsScanning(true);
    
    setTimeout(() => {
      const currentTime = new Date();
      const isAfterCurfew = currentTime.getHours() > 22 || (currentTime.getHours() === 22 && currentTime.getMinutes() > 0);
      
      const mockEntry: HostelEntry = {
        id: Date.now().toString(),
        studentId: 'CS21006',
        studentName: 'Alice Brown',
        roomNumber: 'D-402',
        entryTime: currentTime.toLocaleString(),
        isLate: type === 'in' && isAfterCurfew
      };

      if (type === 'out') {
        mockEntry.exitTime = currentTime.toLocaleString();
      }

      setRecentEntries(prev => [mockEntry, ...prev.slice(0, 9)]);
      
      if (mockEntry.isLate) {
        setLateEntries(prev => [mockEntry, ...prev]);
        toast({
          title: "Late Entry Detected",
          description: `${mockEntry.studentName} entered after curfew time`,
          variant: "destructive",
        });
      } else {
        toast({
          title: `Student ${type === 'in' ? 'Check-In' : 'Check-Out'}`,
          description: `${mockEntry.studentName} (${mockEntry.roomNumber}) recorded`,
        });
      }
      
      setIsScanning(false);
    }, 2000);
  };

  const getTimeBadge = (isLate: boolean) => {
    return (
      <Badge variant={isLate ? 'destructive' : 'default'}>
        {isLate ? 'LATE' : 'ON TIME'}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
      {/* Header */}
      <header className="bg-red-900 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Hostel Admin Dashboard</h1>
            <p className="text-red-200">AccessCircle - Residential Management</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="text-white border-white hover:bg-red-800">
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
              <Shield className="w-5 h-5" />
              Hostel Entry/Exit System
            </CardTitle>
            <CardDescription>Curfew enforcement and residential tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button 
                size="lg" 
                className="h-20 bg-green-600 hover:bg-green-700"
                onClick={() => handleNFCScan('in')}
                disabled={isScanning}
              >
                {isScanning ? 'Scanning...' : 'Check-In'}
              </Button>
              <Button 
                size="lg" 
                className="h-20 bg-red-600 hover:bg-red-700"
                onClick={() => handleNFCScan('out')}
                disabled={isScanning}
              >
                {isScanning ? 'Scanning...' : 'Check-Out'}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{recentEntries.length}</p>
                <p className="text-sm text-gray-600">Total Entries</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{lateEntries.length}</p>
                <p className="text-sm text-gray-600">Late Entries</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">22:00</p>
                <p className="text-sm text-gray-600">Curfew Time</p>
              </div>
            </div>
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
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by room or student ID..."
              />
              <Button className="w-full">Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Late Entries Alert */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Late Entries
            </CardTitle>
            <CardDescription>Post-curfew arrivals requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lateEntries.map((entry) => (
                <div key={entry.id} className="p-2 border border-red-200 rounded bg-red-50">
                  <p className="font-medium text-sm">{entry.studentName}</p>
                  <p className="text-xs text-gray-600">{entry.roomNumber} • {entry.entryTime}</p>
                </div>
              ))}
              {lateEntries.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No late entries today</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Entries Log */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Entry/Exit Log
            </CardTitle>
            <CardDescription>Complete hostel access history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    entry.isLate ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium">{entry.studentName}</p>
                      <p className="text-sm text-gray-600">{entry.studentId} • Room {entry.roomNumber}</p>
                      <p className="text-xs text-gray-500">
                        In: {entry.entryTime} {entry.exitTime && `• Out: ${entry.exitTime}`}
                      </p>
                    </div>
                  </div>
                  {getTimeBadge(entry.isLate)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HostelDashboard;
