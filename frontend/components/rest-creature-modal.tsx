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
import { Heart, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { getCreatureImageByRace } from "@/lib/utils"
import Image from "next/image"

interface RestCreatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  creatureId: number
}

export function RestCreatureModal({ open, onOpenChange, creatureId }: RestCreatureModalProps) {
  const queryClient = useQueryClient()
  const [resting, setResting] = useState(false)
  const [progress, setProgress] = useState(0)

  const { data: creature } = useQuery({
    queryKey: ["creature", creatureId],
    queryFn: () => CreaturesAPI.getById(creatureId),
    enabled: open,
  })

  const restMutation = useMutation({
    mutationFn: () => CreaturesAPI.rest(creatureId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["creatures"] })
      queryClient.invalidateQueries({ queryKey: ["creature", creatureId] })
      toast.success(`¡${creature?.name} ha descansado!`, {
        description: `Recuperó ${data.health - (creature?.health || 0)} puntos de vida`,
      })
      setResting(false)
      setProgress(0)
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al descansar")
      setResting(false)
      setProgress(0)
    },
  })

  const handleRest = async () => {
    setResting(true)
    setProgress(0)

    // Simulate rest animation with progress
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
    restMutation.mutate()
  }

  if (!creature) return null

  const healthPercentage = (creature.health / creature.maxHealth) * 100
  const imageUrl = creature.imageUrl || getCreatureImageByRace(creature.race)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Descansar - {creature.name}</DialogTitle>
          <DialogDescription>Tu criatura recuperará puntos de vida</DialogDescription>
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

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Salud actual</span>
              <span className="font-medium">
                {creature.health}/{creature.maxHealth}
              </span>
            </div>
            <Progress value={healthPercentage} className="h-2" />
          </div>

          {resting ? (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">Descansando...</p>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-center gap-2">
                <Heart className="h-5 w-5 text-red-500 animate-pulse" />
                <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                <Heart className="h-5 w-5 text-red-500 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {creature.name} descansará y recuperará puntos de vida. El descanso es esencial para mantener a tu
                criatura en óptimas condiciones.
              </p>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Heart className="h-4 w-4" />
                  <span>Recuperación de vida</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={resting}>
            Cancelar
          </Button>
          <Button onClick={handleRest} disabled={resting || creature.health >= creature.maxHealth}>
            {resting ? "Descansando..." : "Iniciar Descanso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
