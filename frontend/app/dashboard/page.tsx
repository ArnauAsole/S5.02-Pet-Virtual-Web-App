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

export default function DashboardPage() {
  const router = useRouter()
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
      className="min-h-screen bg-background"
      style={{
        backgroundImage: "url(/images/backgrounds/morgothVSglorfindel.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="min-h-screen bg-background/95 backdrop-blur-sm">
        <header className="border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Tolkien Creatures</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido, {user?.email} {isAdmin && <span className="text-amber-600 font-semibold">(Admin)</span>}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-3 mb-6">
            <Button onClick={() => setShowCreateModal(true)} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Crear Nueva Criatura
            </Button>
            <Button onClick={() => setShowBattleArena(true)} size="lg" variant="secondary" className="gap-2">
              <Swords className="h-5 w-5" />
              Arena de Combate
            </Button>
            {isAdmin && (
              <Button onClick={() => router.push("/dashboard/admin")} size="lg" variant="outline" className="gap-2">
                <Shield className="h-5 w-5" />
                Panel de Administración
              </Button>
            )}
          </div>
        </div>

        <main className="container mx-auto px-4 pb-8">
          <CreaturesTable onTrain={handleTrain} onBattle={handleBattle} />
        </main>

        <CreateCreatureModal open={showCreateModal} onOpenChange={setShowCreateModal} />

        {selectedCreatureId && (
          <>
            <TrainCreatureModal
              open={showTrainModal}
              onOpenChange={setShowTrainModal}
              creatureId={selectedCreatureId}
            />
          </>
        )}

        <BattleArena
          open={showBattleArena}
          onOpenChange={setShowBattleArena}
          preselectedCreatureId={selectedCreatureId}
        />
      </div>
    </div>
  )
}
