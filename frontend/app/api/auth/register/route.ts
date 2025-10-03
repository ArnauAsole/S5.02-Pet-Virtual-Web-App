import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] ===== REGISTER REQUEST =====")
    console.log("[v0] Request body received:", JSON.stringify(body, null, 2))
    console.log("[v0] Backend URL:", `${API_URL}/auth/register`)

    if (!body.email || !body.password) {
      console.error("[v0] Missing email or password in request body")
      return NextResponse.json({ message: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const registerData = {
      email: body.email,
      password: body.password,
    }

    console.log("[v0] Sending to backend:", JSON.stringify(registerData, null, 2))

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    })

    console.log("[v0] Backend response status:", response.status)
    console.log("[v0] Backend response headers:", Object.fromEntries(response.headers.entries()))

    if (response.status === 201) {
      console.log("[v0] Registration successful (201 Created)")
      return NextResponse.json({ message: "Usuario registrado exitosamente" }, { status: 201 })
    }

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      console.log("[v0] Backend response data:", JSON.stringify(data, null, 2))
      return NextResponse.json(data, { status: response.status })
    } else {
      const text = await response.text()
      console.error("[v0] Backend returned non-JSON response:", text)
      return NextResponse.json({ message: "Error del servidor: respuesta no válida" }, { status: response.status })
    }
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ message: "Error al conectar con el servidor" }, { status: 500 })
  }
}
