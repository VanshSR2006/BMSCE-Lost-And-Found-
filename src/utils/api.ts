import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5001/api", 
  // ⬆️ Later we change this to your Railway/Vercel backend URL
});

