
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Shield, Clock, User, AlertTriangle } from 'lucide-react';

interface GateDashboardProps {
  onLogout: () => void;
}

interface GateEntry {
  id: string;
  studentId: string;
  studentName: string;
  entryTime: string;
  securityStatus: 'cleared' | 'flagged' | 'pending';
}

const GateDashboard = ({ onLogout }: GateDashboardProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEntries, setRecentEntries] = useState<GateEntry[]>([]);
  const [trafficStatus, setTrafficStatus] = useState<'Normal' | 'Congested' | 'Closed'>('Normal');
  const { toast } = useToast();

  const sampleEntries: GateEntry[] = [
    { id: '1', studentId: 'CS21001', studentName: 'John Doe', entryTime: '2024-06-11 08:30', securityStatus: 'cleared' },
    { id: '2', studentId: 'CS21002', studentName: 'Jane Smith', entryTime: '2024-06-11 08:25', securityStatus: 'cleared' },
    { id: '3', studentId: 'CS21003', studentName: 'Mike Johnson', entryTime: '2024-06-11 08:20', securityStatus: 'flagged' },
  ];

  useEffect(() => {
    setRecentEntries(sampleEntries);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      const newEntry: GateEntry = {
        id: Date.now().toString(),
        studentId: `CS210${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
        studentName: `Student ${Math.floor(Math.random() * 100)}`,
        entryTime: new Date().toLocaleString(),
        securityStatus: Math.random() > 0.9 ? 'flagged' : 'cleared'
      };
      
      setRecentEntries(prev => [newEntry, ...prev.slice(0, 9)]);
    }, 30000); // New entry every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNFCScan = () => {
    setIsScanning(true);
    
    setTimeout(() => {
      const mockEntry: GateEntry = {
        id: Date.now().toString(),
        studentId: 'CS21005',
        studentName: 'Alice Brown',
        entryTime: new Date().toLocaleString(),
        securityStatus: 'cleared'
      };

      setRecentEntries(prev => [mockEntry, ...prev.slice(0, 9)]);
      setIsScanning(false);
      
      toast({
        title: "Entry Recorded",
        description: `${mockEntry.studentName} (${mockEntry.studentId}) entry logged successfully`,
      });
    }, 2000);
  };

  const getSecurityBadge = (status: string) => {
    const variants = {
      cleared: 'default',
      pending: 'secondary',
      flagged: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getTrafficColor = () => {
    const colors = {
      Normal: 'text-green-600',
      Congested: 'text-orange-600',
      Closed: 'text-red-600'
    };
    return colors[trafficStatus];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-green-900 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Main Gate Dashboard</h1>
            <p className="text-green-200">AccessCircle - Entry Management</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="text-white border-white hover:bg-green-800">
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
              Gate Entry Recording
            </CardTitle>
            <CardDescription>24/7 NFC monitoring system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full h-20 bg-green-600 hover:bg-green-700"
                onClick={handleNFCScan}
                disabled={isScanning}
              >
                {isScanning ? 'Recording Entry...' : 'Record Entry'}
              </Button>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{recentEntries.length}</p>
                  <p className="text-sm text-gray-600">Today's Entries</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className={`text-2xl font-bold ${getTrafficColor()}`}>{trafficStatus}</p>
                  <p className="text-sm text-gray-600">Traffic Status</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {recentEntries.filter(e => e.securityStatus === 'flagged').length}
                  </p>
                  <p className="text-sm text-gray-600">Security Alerts</p>
                </div>
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
                placeholder="Search student ID..."
              />
              <Button className="w-full">Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Entry Log */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Live Entry Log
            </CardTitle>
            <CardDescription>Real-time gate entry monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    entry.securityStatus === 'flagged' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium">{entry.studentName}</p>
                      <p className="text-sm text-gray-600">{entry.studentId}</p>
                      <p className="text-xs text-gray-500">{entry.entryTime}</p>
                    </div>
                  </div>
                  {getSecurityBadge(entry.securityStatus)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GateDashboard;
