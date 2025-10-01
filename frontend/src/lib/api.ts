import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("jwt");
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const AuthAPI = {
  register: (data: { username: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { username: string; password: string }) =>
    api.post("/auth/login", data),
};

export const CreaturesAPI = {
  list: () => api.get("/creatures"),
  create: (data: { name: string; type: string }) => api.post("/creatures", data),
  train: (id: number) => api.post(`/creatures/${id}/train`, {}),
  rest: (id: number) => api.post(`/creatures/${id}/rest`, {}),
  fight: (id: number, opponentId: number) =>
    api.post(`/creatures/${id}/fight/${opponentId}`, {}),
  remove: (id: number) => api.delete(`/creatures/${id}`),
};

