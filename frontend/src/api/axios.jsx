import axios from "axios";
import { syncManager } from "../utils/syncManager";

const api = axios.create({
  baseURL: "http://localhost:8000"
});

if (typeof window !== "undefined") {
  window.addEventListener("online", () => syncManager.replayQueue(api));
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    } else if (!error.response && error.config && error.config.method !== "get") {
      syncManager.queueRequest({
        method: error.config.method,
        url: error.config.url,
        data: error.config.data
      });
    }
    return Promise.reject(error);
  }
);

export default api;