import axios from "axios";

// Dynamically use the same host the page was served from,
// so phone, tablet and laptop all reach the backend automatically.
const getBaseUrl = () => {
  const host = window.location.hostname;
  // localhost means we're on the dev machine
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:5001";
  }
  // Any other host (e.g. 192.168.x.x from a phone) — point to same IP, port 5001
  return `http://${host}:5001`;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
