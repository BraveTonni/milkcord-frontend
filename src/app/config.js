// Backend origin. Override at build time with VITE_API_BASE_URL
// (see .env.example); the default matches the local dev server.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:7000";

export default API_BASE_URL;
