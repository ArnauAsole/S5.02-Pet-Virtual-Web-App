export interface Creature {
  id: number
  name: string
  race: string // Human, Elf, Dwarf, Orc, Maia, etc.
  color: string
  level: number
  xp: number
  attackBase: number
  defenseBase: number
  maxHealth: number
  health: number
  inCombat: boolean
  ownerId: number
  accessories: string[]
}

export interface CreateCreatureData {
  name: string
  race: string
  color: string
  maxHealth: number
  attackBase: number
  defenseBase: number
  accessories: string[]
}

export interface UpdateCreatureData {
  name: string
  race: string
  color: string
  maxHealth: number
  attackBase: number
  defenseBase: number
  accessories: string[]
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
}

export interface User {
  id: number
  email: string
  roles: string[]
  createdAt?: string
}
