import axios from "axios";
import { syncManager } from "../utils/syncManager";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000"
});

if (typeof window !== "undefined") {
  window.addEventListener("online", () => syncManager.replayQueue(api));
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (import.meta.env.DEV) {
      config.metadata = { startTime: new Date().getTime() };
      const traceId = Math.random().toString(36).substring(2, 9);
      config.headers['X-Trace-Id'] = traceId;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
      if (import.meta.env.DEV && response.config.metadata) {
          const duration = new Date().getTime() - response.config.metadata.startTime;
          const traceId = response.config.headers['X-Trace-Id'];
          
          fetch('/__brain_webhook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  traceId,
                  source: 'frontend',
                  target: response.config.url,
                  type: 'API_CALL',
                  duration,
                  status: response.status
              })
          }).catch(() => {}); // ignore trace failures
      }
      return response;
  },
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