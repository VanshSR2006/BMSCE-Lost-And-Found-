import axios from "axios";

// VITE_API_URL must be set in Vercel dashboard environment variables.
// For local dev it reads from .env.development automatically.
const getBaseUrl = () => {
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
