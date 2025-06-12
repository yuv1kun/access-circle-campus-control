
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
  private NFC: any = null;

  constructor() {
    // Initialize NFC plugin if available
    this.initNFC();
  }

  private async initNFC() {
    try {
      // Only try to import if we're on a native platform
      if (Capacitor.isNativePlatform()) {
        const { NFC } = await import('@capacitor-community/nfc');
        this.NFC = NFC;
      }
    } catch (error) {
      console.log('Capacitor NFC plugin not available:', error);
      this.NFC = null;
    }
  }

  async isSupported(): Promise<boolean> {
    if (!this.NFC) {
      await this.initNFC();
    }
    
    if (!this.NFC) {
      return false;
    }

    try {
      const result = await this.NFC.isSupported();
      return result.isSupported;
    } catch (error) {
      console.log('NFC not supported:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.NFC) {
      return false;
    }

    try {
      const result = await this.NFC.checkPermissions();
      if (result.nfc === 'granted') {
        return true;
      }
      
      const requestResult = await this.NFC.requestPermissions();
      return requestResult.nfc === 'granted';
    } catch (error) {
      console.error('NFC permission error:', error);
      return false;
    }
  }

  async startScanning(callback: (uid: string) => void): Promise<void> {
    if (!this.NFC) {
      throw new Error('NFC plugin not available');
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('NFC permission denied');
      }

      this.scanningCallback = callback;
      this.isCurrentlyScanning = true;

      await this.NFC.addListener('nfcTagScanned', (event: any) => {
        console.log('NFC tag scanned:', event);
        const uid = this.extractUID(event.nfcTag);
        if (uid && this.scanningCallback) {
          this.scanningCallback(uid);
        }
      });

      await this.NFC.startScanSession();
    } catch (error) {
      this.isCurrentlyScanning = false;
      throw error;
    }
  }

  async stopScanning(): Promise<void> {
    if (!this.NFC) {
      return;
    }

    try {
      await this.NFC.stopScanSession();
      await this.NFC.removeAllListeners();
      this.isCurrentlyScanning = false;
      this.scanningCallback = null;
    } catch (error) {
      console.error('Error stopping NFC scan:', error);
    }
  }

  isScanning(): boolean {
    return this.isCurrentlyScanning;
  }

  private extractUID(nfcTag: any): string | null {
    // Extract UID from the NFC tag
    if (nfcTag.id) {
      return Array.from(nfcTag.id)
        .map((byte: number) => byte.toString(16).padStart(2, '0'))
        .join('').toUpperCase();
    }
    return null;
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
    // Use Capacitor NFC plugin for native mobile apps
    const service = new CapacitorNFCService();
    const isSupported = await service.isSupported();
    if (isSupported) {
      return service;
    }
  } else {
    // Use Web NFC API for web browsers
    const service = new WebNFCService();
    const isSupported = await service.isSupported();
    if (isSupported) {
      return service;
    }
  }

  // Fallback to simulation
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
