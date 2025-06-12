
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Play, Square, Smartphone, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { getNFCService, NFCServiceInterface } from '@/services/nfcService';

interface NFCScannerProps {
  onScanSuccess: (nfcUid: string) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

const NFCScanner = ({ onScanSuccess, isScanning, setIsScanning }: NFCScannerProps) => {
  const [nfcService, setNfcService] = useState<NFCServiceInterface | null>(null);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [serviceType, setServiceType] = useState<'native' | 'web' | 'simulation'>('simulation');
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

  const startScanning = async () => {
    if (!nfcService) {
      toast({
        title: "NFC Error",
        description: "NFC service not available",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setScanCount(0);

    try {
      await nfcService.startScanning((uid: string) => {
        console.log('NFC tag scanned:', uid);
        onScanSuccess(uid);
        setScanCount(prev => prev + 1);
      });

      // Show appropriate toast based on service type
      if (serviceType === 'simulation') {
        toast({
          title: "Demo Mode",
          description: "NFC simulation started. Random scans will occur every 3-8 seconds.",
        });
      } else {
        toast({
          title: "NFC Scanning Started",
          description: "Ready to scan NFC tags",
        });
      }
    } catch (error) {
      console.error('NFC scan error:', error);
      setIsScanning(false);
      
      toast({
        title: "NFC Error",
        description: `Failed to start NFC scanning: ${error}`,
        variant: "destructive",
      });
    }
  };

  const stopScanning = async () => {
    if (!nfcService) return;

    try {
      await nfcService.stopScanning();
      setIsScanning(false);
      
      toast({
        title: "Scanning Stopped",
        description: `Total scans: ${scanCount}`,
      });
    } catch (error) {
      console.error('Error stopping NFC scan:', error);
      setIsScanning(false);
    }
  };

  const getServiceIcon = () => {
    switch (serviceType) {
      case 'native':
        return <Smartphone className="w-5 h-5 text-green-600" />;
      case 'web':
        return <Globe className="w-5 h-5 text-blue-600" />;
      default:
        return nfcSupported ? (
          <Wifi className="w-5 h-5 text-green-600" />
        ) : (
          <WifiOff className="w-5 h-5 text-orange-600" />
        );
    }
  };

  const getServiceLabel = () => {
    switch (serviceType) {
      case 'native':
        return 'Native NFC Ready';
      case 'web':
        return 'Web NFC Ready';
      default:
        return nfcSupported ? 'NFC Ready' : 'NFC Simulation Mode';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getServiceIcon()}
          <span className="text-sm font-medium">
            {getServiceLabel()}
          </span>
          {Capacitor.isNativePlatform() && (
            <Badge variant="outline" className="text-xs">
              {Capacitor.getPlatform()}
            </Badge>
          )}
        </div>
        
        <Badge variant={isScanning ? 'default' : 'secondary'}>
          {isScanning ? 'Scanning...' : 'Idle'}
        </Badge>
      </div>

      <Button
        size="lg"
        className={`w-full h-16 ${
          isScanning 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
        onClick={isScanning ? stopScanning : startScanning}
        disabled={!nfcService}
      >
        {isScanning ? (
          <>
            <Square className="w-6 h-6 mr-2" />
            Stop Scanning
          </>
        ) : (
          <>
            <Play className="w-6 h-6 mr-2" />
            Start NFC Scanning
          </>
        )}
      </Button>

      {isScanning && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-700">
              Scans detected: {scanCount}
            </span>
          </div>
        </div>
      )}

      {serviceType === 'simulation' && (
        <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded">
          Demo mode active. Deploy to mobile app for real NFC scanning.
        </div>
      )}
    </div>
  );
};

export default NFCScanner;
