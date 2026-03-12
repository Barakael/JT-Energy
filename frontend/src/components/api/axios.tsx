import axios from "axios";

/**
 * Single point of API origin for the HR System.
 *
 * All pages should import this instance and call only the path
 * after the base, e.g.:
 *
 *   import api from "@/components/api/axios";
 *   api.get("/api/v1/employees");
 *   api.post("/api/v1/leave/apply", data);
 *
 * The base URL is read from the VITE_API_BASE_URL env variable
 * (set in frontend/.env). Change that one value to point the
 * entire app at a different backend.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  withCredentials: true, // needed for Laravel Sanctum cookie auth
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Attach the Bearer token stored in localStorage (if present).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
// On 401, clear the stored token and navigate to /login.
// Exceptions:
//   • The login endpoint itself — a wrong-password 401 should surface as an error to the caller.
//   • Requests from the login page — no redirect needed when already there.
// A flag prevents multiple simultaneous expired-token requests from each
// triggering their own redirect (common with Tanstack Query parallel fetches).
let _redirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    const alreadyOnLogin = window.location.pathname === "/login";

    if (error.response?.status === 401 && !isLoginRequest && !alreadyOnLogin && !_redirectingToLogin) {
      _redirectingToLogin = true;
      localStorage.removeItem("auth_token");
      // Use replace so the browser back-button doesn't return to the broken page.
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
