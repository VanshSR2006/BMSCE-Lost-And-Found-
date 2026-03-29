import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bmsce.reconnect',
  appName: 'BMSCE Reconnect',
  webDir: 'dist',
  // When building APK, the app loads from the local dist bundle.
  // The backend API URL is set via VITE_API_URL in .env.production
  // so it always points to the deployed Render backend.
  android: {
    allowMixedContent: true,
    backgroundColor: "#16052a"
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#16052a",
      showSpinner: false,
      androidSpinnerStyle: "small",
      iosSpinnerStyle: "small"
    }
  }
};

export default config;
