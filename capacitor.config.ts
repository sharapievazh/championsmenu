import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.championsmenu.app',
  appName: 'championsmenu',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
    backgroundColor: '#3FBF8F',
  },
  android: {
    backgroundColor: '#3FBF8F',
  },
};

export default config;