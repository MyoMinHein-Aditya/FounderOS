import axios from "axios";
const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
    console.error(
        "VITE_API_URL is not set. The app is falling back to localhost and API calls will fail in production."
    );
}
const api = axios.create({ baseURL });
export default api;