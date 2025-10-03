const TOKEN_KEY = "jwt"

export interface AuthUser {
  token: string
  roles: string[]
  email: string
}

export const auth = {
  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string) {
    if (typeof window === "undefined") return
    localStorage.setItem(TOKEN_KEY, token)
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
  },

  isAuthed(): boolean {
    return !!auth.getToken()
  },
}
