import axios from "axios";

// one axios instance for the whole app: every request goes to /api/...
// (the dev server's proxy sends /api to the backend on port 4000)
const api = axios.create({
  baseURL: "/api",
});

// interceptor: runs before every request and adds the token,
// so we don't have to write the Authorization header in every component
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

export default api;
