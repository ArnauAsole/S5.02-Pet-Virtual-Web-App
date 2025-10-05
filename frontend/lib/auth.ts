const TOKEN_KEY = "jwt"

export interface AuthUser {
  token: string
  roles: string[]
  email: string
}

function decodeJWT(token: string): { email: string; roles: string[]; sub: string } | null {
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
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string) {
    if (typeof window === "undefined") return
    localStorage.setItem(TOKEN_KEY, token)
    document.cookie = `jwt=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

    // Decode JWT to extract user info
    const decoded = decodeJWT(token)
    if (decoded) {
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
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem("user")
    document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  },

  isAuthed(): boolean {
    return !!auth.getToken()
  },
}
