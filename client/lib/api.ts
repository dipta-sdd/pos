import axios from "axios";

import { getToken } from "./hooks/useAuth";

// Backend URL - hardcoded as requested
const BACKEND_URL = "http://localhost:8000/api";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Export the configured axios instance
export default api;
