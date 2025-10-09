// lib/types.ts
export type Creature = {
  id: number
  name: string
  race: string
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
  imageUrl?: string | null
}

export type User = {
  id: number
  email: string
  roles: string[]
}
