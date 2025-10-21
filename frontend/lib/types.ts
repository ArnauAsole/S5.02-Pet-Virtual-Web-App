export type CreatureClass =
  | "mago"
  | "caballero"
  | "ladron"
  | "explorador"
  | "clerigo"
  | "bardo"
  | "druida"
  | "paladin"
  | "asesino"
  | "brujo"
  | "monje"
  | "barbaro"

export interface Creature {
  id: number
  name: string
  race: string
  class: CreatureClass
  level: number
  experience: number
  attack: number
  defense: number
  health: number
  inCombat: boolean
  ownerId: number
  imageUrl?: string | null
}

export interface CreateCreatureData {
  name: string
  race: string
  class: CreatureClass
  imageUrl?: string
}

export interface UpdateCreatureData {
  name?: string
  race?: string
  class?: CreatureClass
  imageUrl?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
  }
  totalElements: number
  totalPages: number
  last: boolean
}

export interface AuthResponse {
  token: string
  id: number
  email: string
  roles: string[]
  profileImage?: string
}

export interface User {
  id: number
  email: string
  roles: string[]
  createdAt?: string
  profileImage?: string
}
