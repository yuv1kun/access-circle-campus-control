
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Search, Shield, Clock, User, AlertTriangle, Camera } from 'lucide-react';
import { useGateData } from '@/hooks/useGateData';
import { useNFCScanning } from '@/hooks/useNFCScanning';
import StudentPhotoManager from './StudentPhotoManager';
import NFCScanner from './NFCScanner';
import StudentScanPopup from './StudentScanPopup';
import EmergencyAlertDialog from './EmergencyAlertDialog';
import ExportControls from './ExportControls';
import MobileHeader from './MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';

interface GateDashboardProps {
  onLogout: () => void;
}

const GateDashboard = ({ onLogout }: GateDashboardProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showPhotoManager, setShowPhotoManager] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const { 
    entries, 
    loading, 
    dailyCount, 
    activeEntries, 
    searchStudents 
  } = useGateData();

  const {
    scannedStudent,
    showScanPopup,
    scanSuccess,
    handleNFCScan,
    closeScanPopup
  } = useNFCScanning();

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

  const headerActions = [
    {
      label: 'Manage Photos',
      onClick: () => setShowPhotoManager(true),
      icon: <Camera className="w-4 h-4 mr-2" />
    },
    {
      label: 'Emergency Alert',
      onClick: () => {}, // This will be handled by EmergencyAlertDialog
      icon: <AlertTriangle className="w-4 h-4 mr-2" />
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
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
        <MobileHeader
          title="Student Photo Manager"
          subtitle="AccessCircle - Photo Management"
          backgroundColor="bg-green-900"
          textColor="text-white"
          actions={[]}
          onLogout={onLogout}
        />

        <div className="container mx-auto p-4 sm:p-6">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowPhotoManager(false)}
              className="mobile-button"
            >
              Back to Dashboard
            </Button>
          </div>
          <StudentPhotoManager />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <MobileHeader
        title="Main Gate Dashboard"
        subtitle="AccessCircle - Entry Management"
        backgroundColor="bg-green-900"
        textColor="text-white"
        actions={headerActions}
        onLogout={onLogout}
      />

      <div className={`container mx-auto p-4 sm:p-6 grid grid-cols-1 gap-4 sm:gap-6 ${isMobile ? 'max-w-full' : 'lg:grid-cols-3'}`}>
        {/* NFC Scanning Section */}
        <Card className={isMobile ? 'order-1' : 'lg:col-span-2'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              Gate Entry Recording
            </CardTitle>
            <CardDescription className="text-sm">Continuous NFC monitoring system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <NFCScanner
                onScanSuccess={handleNFCScan}
                isScanning={isScanning}
                setIsScanning={setIsScanning}
              />
              
              <div className={`grid gap-3 text-center ${isMobile ? 'grid-cols-1 space-y-2' : 'grid-cols-3'}`}>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{dailyCount}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Today's Entries</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className={`text-xl sm:text-2xl font-bold ${getTrafficColor()}`}>{getTrafficStatus()}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Traffic Status</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{activeEntries}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Active Entries</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Search */}
        <Card className={isMobile ? 'order-2' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
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
                className="mobile-button"
              />
              <Button className="w-full mobile-button" onClick={handleSearch}>
                Search
              </Button>
              
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  {searchResults.map((student) => (
                    <div 
                      key={student.usn}
                      className="p-3 border rounded cursor-pointer hover:bg-gray-50 mobile-button"
                      onClick={() => selectStudent(student)}
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

        {/* Export Controls */}
        <Card className={isMobile ? 'order-3 col-span-1' : 'lg:col-span-3'}>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Export Gate Logs</CardTitle>
            <CardDescription className="text-sm">Export entry logs to CSV or PDF format</CardDescription>
          </CardHeader>
          <CardContent>
            <ExportControls entries={entries} />
          </CardContent>
        </Card>

        {/* Live Entry Log */}
        <Card className={isMobile ? 'order-4 col-span-1' : 'lg:col-span-3'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              Live Entry Log
            </CardTitle>
            <CardDescription className="text-sm">Real-time gate entry monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
              {entries.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No entries recorded yet</p>
              ) : (
                entries.map((entry) => (
                  <div 
                    key={entry.log_id} 
                    className="flex items-center justify-between p-3 border rounded-lg border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} flex-shrink-0`}>
                        <AvatarImage 
                          src={entry.student?.image_url} 
                          alt={entry.student?.name || 'Student'} 
                        />
                        <AvatarFallback>
                          <User className="w-4 h-4 sm:w-6 sm:h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{entry.student?.name || 'Unknown'}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{entry.student?.usn || entry.nfc_uid_scanner}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {entry.entry_time ? new Date(entry.entry_time).toLocaleString() : 'No entry time'}
                          {entry.exit_time && ` - ${new Date(entry.exit_time).toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
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

      {/* Student Scan Popup */}
      <StudentScanPopup
        isOpen={showScanPopup}
        student={scannedStudent}
        scanSuccess={scanSuccess}
        onClose={closeScanPopup}
      />
    </div>
  );
};

export default GateDashboard;
