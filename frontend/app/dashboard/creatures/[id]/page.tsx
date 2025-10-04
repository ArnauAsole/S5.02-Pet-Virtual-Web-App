"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreaturesAPI } from "@/lib/api"
import type { Creature } from "@/lib/types"
import { ArrowLeft, Loader2, Pencil, Trash2, Swords, Heart, Dumbbell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function CreatureDetailPage() {
  const [creature, setCreature] = useState<Creature | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const id = Number.parseInt(params.id as string)

  useEffect(() => {
    loadCreature()
  }, [id])

  const loadCreature = async () => {
    try {
      const data = await CreaturesAPI.getById(id)
      setCreature(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la criatura",
        variant: "destructive",
      })
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleTrain = async () => {
    setActionLoading(true)
    try {
      const updated = await CreaturesAPI.train(id)
      setCreature(updated)
      toast({
        title: "Entrenamiento exitoso",
        description: `${creature?.name} ha ganado experiencia`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo entrenar la criatura",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRest = async () => {
    setActionLoading(true)
    try {
      const updated = await CreaturesAPI.rest(id)
      setCreature(updated)
      toast({
        title: "Descanso exitoso",
        description: `${creature?.name} ha recuperado salud`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descansar la criatura",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await CreaturesAPI.delete(id)
      toast({
        title: "Criatura eliminada",
        description: "La criatura ha sido eliminada exitosamente",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la criatura",
        variant: "destructive",
      })
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!creature) {
    return null
  }

  const healthPercentage = (creature.health / creature.maxHealth) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-amber-900">{creature.name}</h1>
            <p className="text-xl text-muted-foreground">{creature.race}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/creatures/${creature.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente a {creature.name}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
                    {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium">
                      <Heart className="h-5 w-5 text-red-500" />
                      Salud
                    </span>
                    <span className="text-lg font-bold">
                      {creature.health}/{creature.maxHealth}
                    </span>
                  </div>
                  <Progress value={healthPercentage} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Nivel</p>
                    <p className="text-3xl font-bold">{creature.level}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Experiencia</p>
                    <p className="text-3xl font-bold">{creature.xp}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Ataque Base</p>
                    <p className="text-3xl font-bold">{creature.attackBase}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Defensa Base</p>
                    <p className="text-3xl font-bold">{creature.defenseBase}</p>
                  </div>
                </div>

                {creature.color && (
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">Color</p>
                    <Badge variant="secondary" className="text-base">
                      {creature.color}
                    </Badge>
                  </div>
                )}

                {creature.accessories.length > 0 && (
                  <div>
                    <p className="mb-3 text-sm text-muted-foreground">Accesorios</p>
                    <div className="flex flex-wrap gap-2">
                      {creature.accessories.map((acc, idx) => (
                        <Badge key={idx} variant="outline">
                          {acc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {creature.inCombat && (
                  <Badge variant="destructive" className="w-full justify-center py-2 text-base">
                    En Combate
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
                <CardDescription>Entrena o descansa tu criatura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleTrain} disabled={actionLoading || creature.inCombat}>
                  {actionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Dumbbell className="mr-2 h-4 w-4" />
                  )}
                  Entrenar
                </Button>
                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  onClick={handleRest}
                  disabled={actionLoading || creature.inCombat}
                >
                  {actionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className="mr-2 h-4 w-4" />
                  )}
                  Descansar
                </Button>
                <Button className="w-full" variant="secondary" disabled={creature.inCombat}>
                  <Swords className="mr-2 h-4 w-4" />
                  Combatir
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-medium">{creature.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Propietario</span>
                  <span className="font-medium">{creature.ownerId}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
