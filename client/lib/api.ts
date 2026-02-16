import axios from "axios";

import { getToken } from "./hooks/useAuth";

// Backend URL - hardcoded as requested
export const BACKEND_URL = "http://localhost:8000";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: BACKEND_URL + "/api",
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

    // Automatically add vendor_id from URL if we are in the POS vendor context
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const match = pathname.match(/\/pos\/vendor\/(\d+)/);

      if (match && match[1]) {
        const vendorId = match[1];

        config.params = {
          vendor_id: vendorId,
          ...(config.params as Record<string, unknown>),
        };
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Export the configured axios instance
export default api;
