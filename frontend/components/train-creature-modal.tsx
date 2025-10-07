"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CreaturesAPI } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Zap, Heart, Shield } from "lucide-react"
import { toast } from "sonner"
import { getCreatureImageByRace } from "@/lib/utils"
import Image from "next/image"

interface TrainCreatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  creatureId: number
}

export function TrainCreatureModal({ open, onOpenChange, creatureId }: TrainCreatureModalProps) {
  const queryClient = useQueryClient()
  const [training, setTraining] = useState(false)
  const [progress, setProgress] = useState(0)

  const { data: creature } = useQuery({
    queryKey: ["creature", creatureId],
    queryFn: () => CreaturesAPI.getById(creatureId),
    enabled: open,
  })

  const trainMutation = useMutation({
    mutationFn: () => CreaturesAPI.train(creatureId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["creatures"] })
      queryClient.invalidateQueries({ queryKey: ["creature", creatureId] })
      toast.success(`¡${creature?.name} ha completado el entrenamiento!`, {
        description: "La criatura ha mejorado sus habilidades",
      })
      setTraining(false)
      setProgress(0)
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al entrenar")
      setTraining(false)
      setProgress(0)
    },
  })

  const handleTrain = async () => {
    setTraining(true)
    setProgress(0)

    // Simulate training animation with progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Wait for animation to complete
    await new Promise((resolve) => setTimeout(resolve, 2000))
    clearInterval(interval)

    // Call backend
    trainMutation.mutate()
  }

  if (!creature) return null

  const imageUrl = creature.imageUrl || getCreatureImageByRace(creature.race)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Entrenar a {creature.name}</DialogTitle>
          <DialogDescription>Mejora las habilidades de tu criatura</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-primary/10">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={creature.name}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/mystical-griffon.png"
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{creature.name}</h3>
              <Badge variant="secondary">{creature.race}</Badge>
            </div>
          </div>

          {training ? (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">Entrenando...</p>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500 animate-pulse" />
                <Heart className="h-5 w-5 text-red-500 animate-pulse" />
                <Shield className="h-5 w-5 text-blue-500 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                El entrenamiento mejorará las estadísticas de {creature.name} pero consumirá puntos de vida.
              </p>
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ataque</span>
                  <span className="text-green-600">+{Math.floor(creature.attackBase * 0.1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Defensa</span>
                  <span className="text-green-600">+{Math.floor(creature.defenseBase * 0.1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Vida</span>
                  <span className="text-red-600">-{Math.floor(creature.maxHealth * 0.1)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={training}>
            Cancelar
          </Button>
          <Button onClick={handleTrain} disabled={training}>
            {training ? "Entrenando..." : "Iniciar Entrenamiento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
