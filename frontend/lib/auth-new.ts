// lib/auth.ts
export type JwtPayload = { sub: string; id: number; roles: string[]; exp: number }

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export function decodeJwt(token: string | null): JwtPayload | null {
  if (!token) return null
  try {
    const [, payload] = token.split(".")
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function currentUser(): JwtPayload | null {
  return decodeJwt(getToken())
}

export function isAdmin(): boolean {
  const p = currentUser()
  return !!p?.roles?.includes("ROLE_ADMIN")
}
