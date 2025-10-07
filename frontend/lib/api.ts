import axios from "axios"
import type { Creature, AuthResponse, CreateCreatureData, UpdateCreatureData, User, PaginatedResponse } from "./types"

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt")
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
    console.log("[v0] Token attached to request:", token.substring(0, 20) + "...")
  } else {
    console.log("[v0] No token found in localStorage")
  }
  return config
})

api.interceptors.response.use(
  (r) => {
    return r
  },
  (error) => {
    if (error?.response?.status === 403) {
      console.log("[v0] 403 Forbidden - Token may be invalid or expired")
      const token = localStorage.getItem("jwt")
      console.log("[v0] Current token:", token ? token.substring(0, 20) + "..." : "none")
    }
    if (error?.response?.status === 401) {
      console.log("[v0] 401 Unauthorized - Clearing token and redirecting to login")
      localStorage.removeItem("jwt")
      localStorage.removeItem("user")
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export const AuthAPI = {
  register: async (data: { email: string; password: string }) => {
    const response = await api.post("/auth/register", data)
    return response.data
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data)
    return response.data
  },
}

export const CreaturesAPI = {
  list: async (params?: any): Promise<PaginatedResponse<Creature>> => {
    try {
      const response = await api.get<any>("/creatures", { params })

      if (Array.isArray(response.data)) {
        return {
          content: response.data,
          pageable: {
            pageNumber: 0,
            pageSize: response.data.length,
          },
          totalElements: response.data.length,
          totalPages: 1,
          last: true,
        }
      }

      // If backend returns paginated response, use it directly
      if (response.data && typeof response.data === "object" && "content" in response.data) {
        return response.data as PaginatedResponse<Creature>
      }

      // Fallback: empty response
      return {
        content: [],
        pageable: { pageNumber: 0, pageSize: 0 },
        totalElements: 0,
        totalPages: 0,
        last: true,
      }
    } catch (error) {
      console.error("Error fetching creatures:", error)
      // Return empty paginated response on error
      return {
        content: [],
        pageable: { pageNumber: 0, pageSize: 0 },
        totalElements: 0,
        totalPages: 0,
        last: true,
      }
    }
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
    const response = await api.put<Creature>(`/creatures/${id}/train`)
    return response.data
  },

  rest: async (id: number): Promise<Creature> => {
    const response = await api.put<Creature>(`/creatures/${id}/rest`)
    return response.data
  },

  combat: async (attackerId: number, defenderId: number): Promise<Creature> => {
    const response = await api.put<Creature>(`/creatures/${attackerId}/fight/${defenderId}`)
    return response.data
  },
}

export const AdminAPI = {
  listUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>("/admin/users")
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error("Error fetching users:", error)
      return []
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`)
  },

  listAllCreatures: async (): Promise<Creature[]> => {
    try {
      const response = await api.get<Creature[]>("/admin/creatures")
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error("Error fetching all creatures:", error)
      return []
    }
  },

  deleteCreature: async (id: number): Promise<void> => {
    await api.delete(`/admin/creatures/${id}`)
  },
}
