import axios from "axios";

const baseURL =
  import.meta.env.MODE === "production"
    ? "https://xerox-shop-backend.onrender.com/api"
    : "http://localhost:5000/api";

const API = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000, 
});


API.interceptors.response.use(
  (response) => response,
  (error) => {
    
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      error.message = "Cannot connect to server. Please check if backend is running on " + baseURL;
      console.error("Network Error:", error.message);
    }
    
    if (error.code === "ECONNABORTED") {
      error.message = "Request timeout. Server is taking too long to respond.";
      console.error("Timeout Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export const BACKEND_ORIGIN = baseURL.replace(/\/api\/?$/, "");

export default API;
