import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.championsmenu',
  appName: 'championsmenu',
  webDir: 'dist',
  server: {
    url: 'https://82611ba4-ae59-4058-9b76-697351198007.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#3FBF8F',
  },
  android: {
    backgroundColor: '#3FBF8F',
  },
};

export default config;