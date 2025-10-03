"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"
import { CreaturesTable } from "@/components/creatures-table"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    if (!auth.isAuthed()) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    auth.clear()
    router.push("/login")
  }

  const user = auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tolkien Creatures</h1>
            <p className="text-sm text-muted-foreground">
              Bienvenido, {user?.username} {auth.isAdmin() && "(Admin)"}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <CreaturesTable />
      </main>
    </div>
  )
}
