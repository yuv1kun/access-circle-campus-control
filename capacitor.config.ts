
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e0c5f967852240fe91945f267003e6f5',
  appName: 'access-circle-campus-control',
  webDir: 'dist',
  server: {
    url: 'https://e0c5f967-8522-40fe-9194-5f267003e6f5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#991b1b',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#991b1b'
    }
  }
};

export default config;
