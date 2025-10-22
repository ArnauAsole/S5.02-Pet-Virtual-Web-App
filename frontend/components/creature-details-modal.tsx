"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Sword, Shield, Zap, TrendingUp } from "lucide-react"
import Image from "next/image"
import type { Creature } from "@/lib/types"

interface CreatureDetailsModalProps {
  creature: Creature | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatureDetailsModal({ creature, open, onOpenChange }: CreatureDetailsModalProps) {
  if (!creature) return null

  const healthPercentage = (creature.health / creature.maxHealth) * 100
  const expToNextLevel = 100 // Assuming 100 exp per level
  const expPercentage = (creature.experience / expToNextLevel) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-md border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Detalles de la Criatura</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Creature Image and Basic Info */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-48 w-48 rounded-lg overflow-hidden ring-4 ring-primary/20">
              <Image
                src={creature.imageUrl || "/placeholder.svg"}
                alt={creature.name}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/mystical-griffon.png"
                }}
              />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-3xl font-bold text-foreground">{creature.name}</h3>
              <div className="flex gap-2 justify-center">
                <Badge variant="secondary" className="text-sm">
                  {creature.race}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {creature.characterClass}
                </Badge>
                <Badge className="text-sm bg-blue-500/20 text-blue-300 border-blue-500/30">
                  Nivel {creature.level}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Health */}
            <div className="space-y-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-400" />
                <span className="font-semibold text-red-300">Salud</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actual</span>
                  <span className="font-mono font-bold text-foreground">
                    {creature.health}/{creature.maxHealth}
                  </span>
                </div>
                <Progress value={healthPercentage} className="h-2 bg-red-950" />
              </div>
            </div>

            {/* Attack */}
            <div className="space-y-2 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2">
                <Sword className="h-5 w-5 text-orange-400" />
                <span className="font-semibold text-orange-300">Ataque</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base</span>
                  <span className="font-mono font-bold text-foreground">{creature.attackBase || creature.attack}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-mono font-bold text-orange-300">{creature.attack}</span>
                </div>
              </div>
            </div>

            {/* Defense */}
            <div className="space-y-2 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-blue-300">Defensa</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base</span>
                  <span className="font-mono font-bold text-foreground">
                    {creature.defenseBase || creature.defense}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-mono font-bold text-blue-300">{creature.defense}</span>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-2 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span className="font-semibold text-purple-300">Experiencia</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actual</span>
                  <span className="font-mono font-bold text-foreground">
                    {creature.experience}/{expToNextLevel}
                  </span>
                </div>
                <Progress value={expPercentage} className="h-2 bg-purple-950" />
              </div>
            </div>
          </div>

          {/* Combat Status */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold">Estado de Combate</span>
              </div>
              <Badge variant={creature.inCombat ? "destructive" : "secondary"}>
                {creature.inCombat ? "En Combate" : "Disponible"}
              </Badge>
            </div>
          </div>

          {/* Accessories */}
          {creature.accessories && creature.accessories.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Accesorios</h4>
              <div className="flex gap-2 flex-wrap">
                {creature.accessories.map((accessory, i) => (
                  <Badge key={i} variant="outline" className="border-white/20">
                    {accessory}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
