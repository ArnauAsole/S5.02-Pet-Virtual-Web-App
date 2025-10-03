import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")

    const response = await fetch(`${API_URL}/api/creatures/${params.id}`, {
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
    console.error("[v0] Get creature error:", error)
    return NextResponse.json({ message: "Error al obtener criatura" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")
    const body = await request.json()

    const response = await fetch(`${API_URL}/api/creatures/${params.id}`, {
      method: "PUT",
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

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[v0] Update creature error:", error)
    return NextResponse.json({ message: "Error al actualizar criatura" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")

    const response = await fetch(`${API_URL}/api/creatures/${params.id}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: token }),
      },
    })

    if (!response.ok) {
      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json({ message: "Criatura eliminada" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Delete creature error:", error)
    return NextResponse.json({ message: "Error al eliminar criatura" }, { status: 500 })
  }
}
