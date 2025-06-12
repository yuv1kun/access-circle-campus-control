
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, AlertTriangle, Smartphone, Globe } from 'lucide-react';
import { useHostelData } from '@/hooks/useHostelData';
import { getNFCService, NFCServiceInterface } from '@/services/nfcService';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

const HostelNFCScanner = () => {
  const { addEntry, isAddingEntry, stats } = useHostelData();
  const [nfcService, setNfcService] = useState<NFCServiceInterface | null>(null);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [serviceType, setServiceType] = useState<'native' | 'web' | 'simulation'>('simulation');
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [scanType, setScanType] = useState<'in' | 'out' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeNFC = async () => {
      try {
        const service = await getNFCService();
        setNfcService(service);
        
        const supported = await service.isSupported();
        setNfcSupported(supported);

        // Determine service type for display
        if (Capacitor.isNativePlatform() && supported) {
          setServiceType('native');
        } else if ('NDEFReader' in window && supported) {
          setServiceType('web');
        } else {
          setServiceType('simulation');
        }
      } catch (error) {
        console.error('Failed to initialize NFC service:', error);
        setNfcSupported(false);
        setServiceType('simulation');
      }
    };

    initializeNFC();
  }, []);

  const handleNFCScan = async (type: 'in' | 'out') => {
    if (!nfcService) {
      toast({
        title: "NFC Error",
        description: "NFC service not available",
        variant: "destructive",
      });
      return;
    }

    const now = Date.now();
    
    // Prevent duplicate scans within 5 seconds
    if (now - lastScanTime < 5000) {
      return;
    }
    
    setLastScanTime(now);
    setScanType(type);

    try {
      if (serviceType === 'simulation') {
        // Use simulation for immediate response in demo mode
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

        toast({
          title: `Check-${type} Simulated`,
          description: "Demo mode - simulated NFC scan completed",
        });
      } else {
        // Start scanning for real NFC
        await nfcService.startScanning((uid: string) => {
          console.log('Hostel NFC scan:', uid);
          
          addEntry({
            nfcUid: uid,
            type: type,
            readerId: 'HOSTEL_READER_01'
          });

          // Stop scanning after successful scan
          nfcService.stopScanning();

          toast({
            title: `Check-${type} Recorded`,
            description: "NFC scan completed successfully",
          });
        });

        toast({
          title: "Ready to Scan",
          description: `Hold NFC tag near device for check-${type}`,
        });

        // Auto-stop scanning after 10 seconds
        setTimeout(() => {
          if (nfcService.isScanning()) {
            nfcService.stopScanning();
            toast({
              title: "Scan Timeout",
              description: "Please try scanning again",
              variant: "destructive",
            });
          }
        }, 10000);
      }
    } catch (error) {
      console.error('NFC scan error:', error);
      toast({
        title: "Scan Error",
        description: `Failed to scan: ${error}`,
        variant: "destructive",
      });
    }
    
    // Reset scan type after operation
    setTimeout(() => setScanType(null), 2000);
  };

  const isRecentScan = (type: 'in' | 'out') => {
    return scanType === type && (Date.now() - lastScanTime < 2000);
  };

  const getServiceIcon = () => {
    switch (serviceType) {
      case 'native':
        return <Smartphone className="w-4 h-4 text-green-600" />;
      case 'web':
        return <Globe className="w-4 h-4 text-blue-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Hostel Entry/Exit System
          <div className="flex items-center gap-1 ml-auto">
            {getServiceIcon()}
            {Capacitor.isNativePlatform() && (
              <Badge variant="outline" className="text-xs">
                {Capacitor.getPlatform()}
              </Badge>
            )}
          </div>
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
              disabled={isAddingEntry || !nfcService}
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
              disabled={isAddingEntry || !nfcService}
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

          {serviceType === 'simulation' && (
            <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded">
              Demo mode active. Deploy to mobile app for real NFC scanning.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HostelNFCScanner;
