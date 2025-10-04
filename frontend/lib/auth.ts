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
    document.cookie = `jwt=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
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
