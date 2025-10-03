import axios from "axios"
import type { Creature, PaginatedResponse, CreatureFilters, AuthResponse } from "./types"
import type { CreatureFormData } from "./schemas"

const api = axios.create({
  baseURL: "/api",
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
  list: async (filters?: CreatureFilters): Promise<PaginatedResponse<Creature>> => {
    const params = new URLSearchParams()

    if (filters?.page !== undefined) params.append("page", filters.page.toString())
    if (filters?.size !== undefined) params.append("size", filters.size.toString())
    if (filters?.sort) params.append("sort", filters.sort)
    if (filters?.name) params.append("name", filters.name)
    if (filters?.race) params.append("race", filters.race)
    if (filters?.habitat) params.append("habitat", filters.habitat)
    if (filters?.alignment) params.append("alignment", filters.alignment)

    const response = await api.get<PaginatedResponse<Creature>>("/creatures", { params })
    return response.data
  },

  getById: async (id: number): Promise<Creature> => {
    const response = await api.get<Creature>(`/creatures/${id}`)
    return response.data
  },

  create: async (data: CreatureFormData): Promise<Creature> => {
    const response = await api.post<Creature>("/creatures", data)
    return response.data
  },

  update: async (id: number, data: CreatureFormData): Promise<Creature> => {
    const response = await api.put<Creature>(`/creatures/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/creatures/${id}`)
  },
}
