import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] Login request body:", JSON.stringify(body, null, 2))
    console.log("[v0] Sending to backend URL:", `${API_URL}/auth/login`)

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("[v0] Backend response status:", response.status)

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("[v0] Backend returned non-JSON response:", text)
      return NextResponse.json({ message: "Error del servidor: respuesta no válida" }, { status: 500 })
    }

    const data = await response.json()
    console.log("[v0] Backend response data:", JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.log("[v0] Login failed:", data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log("[v0] Login successful")
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ message: "Error al conectar con el servidor" }, { status: 500 })
  }
}
