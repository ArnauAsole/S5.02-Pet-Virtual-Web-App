"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { CreaturesAPI } from "@/lib/api"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Swords, Shield, Heart, Zap, Flag } from "lucide-react"
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
}

export function BattleArena({ open, onOpenChange, preselectedCreatureId }: BattleArenaProps) {
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
      playerHP: 100,
      enemyHP: 100,
      playerMaxHP: 100,
      enemyMaxHP: 100,
      playerDefending: false,
      enemyDefending: false,
      turn: "player",
      log: [`¡Comienza el combate entre ${player.name} y ${enemy.name}!`],
      phase: "battle",
      winner: null,
    })
  }

  const calculateDamage = (attacker: Creature, defending: boolean): number => {
    const baseDamage = 15 + Math.random() * 15
    const modifier = defending ? 0.5 : 1
    return Math.floor(baseDamage * modifier)
  }

  const executeAction = (action: BattleAction) => {
    if (battle.phase !== "battle" || battle.turn !== "player") return

    const newLog = [...battle.log]
    let newPlayerHP = battle.playerHP
    let newEnemyHP = battle.enemyHP
    let newPlayerDefending = false
    let newEnemyDefending = battle.enemyDefending

    // Player action
    if (action === "attack") {
      const damage = calculateDamage(battle.playerCreature!, battle.enemyDefending)
      newEnemyHP = Math.max(0, battle.enemyHP - damage)
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
      })
      return
    }

    // Check if enemy is defeated
    if (newEnemyHP <= 0) {
      newLog.push(`¡${battle.playerCreature!.name} ha ganado el combate!`)
      setBattle({
        ...battle,
        enemyHP: 0,
        log: newLog,
        phase: "result",
        winner: "player",
      })
      toast.success("¡Victoria!", {
        description: `${battle.playerCreature!.name} ha derrotado a ${battle.enemyCreature!.name}`,
      })
      return
    }

    // Enemy turn
    setTimeout(() => {
      const enemyAction = Math.random() > 0.7 ? "defend" : "attack"

      if (enemyAction === "attack") {
        const damage = calculateDamage(battle.enemyCreature!, newPlayerDefending)
        newPlayerHP = Math.max(0, newPlayerHP - damage)
        newLog.push(`${battle.enemyCreature!.name} ataca e inflige ${damage} de daño!`)
        newPlayerDefending = false
      } else {
        newEnemyDefending = true
        newLog.push(`${battle.enemyCreature!.name} se defiende!`)
      }

      // Check if player is defeated
      if (newPlayerHP <= 0) {
        newLog.push(`${battle.enemyCreature!.name} ha ganado el combate!`)
        setBattle({
          ...battle,
          playerHP: 0,
          log: newLog,
          phase: "result",
          winner: "enemy",
        })
        toast.error("Derrota", {
          description: `${battle.enemyCreature!.name} ha derrotado a ${battle.playerCreature!.name}`,
        })
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
      })
    }, 1000)

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
                        {creature.name} ({creature.race})
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
                          {creature.name} ({creature.race})
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
              <div className="space-y-2 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
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
                  <Badge variant="outline" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Defendiendo
                  </Badge>
                )}
              </div>

              {/* Enemy */}
              <div className="space-y-2 p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
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
                  <Badge variant="outline" className="gap-1">
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
                  <p key={i} className="text-sm text-muted-foreground">
                    {entry}
                  </p>
                ))}
              </div>
            </div>

            {/* Actions */}
            {battle.phase === "battle" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => executeAction("attack")}
                  disabled={battle.turn !== "player"}
                  className="flex-1 gap-2"
                  variant="default"
                >
                  <Zap className="h-4 w-4" />
                  Atacar
                </Button>
                <Button
                  onClick={() => executeAction("defend")}
                  disabled={battle.turn !== "player"}
                  className="flex-1 gap-2"
                  variant="secondary"
                >
                  <Shield className="h-4 w-4" />
                  Defender
                </Button>
                <Button
                  onClick={() => executeAction("flee")}
                  disabled={battle.turn !== "player"}
                  className="flex-1 gap-2"
                  variant="outline"
                >
                  <Flag className="h-4 w-4" />
                  Huir
                </Button>
              </div>
            )}

            {battle.phase === "result" && (
              <div className="space-y-3">
                <div className="text-center p-4 border rounded-lg bg-muted/50">
                  <h3 className="text-lg font-bold mb-2">{battle.winner === "player" ? "¡Victoria!" : "Derrota"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {battle.winner === "player"
                      ? `${battle.playerCreature.name} ha ganado el combate`
                      : `${battle.enemyCreature.name} ha ganado el combate`}
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
