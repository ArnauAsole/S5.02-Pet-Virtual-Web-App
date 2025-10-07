const TOKEN_KEY = "jwt"

export interface AuthUser {
  token: string
  roles: string[]
  email: string
}

function decodeJWT(token: string): { email: string; roles: string[]; sub: string; exp?: number } | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("[v0] Error decoding JWT:", error)
    return null
  }
}

export const auth = {
  getToken(): string | null {
    if (typeof window === "undefined") return null
    const token = localStorage.getItem(TOKEN_KEY)

    if (token) {
      const decoded = decodeJWT(token)
      if (decoded?.exp) {
        const now = Math.floor(Date.now() / 1000)
        if (decoded.exp < now) {
          console.log("[v0] Token expired, clearing auth")
          this.clear()
          return null
        }
      }
    }

    return token
  },

  setToken(token: string) {
    if (typeof window === "undefined") return

    console.log("[v0] Setting token:", token.substring(0, 20) + "...")

    localStorage.setItem(TOKEN_KEY, token)
    document.cookie = `jwt=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

    // Decode JWT to extract user info
    const decoded = decodeJWT(token)
    if (decoded) {
      console.log("[v0] Decoded JWT - email:", decoded.email || decoded.sub, "roles:", decoded.roles)
      const user: AuthUser = {
        token,
        email: decoded.email || decoded.sub,
        roles: decoded.roles || [],
      }
      this.setUser(user)
    }
  },

  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null
    const userData = localStorage.getItem("user")
    return userData ? JSON.parse(userData) : null
  },

  setUser(user: AuthUser) {
    if (typeof window === "undefined") return
    localStorage.setItem("user", JSON.stringify(user))
  },

  getRoles(): string[] {
    const user = this.getUser()
    return user?.roles || []
  },

  isAdmin(): boolean {
    return this.getRoles().includes("ADMIN")
  },

  clear() {
    if (typeof window === "undefined") return
    console.log("[v0] Clearing auth data")
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem("user")
    document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  },

  isAuthed(): boolean {
    const token = this.getToken()
    const isAuthed = !!token
    console.log("[v0] isAuthed check:", isAuthed)
    return isAuthed
  },
}
