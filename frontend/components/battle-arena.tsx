"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CreaturesAPI } from "@/lib/api"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Swords, Shield, Heart, Zap, Flag, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { Creature } from "@/lib/types"

interface BattleArenaProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedCreatureId?: number | null
}

type BattleAction = "attack" | "defend" | "flee"
type BattlePhase = "selection" | "battle" | "result"

interface BattleState {
  playerCreature: Creature | null
  enemyCreature: Creature | null
  playerHP: number
  enemyHP: number
  playerMaxHP: number
  enemyMaxHP: number
  playerDefending: boolean
  enemyDefending: boolean
  turn: "player" | "enemy"
  log: string[]
  phase: BattlePhase
  winner: "player" | "enemy" | null
  isAnimating: boolean
}

export function BattleArena({ open, onOpenChange, preselectedCreatureId }: BattleArenaProps) {
  const queryClient = useQueryClient()
  const { data: creaturesData } = useQuery({
    queryKey: ["creatures"],
    queryFn: () => CreaturesAPI.list({ page: 0, size: 100 }),
    enabled: open,
  })

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("")
  const [selectedEnemyId, setSelectedEnemyId] = useState<string>("")

  const [battle, setBattle] = useState<BattleState>({
    playerCreature: null,
    enemyCreature: null,
    playerHP: 100,
    enemyHP: 100,
    playerMaxHP: 100,
    enemyMaxHP: 100,
    playerDefending: false,
    enemyDefending: false,
    turn: "player",
    log: [],
    phase: "selection",
    winner: null,
    isAnimating: false,
  })

  useEffect(() => {
    if (preselectedCreatureId) {
      setSelectedPlayerId(preselectedCreatureId.toString())
    }
  }, [preselectedCreatureId])

  const creatures = creaturesData?.content || []

  const startBattle = () => {
    const player = creatures.find((c) => c.id.toString() === selectedPlayerId)
    const enemy = creatures.find((c) => c.id.toString() === selectedEnemyId)

    if (!player || !enemy) {
      toast.error("Selecciona ambas criaturas para comenzar")
      return
    }

    setBattle({
      playerCreature: player,
      enemyCreature: enemy,
      playerHP: player.health,
      enemyHP: enemy.health,
      playerMaxHP: player.health,
      enemyMaxHP: enemy.health,
      playerDefending: false,
      enemyDefending: false,
      turn: "player",
      log: [`¡Comienza el combate entre ${player.name} y ${enemy.name}!`],
      phase: "battle",
      winner: null,
      isAnimating: false,
    })
  }

  const calculateDamage = (attacker: Creature, defending: boolean): number => {
    const baseDamage = 15 + Math.random() * 15
    const modifier = defending ? 0.5 : 1
    return Math.floor(baseDamage * modifier)
  }

  const updateCreatureHealth = async (creatureId: number, newHealth: number) => {
    try {
      await CreaturesAPI.update(creatureId, { health: Math.max(1, newHealth) })
      queryClient.invalidateQueries({ queryKey: ["creatures"] })
    } catch (error) {
      console.error("Error updating creature health:", error)
    }
  }

  const executeAction = (action: BattleAction) => {
    if (battle.phase !== "battle" || battle.turn !== "player" || battle.isAnimating) return

    setBattle((prev) => ({ ...prev, isAnimating: true }))

    const newLog = [...battle.log]
    let newPlayerHP = battle.playerHP
    let newEnemyHP = battle.enemyHP
    let newPlayerDefending = false
    let newEnemyDefending = battle.enemyDefending

    // Player action
    if (action === "attack") {
      const damage = calculateDamage(battle.playerCreature!, battle.enemyDefending)
      newEnemyHP = Math.max(1, battle.enemyHP - damage)
      newLog.push(`${battle.playerCreature!.name} ataca e inflige ${damage} de daño!`)
      newEnemyDefending = false
    } else if (action === "defend") {
      newPlayerDefending = true
      newLog.push(`${battle.playerCreature!.name} se defiende!`)
    } else if (action === "flee") {
      newLog.push(`${battle.playerCreature!.name} huye del combate!`)
      setBattle({
        ...battle,
        log: newLog,
        phase: "result",
        winner: "enemy",
        isAnimating: false,
      })
      updateCreatureHealth(battle.playerCreature!.id, battle.playerHP)
      updateCreatureHealth(battle.enemyCreature!.id, battle.enemyHP)
      return
    }

    // Check if enemy is defeated
    if (newEnemyHP <= 1) {
      newLog.push(`¡${battle.playerCreature!.name} ha ganado el combate!`)
      newLog.push(`${battle.playerCreature!.name} gana 30 puntos de experiencia!`)
      setBattle({
        ...battle,
        enemyHP: 1,
        log: newLog,
        phase: "result",
        winner: "player",
        isAnimating: false,
      })
      toast.success("¡Victoria!", {
        description: `${battle.playerCreature!.name} ha derrotado a ${battle.enemyCreature!.name}`,
      })
      updateCreatureHealth(battle.playerCreature!.id, newPlayerHP)
      updateCreatureHealth(battle.enemyCreature!.id, 1)
      return
    }

    // Enemy turn
    setTimeout(() => {
      const enemyAction = Math.random() > 0.7 ? "defend" : "attack"

      if (enemyAction === "attack") {
        const damage = calculateDamage(battle.enemyCreature!, newPlayerDefending)
        newPlayerHP = Math.max(1, newPlayerHP - damage)
        newLog.push(`${battle.enemyCreature!.name} ataca e inflige ${damage} de daño!`)
        newPlayerDefending = false
      } else {
        newEnemyDefending = true
        newLog.push(`${battle.enemyCreature!.name} se defiende!`)
      }

      // Check if player is defeated
      if (newPlayerHP <= 1) {
        newLog.push(`${battle.enemyCreature!.name} ha ganado el combate!`)
        newLog.push(`${battle.enemyCreature!.name} gana 30 puntos de experiencia!`)
        setBattle({
          ...battle,
          playerHP: 1,
          log: newLog,
          phase: "result",
          winner: "enemy",
          isAnimating: false,
        })
        toast.error("Derrota", {
          description: `${battle.enemyCreature!.name} ha derrotado a ${battle.playerCreature!.name}`,
        })
        updateCreatureHealth(battle.playerCreature!.id, 1)
        updateCreatureHealth(battle.enemyCreature!.id, newEnemyHP)
        return
      }

      setBattle({
        ...battle,
        playerHP: newPlayerHP,
        enemyHP: newEnemyHP,
        playerDefending: newPlayerDefending,
        enemyDefending: newEnemyDefending,
        log: newLog,
        turn: "player",
        isAnimating: false,
      })
    }, 1500)

    setBattle({
      ...battle,
      playerHP: newPlayerHP,
      enemyHP: newEnemyHP,
      playerDefending: newPlayerDefending,
      enemyDefending: newEnemyDefending,
      log: newLog,
      turn: "enemy",
    })
  }

  const resetBattle = () => {
    setBattle({
      playerCreature: null,
      enemyCreature: null,
      playerHP: 100,
      enemyHP: 100,
      playerMaxHP: 100,
      enemyMaxHP: 100,
      playerDefending: false,
      enemyDefending: false,
      turn: "player",
      log: [],
      phase: "selection",
      winner: null,
      isAnimating: false,
    })
    setSelectedPlayerId(preselectedCreatureId?.toString() || "")
    setSelectedEnemyId("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Arena de Combate
          </DialogTitle>
          <DialogDescription>Combate por turnos entre criaturas</DialogDescription>
        </DialogHeader>

        {battle.phase === "selection" && (
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tu Criatura</label>
                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu criatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {creatures.map((creature) => (
                      <SelectItem key={creature.id} value={creature.id.toString()}>
                        {creature.name} ({creature.race}) - HP: {creature.health}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Enemigo</label>
                <Select value={selectedEnemyId} onValueChange={setSelectedEnemyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el enemigo" />
                  </SelectTrigger>
                  <SelectContent>
                    {creatures
                      .filter((c) => c.id.toString() !== selectedPlayerId)
                      .map((creature) => (
                        <SelectItem key={creature.id} value={creature.id.toString()}>
                          {creature.name} ({creature.race}) - HP: {creature.health}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={startBattle} className="w-full" size="lg">
              <Swords className="mr-2 h-5 w-5" />
              Comenzar Combate
            </Button>
          </div>
        )}

        {(battle.phase === "battle" || battle.phase === "result") && battle.playerCreature && battle.enemyCreature && (
          <div className="space-y-4 py-4">
            {/* Battle Status */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Player */}
              <div
                className={`space-y-2 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 transition-all duration-300 ${
                  battle.turn === "player" && battle.phase === "battle" ? "ring-2 ring-blue-500 shadow-lg" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{battle.playerCreature.name}</h3>
                  <Badge variant="secondary">{battle.playerCreature.race}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      HP
                    </span>
                    <span>
                      {battle.playerHP}/{battle.playerMaxHP}
                    </span>
                  </div>
                  <Progress value={(battle.playerHP / battle.playerMaxHP) * 100} className="h-2" />
                </div>
                {battle.playerDefending && (
                  <Badge variant="outline" className="gap-1 animate-pulse">
                    <Shield className="h-3 w-3" />
                    Defendiendo
                  </Badge>
                )}
              </div>

              {/* Enemy */}
              <div
                className={`space-y-2 p-4 border rounded-lg bg-red-50 dark:bg-red-950/20 transition-all duration-300 ${
                  battle.turn === "enemy" && battle.phase === "battle" ? "ring-2 ring-red-500 shadow-lg" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{battle.enemyCreature.name}</h3>
                  <Badge variant="secondary">{battle.enemyCreature.race}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      HP
                    </span>
                    <span>
                      {battle.enemyHP}/{battle.enemyMaxHP}
                    </span>
                  </div>
                  <Progress value={(battle.enemyHP / battle.enemyMaxHP) * 100} className="h-2" />
                </div>
                {battle.enemyDefending && (
                  <Badge variant="outline" className="gap-1 animate-pulse">
                    <Shield className="h-3 w-3" />
                    Defendiendo
                  </Badge>
                )}
              </div>
            </div>

            {/* Battle Log */}
            <div className="border rounded-lg p-4 bg-muted/50 max-h-40 overflow-y-auto">
              <h4 className="text-sm font-semibold mb-2">Registro de Combate</h4>
              <div className="space-y-1">
                {battle.log.map((entry, i) => (
                  <p key={i} className="text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2">
                    {entry}
                  </p>
                ))}
              </div>
            </div>

            {/* Actions - Enhanced with animations and better styling */}
            {battle.phase === "battle" && (
              <div className="relative">
                {battle.turn === "player" && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-medium text-primary animate-pulse">
                    Tu turno
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => executeAction("attack")}
                    disabled={battle.turn !== "player" || battle.isAnimating}
                    className="flex-col h-24 gap-2 bg-gradient-to-br from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Zap className="h-6 w-6" />
                    <span className="font-semibold">Atacar</span>
                  </Button>
                  <Button
                    onClick={() => executeAction("defend")}
                    disabled={battle.turn !== "player" || battle.isAnimating}
                    className="flex-col h-24 gap-2 bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Shield className="h-6 w-6" />
                    <span className="font-semibold">Defender</span>
                  </Button>
                  <Button
                    onClick={() => executeAction("flee")}
                    disabled={battle.turn !== "player" || battle.isAnimating}
                    className="flex-col h-24 gap-2 bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Flag className="h-6 w-6" />
                    <span className="font-semibold">Huir</span>
                  </Button>
                </div>
              </div>
            )}

            {battle.phase === "result" && (
              <div className="space-y-3">
                <div
                  className={`text-center p-6 border rounded-lg ${
                    battle.winner === "player"
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800"
                      : "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800"
                  } animate-in zoom-in-50 duration-500`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-6 w-6" />
                    <h3 className="text-2xl font-bold">{battle.winner === "player" ? "¡Victoria!" : "Derrota"}</h3>
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {battle.winner === "player"
                      ? `${battle.playerCreature.name} ha ganado el combate y gana 30 XP`
                      : `${battle.enemyCreature.name} ha ganado el combate y gana 30 XP`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Las criaturas mantienen su salud actual después del combate
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={resetBattle} className="flex-1">
                    Nuevo Combate
                  </Button>
                  <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
