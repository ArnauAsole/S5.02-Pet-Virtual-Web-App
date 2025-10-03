"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter, useParams } from "next/navigation"
import { CreaturesAPI } from "@/lib/api"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function CreatureDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)
  const isAdmin = auth.isAdmin()

  useEffect(() => {
    if (!auth.isAuthed()) {
      router.push("/login")
    }
  }, [router])

  const {
    data: creature,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["creature", id],
    queryFn: () => CreaturesAPI.getById(id),
    enabled: !isNaN(id),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (error || !creature) {
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

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case "GOOD":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "EVIL":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      case "NEUTRAL":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
      default:
        return ""
    }
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl">{creature.name}</CardTitle>
                <CardDescription>
                  Creado el {format(new Date(creature.createdAt), "PPP", { locale: es })}
                </CardDescription>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/creatures/${creature.id}/edit`)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Implement delete with confirmation
                      router.push("/dashboard")
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Raza</h3>
                <Badge variant="secondary">{creature.race}</Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Alineamiento</h3>
                <Badge variant="secondary" className={getAlignmentColor(creature.alignment)}>
                  {creature.alignment}
                </Badge>
              </div>
            </div>

            {creature.habitat && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Hábitat</h3>
                  <p>{creature.habitat}</p>
                </div>
              </>
            )}

            {creature.abilities && creature.abilities.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {creature.abilities.map((ability, i) => (
                      <Badge key={i} variant="outline">
                        {ability}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {creature.lore && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Historia</h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{creature.lore}</p>
                </div>
              </>
            )}

            <Separator />
            <div className="text-xs text-muted-foreground">
              Última actualización: {format(new Date(creature.updatedAt), "PPpp", { locale: es })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
