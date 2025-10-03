"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CreaturesAPI } from "@/lib/api"
import { auth } from "@/lib/auth"
import { CreatureForm } from "@/components/creature-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import type { CreatureFormData } from "@/lib/schemas"

export default function EditCreaturePage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!auth.isAuthed()) {
      router.push("/login")
    } else if (!auth.isAdmin()) {
      toast.error("No tienes permisos para editar criaturas")
      router.push("/dashboard")
    }
  }, [router])

  const { data: creature, isLoading } = useQuery({
    queryKey: ["creature", id],
    queryFn: () => CreaturesAPI.getById(id),
    enabled: !isNaN(id),
  })

  const updateMutation = useMutation({
    mutationFn: (data: CreatureFormData) => CreaturesAPI.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["creature", id] })
      queryClient.invalidateQueries({ queryKey: ["creatures"] })
      toast.success("Criatura actualizada correctamente")
      router.push(`/creatures/${data.id}`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Error al actualizar la criatura"
      toast.error(message)
    },
  })

  const handleSubmit = (data: CreatureFormData) => {
    updateMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!creature) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Criatura no encontrada</CardTitle>
            <CardDescription>La criatura que buscas no existe</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al listado
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push(`/creatures/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Editar Criatura</CardTitle>
            <CardDescription>Modifica los datos de {creature.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <CreatureForm defaultValues={creature} onSubmit={handleSubmit} isSubmitting={updateMutation.isPending} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
