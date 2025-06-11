
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NFCScannerProps {
  onScanSuccess: (nfcUid: string) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

const NFCScanner = ({ onScanSuccess, isScanning, setIsScanning }: NFCScannerProps) => {
  const [nfcSupported, setNfcSupported] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Sample NFC UIDs for simulation
  const sampleNFCUids = [
    'NFC001ABC123',
    'NFC002DEF456', 
    'NFC003GHI789',
    'NFC004JKL012',
    'NFC005MNO345'
  ];

  useEffect(() => {
    // Check if NFC is supported
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    }
  }, []);

  const startScanning = async () => {
    setIsScanning(true);
    setScanCount(0);

    if (nfcSupported && 'NDEFReader' in window) {
      try {
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        
        ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
          console.log('NFC tag scanned:', serialNumber);
          onScanSuccess(serialNumber);
          setScanCount(prev => prev + 1);
        });

        ndef.addEventListener('readingerror', () => {
          toast({
            title: "NFC Read Error",
            description: "Failed to read NFC tag. Please try again.",
            variant: "destructive",
          });
        });
      } catch (error) {
        console.error('NFC scan error:', error);
        toast({
          title: "NFC Error",
          description: "Failed to start NFC scanning. Using simulation mode.",
          variant: "destructive",
        });
        startSimulatedScanning();
      }
    } else {
      // Fallback to simulated scanning for demo
      startSimulatedScanning();
    }
  };

  const startSimulatedScanning = () => {
    toast({
      title: "Demo Mode",
      description: "NFC simulation started. Random scans will occur every 3-8 seconds.",
    });

    scanIntervalRef.current = setInterval(() => {
      // Randomly select an NFC UID
      const randomUid = sampleNFCUids[Math.floor(Math.random() * sampleNFCUids.length)];
      onScanSuccess(randomUid);
      setScanCount(prev => prev + 1);
    }, Math.random() * 5000 + 3000); // Random interval between 3-8 seconds
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    toast({
      title: "Scanning Stopped",
      description: `Total scans: ${scanCount}`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {nfcSupported ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-orange-600" />
          )}
          <span className="text-sm font-medium">
            {nfcSupported ? 'NFC Ready' : 'NFC Simulation Mode'}
          </span>
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
    </div>
  );
};

export default NFCScanner;
