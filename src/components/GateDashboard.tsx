import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Search, Shield, Clock, User, AlertTriangle, Camera } from 'lucide-react';
import { useGateData } from '@/hooks/useGateData';
import StudentPhotoManager from './StudentPhotoManager';

interface GateDashboardProps {
  onLogout: () => void;
}

const GateDashboard = ({ onLogout }: GateDashboardProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showPhotoManager, setShowPhotoManager] = useState(false);
  const { toast } = useToast();
  
  const { 
    entries, 
    loading, 
    dailyCount, 
    activeEntries, 
    recordGateEntry, 
    searchStudents 
  } = useGateData();

  const handleNFCScan = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a student USN to record entry",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    
    try {
      await recordGateEntry(searchQuery.trim());
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setIsScanning(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results = await searchStudents(searchQuery);
    setSearchResults(results);
  };

  const selectStudent = (student: any) => {
    setSearchQuery(student.usn);
    setSearchResults([]);
  };

  const getSecurityStatus = () => {
    // Simple logic: flag if there are too many active entries
    if (activeEntries > 10) return 'flagged';
    if (activeEntries > 5) return 'pending';
    return 'cleared';
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

  const getTrafficStatus = () => {
    if (activeEntries > 15) return 'Congested';
    if (activeEntries > 25) return 'Closed';
    return 'Normal';
  };

  const getTrafficColor = () => {
    const status = getTrafficStatus();
    const colors = {
      Normal: 'text-green-600',
      Congested: 'text-orange-600',
      Closed: 'text-red-600'
    };
    return colors[status];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gate data...</p>
        </div>
      </div>
    );
  }

  if (showPhotoManager) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        {/* Header */}
        <header className="bg-green-900 text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Student Photo Manager</h1>
              <p className="text-green-200">AccessCircle - Photo Management</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="text-white border-white hover:bg-green-800" onClick={() => setShowPhotoManager(false)}>
                Back to Dashboard
              </Button>
              <Button variant="secondary" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6">
          <StudentPhotoManager />
        </div>
      </div>
    );
  }

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
            <Button variant="outline" className="text-white border-white hover:bg-green-800" onClick={() => setShowPhotoManager(true)}>
              <Camera className="w-4 h-4 mr-2" />
              Manage Photos
            </Button>
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
                disabled={isScanning || !searchQuery.trim()}
              >
                {isScanning ? 'Recording Entry...' : 'Record Entry'}
              </Button>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{dailyCount}</p>
                  <p className="text-sm text-gray-600">Today's Entries</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className={`text-2xl font-bold ${getTrafficColor()}`}>{getTrafficStatus()}</p>
                  <p className="text-sm text-gray-600">Traffic Status</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{activeEntries}</p>
                  <p className="text-sm text-gray-600">Active Entries</p>
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
              Student Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student USN or name..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button className="w-full" onClick={handleSearch}>
                Search
              </Button>
              
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {searchResults.map((student) => (
                    <div 
                      key={student.usn}
                      className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => selectStudent(student)}
                    >
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.usn}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Entry Log - Updated to show photos properly */}
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
              {entries.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No entries recorded yet</p>
              ) : (
                entries.map((entry) => (
                  <div 
                    key={entry.log_id} 
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      getSecurityStatus() === 'flagged' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage 
                          src={entry.student?.image_url} 
                          alt={entry.student?.name || 'Student'} 
                        />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{entry.student?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">{entry.student?.usn || entry.nfc_uid_scanner}</p>
                        <p className="text-xs text-gray-500">
                          {entry.entry_time ? new Date(entry.entry_time).toLocaleString() : 'No entry time'}
                          {entry.exit_time && ` - ${new Date(entry.exit_time).toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getSecurityBadge(entry.exit_time ? 'cleared' : 'pending')}
                      <span className="text-xs text-gray-500">
                        {entry.exit_time ? 'Exited' : 'Active'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GateDashboard;
