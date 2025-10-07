"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreaturesAPI } from "@/lib/api"
import { getCreatureImageByRace } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const RACES = ["Men", "Elfs", "Maiar", "Hobbits", "Orcs", "Dwarfs", "Others"]
const ALIGNMENTS = ["GOOD", "EVIL", "NEUTRAL"]

interface CreateCreatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCreatureModal({ open, onOpenChange }: CreateCreatureModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: "",
    race: "",
    alignment: "",
    habitat: "",
    description: "",
    abilities: "",
  })

  const createMutation = useMutation({
    mutationFn: CreaturesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatures"] })
      toast.success("Criatura creada correctamente")
      onOpenChange(false)
      setFormData({
        name: "",
        race: "",
        alignment: "",
        habitat: "",
        description: "",
        abilities: "",
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al crear la criatura")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const abilities = formData.abilities
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0)

    const imageUrl = getCreatureImageByRace(formData.race)

    createMutation.mutate({
      ...formData,
      abilities,
      imageUrl,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Criatura</DialogTitle>
          <DialogDescription>Completa los datos para crear una nueva criatura de la Tierra Media</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Gandalf"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="race">Raza *</Label>
              <Select value={formData.race} onValueChange={(value) => setFormData({ ...formData, race: value })}>
                <SelectTrigger id="race">
                  <SelectValue placeholder="Selecciona una raza" />
                </SelectTrigger>
                <SelectContent>
                  {RACES.map((race) => (
                    <SelectItem key={race} value={race}>
                      {race}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.race && (
              <div className="col-span-2 flex justify-center">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">
                  <img
                    src={getCreatureImageByRace(formData.race) || "/placeholder.svg"}
                    alt={`${formData.race} preview`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="alignment">Alineamiento *</Label>
              <Select
                value={formData.alignment}
                onValueChange={(value) => setFormData({ ...formData, alignment: value })}
              >
                <SelectTrigger id="alignment">
                  <SelectValue placeholder="Selecciona alineamiento" />
                </SelectTrigger>
                <SelectContent>
                  {ALIGNMENTS.map((alignment) => (
                    <SelectItem key={alignment} value={alignment}>
                      {alignment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="habitat">Hábitat</Label>
              <Input
                id="habitat"
                value={formData.habitat}
                onChange={(e) => setFormData({ ...formData, habitat: e.target.value })}
                placeholder="Ej: Bosque Negro"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe la criatura..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="abilities">Habilidades</Label>
            <Input
              id="abilities"
              value={formData.abilities}
              onChange={(e) => setFormData({ ...formData, abilities: e.target.value })}
              placeholder="Separadas por comas: Magia, Vuelo, Invisibilidad"
            />
            <p className="text-xs text-muted-foreground">Separa las habilidades con comas</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creando..." : "Crear Criatura"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
