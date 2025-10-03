export type Alignment = "GOOD" | "EVIL" | "NEUTRAL"
export type Race = "Elf" | "Orc" | "Dwarf" | "Hobbit" | "Man" | "Ent" | "Maiar" | "Other"

export interface Creature {
  id: number
  name: string
  race: Race
  habitat?: string
  abilities?: string[]
  alignment: Alignment
  lore?: string
  createdAt: string
  updatedAt: string
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

export interface CreatureFilters {
  page?: number
  size?: number
  sort?: string
  name?: string
  race?: string
  habitat?: string
  alignment?: Alignment
}

export interface AuthResponse {
  token: string
}

export interface User {
  id: number
  email: string
  roles: string[]
}
