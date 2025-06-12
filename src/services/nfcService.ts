
import { Capacitor } from '@capacitor/core';

export interface NFCServiceInterface {
  isSupported(): Promise<boolean>;
  requestPermissions(): Promise<boolean>;
  startScanning(callback: (uid: string) => void): Promise<void>;
  stopScanning(): Promise<void>;
  isScanning(): boolean;
}

class CapacitorNFCService implements NFCServiceInterface {
  private scanningCallback: ((uid: string) => void) | null = null;
  private isCurrentlyScanning = false;

  async isSupported(): Promise<boolean> {
    // For now, return false since we don't have the NFC plugin
    // This will cause the factory to fall back to Web NFC or simulation
    return false;
  }

  async requestPermissions(): Promise<boolean> {
    return false;
  }

  async startScanning(callback: (uid: string) => void): Promise<void> {
    throw new Error('Native NFC plugin not available');
  }

  async stopScanning(): Promise<void> {
    this.isCurrentlyScanning = false;
    this.scanningCallback = null;
  }

  isScanning(): boolean {
    return this.isCurrentlyScanning;
  }
}

class WebNFCService implements NFCServiceInterface {
  private ndefReader: any = null;
  private isCurrentlyScanning = false;
  private scanningCallback: ((uid: string) => void) | null = null;

  async isSupported(): Promise<boolean> {
    return 'NDEFReader' in window;
  }

  async requestPermissions(): Promise<boolean> {
    // Web NFC doesn't require explicit permission request
    return true;
  }

  async startScanning(callback: (uid: string) => void): Promise<void> {
    if (!('NDEFReader' in window)) {
      throw new Error('Web NFC not supported');
    }

    try {
      this.ndefReader = new (window as any).NDEFReader();
      this.scanningCallback = callback;
      this.isCurrentlyScanning = true;

      await this.ndefReader.scan();

      this.ndefReader.addEventListener('reading', ({ message, serialNumber }: any) => {
        console.log('Web NFC tag scanned:', serialNumber);
        if (this.scanningCallback) {
          this.scanningCallback(serialNumber);
        }
      });

      this.ndefReader.addEventListener('readingerror', () => {
        console.error('Web NFC read error');
      });
    } catch (error) {
      this.isCurrentlyScanning = false;
      throw error;
    }
  }

  async stopScanning(): Promise<void> {
    this.isCurrentlyScanning = false;
    this.scanningCallback = null;
    this.ndefReader = null;
  }

  isScanning(): boolean {
    return this.isCurrentlyScanning;
  }
}

class SimulatedNFCService implements NFCServiceInterface {
  private intervalId: NodeJS.Timeout | null = null;
  private scanningCallback: ((uid: string) => void) | null = null;
  private isCurrentlyScanning = false;

  private sampleNFCUids = [
    'NFC001ABC123',
    'NFC002DEF456', 
    'NFC003GHI789',
    'NFC004JKL012',
    'NFC005MNO345'
  ];

  async isSupported(): Promise<boolean> {
    return true; // Simulation always supported
  }

  async requestPermissions(): Promise<boolean> {
    return true; // No permissions needed for simulation
  }

  async startScanning(callback: (uid: string) => void): Promise<void> {
    this.scanningCallback = callback;
    this.isCurrentlyScanning = true;

    this.intervalId = setInterval(() => {
      const randomUid = this.sampleNFCUids[Math.floor(Math.random() * this.sampleNFCUids.length)];
      if (this.scanningCallback) {
        this.scanningCallback(randomUid);
      }
    }, Math.random() * 5000 + 3000); // Random interval between 3-8 seconds
  }

  async stopScanning(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isCurrentlyScanning = false;
    this.scanningCallback = null;
  }

  isScanning(): boolean {
    return this.isCurrentlyScanning;
  }
}

// Factory function to create the appropriate NFC service
export const createNFCService = async (): Promise<NFCServiceInterface> => {
  if (Capacitor.isNativePlatform()) {
    // For now, skip native NFC since we don't have the plugin
    // This will fall through to Web NFC or simulation
    console.log('Native platform detected, but NFC plugin not available');
  }
  
  // Try Web NFC API for web browsers
  const webService = new WebNFCService();
  const webSupported = await webService.isSupported();
  if (webSupported) {
    console.log('Using Web NFC API');
    return webService;
  }

  // Fallback to simulation
  console.log('Using NFC simulation mode');
  return new SimulatedNFCService();
};

export const getNFCService = (() => {
  let servicePromise: Promise<NFCServiceInterface> | null = null;
  
  return () => {
    if (!servicePromise) {
      servicePromise = createNFCService();
    }
    return servicePromise;
  };
})();
