import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  console.log("[v0] Middleware called for:", request.nextUrl.pathname)

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("jwt")?.value
    console.log("[v0] Dashboard access attempt, token present:", !!token)

    if (!token) {
      console.log("[v0] No token found, redirecting to /login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    console.log("[v0] Token found, allowing access to dashboard")
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/dashboard/:path*",
}
