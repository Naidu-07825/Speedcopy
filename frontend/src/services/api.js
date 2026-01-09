import axios from "axios";

/**
 * Base API URL
 * - In production (Netlify): comes from VITE_API_BASE_URL
 * - In local development: falls back to localhost
 */
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

/**
 * Axios instance
 */
const API = axios.create({
  baseURL,
  withCredentials: true, // required for cookies / auth
  timeout: 10000, // 10 seconds
});

/**
 * Global response error handler
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network / server down error
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      const message =
        "Cannot connect to server. Please check backend: " + baseURL;
      console.error("❌ Network Error:", message);
      error.message = message;
    }

    // Timeout error
    if (error.code === "ECONNABORTED") {
      const message =
        "Request timeout. Server is taking too long to respond.";
      console.error("⏱️ Timeout Error:", message);
      error.message = message;
    }

    return Promise.reject(error);
  }
);

/**
 * Backend origin (used for sockets, redirects, etc.)
 * Example:
 * https://speedcopy-backend.onrender.com
 */
export const BACKEND_ORIGIN = baseURL.replace(/\/api\/?$/, "");

export default API;
