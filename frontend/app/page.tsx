"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"
import { CreaturesTable } from "@/components/creatures-table"
import { CreateCreatureModal } from "@/components/create-creature-modal"
import { TrainCreatureModal } from "@/components/train-creature-modal"
import { BattleArena } from "@/components/battle-arena"
import { Button } from "@/components/ui/button"
import { LogOut, Plus, Swords, Shield } from "lucide-react"
import { useBackgroundMusic } from "@/hooks/use-background-music"
import { useSoundEffect } from "@/hooks/use-sound-effect"

export default function DashboardPage() {
  const router = useRouter()
  useBackgroundMusic(true)
  const playSwordClash = useSoundEffect()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTrainModal, setShowTrainModal] = useState(false)
  const [showBattleArena, setShowBattleArena] = useState(false)
  const [selectedCreatureId, setSelectedCreatureId] = useState<number | null>(null)

  useEffect(() => {
    if (!auth.isAuthed()) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    auth.clear()
    router.push("/login")
  }

  const handleTrain = (creatureId: number) => {
    setSelectedCreatureId(creatureId)
    setShowTrainModal(true)
  }

  const handleBattle = (creatureId: number) => {
    setSelectedCreatureId(creatureId)
    setShowBattleArena(true)
  }

  const user = auth.getUser()
  const isAdmin = auth.isAdmin()

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url(/images/backgrounds/morgothVSglorfindel.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tolkien Creatures</h1>
            <p className="text-sm text-gray-200">Bienvenido, {user?.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          {isAdmin ? (
            <>
              <Button
                onClick={() => {
                  playSwordClash()
                  router.push("/dashboard/admin")
                }}
                size="lg"
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
              >
                <Shield className="h-5 w-5" />
                Panel de Administración
              </Button>
              <Button
                onClick={() => {
                  playSwordClash()
                  setShowCreateModal(true)
                }}
                size="lg"
                className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Crear Nueva Criatura
              </Button>
              <Button
                onClick={() => {
                  playSwordClash()
                  setShowBattleArena(true)
                }}
                size="lg"
                className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg"
              >
                <Swords className="h-5 w-5" />
                Arena de Combate
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  playSwordClash()
                  setShowCreateModal(true)
                }}
                size="lg"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Crear Nueva Criatura
              </Button>
              <Button
                onClick={() => {
                  playSwordClash()
                  setShowBattleArena(true)
                }}
                size="lg"
                className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
              >
                <Swords className="h-5 w-5" />
                Arena de Combate
              </Button>
            </>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 pb-8">
        <CreaturesTable onTrain={handleTrain} onBattle={handleBattle} />
      </main>

      <CreateCreatureModal open={showCreateModal} onOpenChange={setShowCreateModal} />

      {selectedCreatureId && (
        <TrainCreatureModal open={showTrainModal} onOpenChange={setShowTrainModal} creatureId={selectedCreatureId} />
      )}

      <BattleArena
        open={showBattleArena}
        onOpenChange={setShowBattleArena}
        preselectedCreatureId={selectedCreatureId}
      />
    </div>
  )
}
