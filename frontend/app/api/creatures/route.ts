import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()

    const url = queryString ? `${API_URL}/api/creatures?${queryString}` : `${API_URL}/api/creatures`

    const response = await fetch(url, {
      headers: {
        ...(token && { Authorization: token }),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[v0] Get creatures error:", error)
    return NextResponse.json({ message: "Error al obtener criaturas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")
    const body = await request.json()

    const response = await fetch(`${API_URL}/api/creatures`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Create creature error:", error)
    return NextResponse.json({ message: "Error al crear criatura" }, { status: 500 })
  }
}
