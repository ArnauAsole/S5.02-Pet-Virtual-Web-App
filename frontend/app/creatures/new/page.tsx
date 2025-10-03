"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { CreaturesAPI } from "@/lib/api"
import { auth } from "@/lib/auth"
import { CreatureForm } from "@/components/creature-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import type { CreatureFormData } from "@/lib/schemas"

export default function NewCreaturePage() {
  const router = useRouter()

  useEffect(() => {
    if (!auth.isAuthed()) {
      router.push("/login")
    } else if (!auth.isAdmin()) {
      toast.error("No tienes permisos para crear criaturas")
      router.push("/dashboard")
    }
  }, [router])

  const createMutation = useMutation({
    mutationFn: CreaturesAPI.create,
    onSuccess: (data) => {
      toast.success("Criatura creada correctamente")
      router.push(`/creatures/${data.id}`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Error al crear la criatura"
      toast.error(message)
    },
  })

  const handleSubmit = (data: CreatureFormData) => {
    createMutation.mutate(data)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Nueva Criatura</CardTitle>
            <CardDescription>Crea una nueva criatura del universo de Tolkien</CardDescription>
          </CardHeader>
          <CardContent>
            <CreatureForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
