import axios from "axios";
import { Capacitor } from "@capacitor/core";

// VITE_API_URL must be set in Vercel dashboard environment variables.
// For local dev it reads from .env.development automatically.
export const getBaseUrl = () => {
  // If we are on native platform (Android/iOS)
  if (Capacitor.isNativePlatform()) {
    // 1. If running via Live Reload, window.location.hostname will be the computer's LAN IP (e.g. 192.168.x.x or 172.x.x.x)
    if (
      typeof window !== "undefined" &&
      window.location.hostname &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      return `http://${window.location.hostname}:5005`;
    }

    // 2. If it's a production build, VITE_API_URL will point to the deployed Render backend
    if (
      import.meta.env.VITE_API_URL &&
      !import.meta.env.VITE_API_URL.includes("localhost") &&
      !import.meta.env.VITE_API_URL.includes("127.0.0.1")
    ) {
      return import.meta.env.VITE_API_URL;
    }

    // 3. Fallback for local testing (both emulator and physical device on same Wi-Fi)
    // 172.21.167.79 is the host PC's LAN IP address.
    return "http://172.21.167.79:5005";
  }

  // Web platform logic
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Dev-friendly fallback:
  // - If you open the app via LAN IP (e.g. http://192.168.x.x:8080),
  //   "localhost" would point to the phone/other device and break API calls.
  // - Use the current hostname and the backend port.
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5005`;
  }
  return "http://localhost:5005";
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
