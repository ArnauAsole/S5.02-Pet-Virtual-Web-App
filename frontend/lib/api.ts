import axios from "axios"
import type { Creature, AuthResponse, CreateCreatureData, UpdateCreatureData, User } from "./types"

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  console.log("[v0] API Request:", config.method?.toUpperCase(), config.url)
  const token = localStorage.getItem("jwt")
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (r) => {
    console.log("[v0] API Response:", r.status, r.config.url)
    return r
  },
  (error) => {
    console.error("[v0] API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })

    if (error?.response?.status === 401) {
      localStorage.removeItem("jwt")
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export const AuthAPI = {
  register: async (data: { email: string; password: string }) => {
    console.log("[v0] Sending register request with data:", data)
    const response = await api.post("/auth/register", data)
    return response.data
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    console.log("[v0] Sending login request with data:", data)
    const response = await api.post<AuthResponse>("/auth/login", data)
    return response.data
  },
}

export const CreaturesAPI = {
  list: async (): Promise<Creature[]> => {
    const response = await api.get<Creature[]>("/creatures")
    return response.data
  },

  getById: async (id: number): Promise<Creature> => {
    const response = await api.get<Creature>(`/creatures/${id}`)
    return response.data
  },

  create: async (data: CreateCreatureData): Promise<Creature> => {
    const response = await api.post<Creature>("/creatures", data)
    return response.data
  },

  update: async (id: number, data: UpdateCreatureData): Promise<Creature> => {
    const response = await api.put<Creature>(`/creatures/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/creatures/${id}`)
  },

  train: async (id: number): Promise<Creature> => {
    const response = await api.post<Creature>(`/creatures/${id}/train`)
    return response.data
  },

  rest: async (id: number): Promise<Creature> => {
    const response = await api.post<Creature>(`/creatures/${id}/rest`)
    return response.data
  },

  combat: async (attackerId: number, defenderId: number): Promise<Creature> => {
    const response = await api.post<Creature>(`/creatures/${attackerId}/combat/${defenderId}`)
    return response.data
  },
}

export const AdminAPI = {
  // Users management
  listUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>("/admin/users")
    return response.data
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`)
  },

  // All creatures management
  listAllCreatures: async (): Promise<Creature[]> => {
    const response = await api.get<Creature[]>("/admin/creatures")
    return response.data
  },

  deleteCreature: async (id: number): Promise<void> => {
    await api.delete(`/admin/creatures/${id}`)
  },
}
