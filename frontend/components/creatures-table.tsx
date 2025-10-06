"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CreaturesAPI } from "@/lib/api"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2, Search, Swords, Dumbbell, Heart } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"
import { useSoundEffect } from "@/hooks/use-sound-effect"

const RACES = ["Elf", "Orc", "Dwarf", "Hobbit", "Man", "Ent", "Maiar", "Other"]

interface CreaturesTableProps {
  onTrain?: (creatureId: number) => void
  onBattle?: (creatureId: number) => void
}

export function CreaturesTable({ onTrain, onBattle }: CreaturesTableProps) {
  const queryClient = useQueryClient()
  const isAdmin = auth.isAdmin()
  const playSwordClash = useSoundEffect()

  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [selectedRace, setSelectedRace] = useState<string>("all")

  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ["creatures", debouncedSearch, selectedRace],
    queryFn: async () => {
      const response = await CreaturesAPI.list()
      let creatures = response.content || []

      // Client-side filtering
      if (debouncedSearch) {
        creatures = creatures.filter((c) => c.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      }
      if (selectedRace !== "all") {
        creatures = creatures.filter((c) => c.race === selectedRace)
      }

      return { ...response, content: creatures }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: CreaturesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatures"] })
      toast.success("Criatura eliminada correctamente")
      setDeleteId(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al eliminar la criatura")
    },
  })

  const handleDelete = (id: number) => {
    playSwordClash()
    deleteMutation.mutate(id)
  }

  const handleTrainClick = (id: number) => {
    playSwordClash()
    onTrain?.(id)
  }

  const handleBattleClick = (id: number) => {
    playSwordClash()
    onBattle?.(id)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">Error al cargar las criaturas</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-black/40 backdrop-blur-md p-4 rounded-lg border border-white/10">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          <Select value={selectedRace} onValueChange={setSelectedRace}>
            <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Todas las razas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las razas</SelectItem>
              {RACES.map((race) => (
                <SelectItem key={race} value={race}>
                  {race}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-gray-200">Nombre</TableHead>
              <TableHead className="text-gray-200">Raza</TableHead>
              <TableHead className="text-gray-200">Alineamiento</TableHead>
              <TableHead className="text-gray-200">Hábitat</TableHead>
              <TableHead className="text-gray-200">Habilidades</TableHead>
              <TableHead className="text-right text-gray-200">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={6} className="text-center text-gray-300">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : !data || !data.content || data.content.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                  No se encontraron criaturas
                </TableCell>
              </TableRow>
            ) : (
              data.content.map((creature) => (
                <TableRow key={creature.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{creature.name}</TableCell>
                  <TableCell className="text-gray-300">{creature.race}</TableCell>
                  <TableCell className="text-gray-300">
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      Nivel {creature.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-400" />
                      <span>
                        {creature.health}/{creature.maxHealth}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {creature.accessories && creature.accessories.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {creature.accessories.map((accessory, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-white/20 text-gray-300">
                            {accessory}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onTrain && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTrainClick(creature.id)}
                          title="Entrenar"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Dumbbell className="h-4 w-4" />
                        </Button>
                      )}
                      {onBattle && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleBattleClick(creature.id)}
                          title="Combatir"
                          className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                        >
                          <Swords className="h-4 w-4" />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            playSwordClash()
                            setDeleteId(creature.id)
                          }}
                          title="Eliminar"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La criatura será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
