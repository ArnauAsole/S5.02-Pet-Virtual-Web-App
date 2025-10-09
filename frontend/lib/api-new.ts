// lib/api.ts
import { api } from "./http"
import type { Creature, User } from "./types"

export const AuthAPI = {
  async login(email: string, password: string): Promise<string> {
    const { data } = await api.post<{ token: string }>("/auth/login", { email, password })
    if (typeof window !== "undefined") localStorage.setItem("token", data.token)
    return data.token
  },
  async register(email: string, password: string): Promise<void> {
    await api.post("/auth/register", { email, password })
  },
  logout() {
    if (typeof window !== "undefined") localStorage.removeItem("token")
  },
}

// Usuario autenticado (USER o ADMIN actuando como sí mismo)
export const CreaturesAPI = {
  async listMine(): Promise<Creature[]> {
    const { data } = await api.get<Creature[]>("/creatures")
    return data ?? []
  },
  async get(id: number): Promise<Creature> {
    const { data } = await api.get<Creature>(`/creatures/${id}`)
    return data
  },
  async create(payload: Partial<Creature>): Promise<Creature> {
    const { data } = await api.post<Creature>("/creatures", payload)
    return data
  },
  async update(id: number, payload: Partial<Creature>): Promise<Creature> {
    const { data } = await api.put<Creature>(`/creatures/${id}`, payload)
    return data
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/creatures/${id}`)
  },
  async train(id: number): Promise<Creature> {
    const { data } = await api.put<Creature>(`/creatures/${id}/train`)
    return data
  },
  async rest(id: number): Promise<Creature> {
    const { data } = await api.put<Creature>(`/creatures/${id}/rest`)
    return data
  },
  async fight(attackerId: number, opponentId: number): Promise<Creature> {
    const { data } = await api.put<Creature>(`/creatures/${attackerId}/fight/${opponentId}`)
    return data
  },
}

// Administración — SOLO visible/usable si ROLE_ADMIN
export const AdminAPI = {
  async listUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>("/admin/users")
    return data ?? []
  },
  async getUserCreatures(ownerId: number): Promise<Creature[]> {
    const { data } = await api.get<Creature[]>(`/admin/users/${ownerId}/creatures`)
    return data ?? []
  },
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`)
  },
  async deleteCreature(id: number): Promise<void> {
    await api.delete(`/admin/creatures/${id}`)
  },
}
