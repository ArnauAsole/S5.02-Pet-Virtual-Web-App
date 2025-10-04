"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
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
import { Dumbbell, Zap, Heart, Shield } from "lucide-react"
import { toast } from "sonner"

interface TrainCreatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  creatureId: number
}

export function TrainCreatureModal({ open, onOpenChange, creatureId }: TrainCreatureModalProps) {
  const queryClient = useQueryClient()
  const [training, setTraining] = useState(false)

  const { data: creature } = useQuery({
    queryKey: ["creature", creatureId],
    queryFn: () => CreaturesAPI.getById(creatureId),
    enabled: open,
  })

  const handleTrain = async () => {
    setTraining(true)

    // Simulate training animation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast.success(`¡${creature?.name} ha completado el entrenamiento!`, {
      description: "La criatura ha mejorado sus habilidades",
    })

    setTraining(false)
    queryClient.invalidateQueries({ queryKey: ["creatures"] })
    queryClient.invalidateQueries({ queryKey: ["creature", creatureId] })
    onOpenChange(false)
  }

  if (!creature) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Entrenar a {creature.name}</DialogTitle>
          <DialogDescription>Mejora las habilidades de tu criatura</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{creature.name}</h3>
              <Badge variant="secondary">{creature.race}</Badge>
            </div>
          </div>

          {training ? (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">Entrenando...</p>
              <Progress value={66} className="h-2" />
              <div className="flex justify-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500 animate-pulse" />
                <Heart className="h-5 w-5 text-red-500 animate-pulse" />
                <Shield className="h-5 w-5 text-blue-500 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                El entrenamiento mejorará las estadísticas y habilidades de {creature.name}.
              </p>
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fuerza</span>
                  <span className="text-green-600">+5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Resistencia</span>
                  <span className="text-green-600">+3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Agilidad</span>
                  <span className="text-green-600">+4</span>
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
