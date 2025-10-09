const TOKEN_KEY = "token"

export interface AuthUser {
  token: string
  id: number
  email: string
  roles: string[]
  profileImage?: string
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
    console.error("Error decoding JWT:", error)
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
          this.clear()
          return null
        }
      }
    }

    return token
  },

  setToken(
    tokenOrResponse: string | { token: string; id: number; email: string; roles: string[]; profileImage?: string },
    profileImage?: string,
  ) {
    if (typeof window === "undefined") return

    let token: string
    let userData: Partial<AuthUser> = {}

    // Handle both string token and AuthResponse object
    if (typeof tokenOrResponse === "string") {
      token = tokenOrResponse
      const decoded = decodeJWT(token)
      if (decoded) {
        userData = {
          email: decoded.email || decoded.sub,
          roles: decoded.roles || [],
          profileImage: profileImage,
        }
      }
    } else {
      token = tokenOrResponse.token
      userData = {
        id: tokenOrResponse.id,
        email: tokenOrResponse.email,
        roles: tokenOrResponse.roles,
        profileImage: tokenOrResponse.profileImage,
      }
    }

    localStorage.setItem(TOKEN_KEY, token)
    document.cookie = `jwt=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

    const user: AuthUser = {
      token,
      id: userData.id || 0,
      email: userData.email || "",
      roles: userData.roles || [],
      profileImage: userData.profileImage,
    }
    this.setUser(user)
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
    return this.getRoles().includes("ADMIN") || this.getRoles().includes("ROLE_ADMIN")
  },

  clear() {
    if (typeof window === "undefined") return
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem("user")
    document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  },

  isAuthed(): boolean {
    return !!this.getToken()
  },
}

export default auth
