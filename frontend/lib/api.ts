import axios from "axios"
import type { Creature, AuthResponse, CreateCreatureData, UpdateCreatureData, User, PaginatedResponse } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api"
const USE_REFRESH = process.env.NEXT_PUBLIC_USE_REFRESH === "true"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // Set to false by default as backend uses Bearer tokens
})

api.interceptors.request.use((config) => {
  const isAuthEndpoint = config.url?.includes("/auth/login") || config.url?.includes("/auth/register")

  const token = localStorage.getItem("token")
  console.log("[v0] Request interceptor:", {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : "none",
    isAuthEndpoint,
  })

  // Only add token if it exists AND it's not an auth endpoint
  if (token && !isAuthEndpoint) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
    console.log("[v0] Authorization header set:", config.headers.Authorization.substring(0, 30) + "...")
  } else if (isAuthEndpoint) {
    console.log("[v0] Skipping token for auth endpoint")
  } else {
    console.log("[v0] No token found in localStorage")
  }
  return config
})

async function refreshAccessToken(): Promise<string | null> {
  if (!USE_REFRESH) return null

  try {
    const response = await axios.post<{ token: string }>(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
    const newToken = response.data.token
    if (newToken) {
      localStorage.setItem("token", newToken)
      return newToken
    }
  } catch (error) {
    console.error("Failed to refresh token:", error)
  }
  return null
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    console.log("[v0] API interceptor caught error:", {
      status: error?.response?.status,
      url: error?.config?.url,
      method: error?.config?.method,
      message: error?.message,
    })

    if (error?.response?.status === 401) {
      const isLoginPage = typeof window !== "undefined" && window.location.pathname.startsWith("/login")
      const isDashboardPage = typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard")

      console.log(
        "[v0] 401 error detected, isLoginPage:",
        isLoginPage,
        "isDashboardPage:",
        isDashboardPage,
        "USE_REFRESH:",
        USE_REFRESH,
      )

      if (!isLoginPage && USE_REFRESH) {
        // Try to refresh token once
        const newToken = await refreshAccessToken()
        if (newToken && error.config) {
          // Retry the original request with new token
          error.config.headers.Authorization = `Bearer ${newToken}`
          return api.request(error.config)
        }
      }

      if (!isLoginPage && !isDashboardPage) {
        console.log("[v0] Clearing auth and redirecting to login")
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }
    }
    return Promise.reject(error)
  },
)

export const AuthAPI = {
  register: async (data: { email: string; password: string; avatar?: string }): Promise<AuthResponse> => {
    console.log("[v0] AuthAPI.register called with:", data)
    const response = await api.post<AuthResponse>("/auth/register", data)
    console.log("[v0] AuthAPI.register response:", response.data)
    return response.data
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    console.log("[v0] AuthAPI.login called with email:", data.email)
    const response = await api.post<AuthResponse>("/auth/login", data)
    console.log("[v0] AuthAPI.login response:", response.data)
    return response.data
  },
}

export const CreaturesAPI = {
  list: async (params?: { includeInCombat?: boolean }): Promise<PaginatedResponse<Creature>> => {
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

      if (response.data && typeof response.data === "object" && "content" in response.data) {
        return response.data as PaginatedResponse<Creature>
      }

      return {
        content: [],
        pageable: { pageNumber: 0, pageSize: 0 },
        totalElements: 0,
        totalPages: 0,
        last: true,
      }
    } catch (error) {
      console.error("Error fetching creatures:", error)
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

  grantAdmin: async (id: number): Promise<void> => {
    await api.post(`/admin/users/${id}/grant-admin`)
  },

  revokeAdmin: async (id: number): Promise<void> => {
    await api.post(`/admin/users/${id}/revoke-admin`)
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`)
  },

  getUserCreatures: async (ownerId: number): Promise<Creature[]> => {
    try {
      const response = await api.get<any>("/creatures")
      const allCreatures = Array.isArray(response.data) ? response.data : response.data?.content || []
      return allCreatures.filter((c: Creature) => c.ownerId === ownerId)
    } catch (error) {
      console.error("Error fetching user creatures:", error)
      return []
    }
  },

  getAllCreatures: async (): Promise<Creature[]> => {
    try {
      const response = await api.get<any>("/creatures")
      return Array.isArray(response.data) ? response.data : response.data?.content || []
    } catch (error) {
      console.error("Error fetching all creatures:", error)
      return []
    }
  },

  deleteCreature: async (id: number): Promise<void> => {
    await api.delete(`/admin/creatures/${id}`)
  },
}
