"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CreaturesAPI } from "@/lib/api"
import { auth } from "@/lib/auth"
import type { CreatureFilters } from "@/lib/types"
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
import { Pencil, Trash2, Eye, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

const RACES = ["Elf", "Orc", "Dwarf", "Hobbit", "Man", "Ent", "Maiar", "Other"]
const ALIGNMENTS = ["GOOD", "EVIL", "NEUTRAL"]

export function CreaturesTable() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isAdmin = auth.isAdmin()

  const [filters, setFilters] = useState<CreatureFilters>({
    page: 0,
    size: 20,
    sort: "name,asc",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 500)

  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ["creatures", { ...filters, name: debouncedSearch }],
    queryFn: () => CreaturesAPI.list({ ...filters, name: debouncedSearch }),
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
    deleteMutation.mutate(id)
  }

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case "GOOD":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "EVIL":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      case "NEUTRAL":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
      default:
        return ""
    }
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={filters.race || "all"}
            onValueChange={(value) => setFilters({ ...filters, race: value === "all" ? undefined : value, page: 0 })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Raza" />
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

          <Select
            value={filters.alignment || "all"}
            onValueChange={(value) =>
              setFilters({ ...filters, alignment: value === "all" ? undefined : (value as any), page: 0 })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Alineamiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {ALIGNMENTS.map((alignment) => (
                <SelectItem key={alignment} value={alignment}>
                  {alignment}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isAdmin && (
          <Button onClick={() => router.push("/creatures/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Criatura
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Raza</TableHead>
              <TableHead>Alineamiento</TableHead>
              <TableHead>Hábitat</TableHead>
              <TableHead>Habilidades</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : data?.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No se encontraron criaturas</p>
                  {isAdmin && (
                    <Button variant="link" onClick={() => router.push("/creatures/new")} className="mt-2">
                      Crear la primera criatura
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data?.content.map((creature) => (
                <TableRow key={creature.id}>
                  <TableCell className="font-medium">{creature.name}</TableCell>
                  <TableCell>{creature.race}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getAlignmentColor(creature.alignment)}>
                      {creature.alignment}
                    </Badge>
                  </TableCell>
                  <TableCell>{creature.habitat || "-"}</TableCell>
                  <TableCell>
                    {creature.abilities && creature.abilities.length > 0 ? (
                      <div className="flex gap-1">
                        {creature.abilities.slice(0, 2).map((ability, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {ability}
                          </Badge>
                        ))}
                        {creature.abilities.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{creature.abilities.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/creatures/${creature.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/creatures/${creature.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(creature.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {data.content.length} de {data.totalElements} criaturas
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === 0}
              onClick={() => setFilters({ ...filters, page: (filters.page || 0) - 1 })}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.last}
              onClick={() => setFilters({ ...filters, page: (filters.page || 0) + 1 })}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

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
