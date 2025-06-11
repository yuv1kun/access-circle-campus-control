
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, AlertTriangle } from 'lucide-react';
import { useHostelData } from '@/hooks/useHostelData';

const HostelNFCScanner = () => {
  const { addEntry, isAddingEntry, stats } = useHostelData();
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [scanType, setScanType] = useState<'in' | 'out' | null>(null);

  const handleNFCScan = (type: 'in' | 'out') => {
    const now = Date.now();
    
    // Prevent duplicate scans within 5 seconds
    if (now - lastScanTime < 5000) {
      return;
    }
    
    setLastScanTime(now);
    setScanType(type);
    
    // Simulate NFC scan with mock data - in real implementation, this would read from NFC device
    const mockNFCUids = [
      'NFC001ABC123',
      'NFC002DEF456', 
      'NFC003GHI789',
      'NFC004JKL012',
      'NFC005MNO345'
    ];
    
    const randomNFC = mockNFCUids[Math.floor(Math.random() * mockNFCUids.length)];
    
    addEntry({
      nfcUid: randomNFC,
      type: type,
      readerId: 'HOSTEL_READER_01'
    });
    
    // Reset scan type after operation
    setTimeout(() => setScanType(null), 2000);
  };

  const isRecentScan = (type: 'in' | 'out') => {
    return scanType === type && (Date.now() - lastScanTime < 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Hostel Entry/Exit System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Scan Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              size="lg" 
              className="h-20 bg-green-600 hover:bg-green-700 relative"
              onClick={() => handleNFCScan('in')}
              disabled={isAddingEntry}
            >
              {isRecentScan('in') ? (
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                  <span>Scanning...</span>
                </div>
              ) : (
                'Check-In'
              )}
            </Button>
            
            <Button 
              size="lg" 
              className="h-20 bg-red-600 hover:bg-red-700 relative"
              onClick={() => handleNFCScan('out')}
              disabled={isAddingEntry}
            >
              {isRecentScan('out') ? (
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                  <span>Scanning...</span>
                </div>
              ) : (
                'Check-Out'
              )}
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.totalEntries}</p>
              <p className="text-sm text-gray-600">Total Entries</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{stats.lateEntries}</p>
              <p className="text-sm text-gray-600">Late Entries</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.currentOccupancy}</p>
              <p className="text-sm text-gray-600">Current Occupancy</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.curfewTime}</p>
              <p className="text-sm text-gray-600">Curfew Time</p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">System Status</span>
            </div>
            <Badge variant="default">Online</Badge>
          </div>
          
          {stats.lateEntries > 0 && (
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-700">Late entries detected today</span>
              </div>
              <Badge variant="destructive">{stats.lateEntries}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HostelNFCScanner;
