"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreaturesAPI } from "@/lib/api"
import { getAllImagesForRace } from "@/lib/utils"
import type { CreatureClass } from "@/lib/types"
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
import { toast } from "sonner"
import { Check } from "lucide-react"

const RACES = ["Men", "Elfs", "Maiar", "Hobbits", "Orcs", "Dwarfs", "Others"]

const CLASSES: { value: CreatureClass; label: string }[] = [
  { value: "mago", label: "Mago" },
  { value: "caballero", label: "Caballero" },
  { value: "ladron", label: "Ladrón" },
  { value: "explorador", label: "Explorador" },
  { value: "clerigo", label: "Clérigo" },
  { value: "bardo", label: "Bardo" },
  { value: "druida", label: "Druida" },
  { value: "paladin", label: "Paladín" },
  { value: "asesino", label: "Asesino" },
  { value: "brujo", label: "Brujo" },
  { value: "monje", label: "Monje" },
  { value: "barbaro", label: "Bárbaro" },
]

interface CreateCreatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCreatureModal({ open, onOpenChange }: CreateCreatureModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<{
    name: string
    race: string
    class: CreatureClass | ""
  }>({
    name: "",
    race: "",
    class: "",
  })
  const [selectedImage, setSelectedImage] = useState<string>("")

  const createMutation = useMutation({
    mutationFn: CreaturesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatures"] })
      toast.success("Criatura creada correctamente")
      onOpenChange(false)
      setFormData({
        name: "",
        race: "",
        class: "",
      })
      setSelectedImage("")
    },
    onError: (error: any) => {
      console.error("[v0] Create creature error:", error)
      console.error("[v0] Error response:", error.response?.data)
      console.error("[v0] Error status:", error.response?.status)
      toast.error(error.response?.data?.message || "Error al crear la criatura")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.class) {
      toast.error("Debes seleccionar una clase")
      return
    }

    const creatureData = {
      name: formData.name,
      race: formData.race.toLowerCase(),
      class: formData.class as CreatureClass,
      imageUrl: selectedImage || undefined,
    }

    console.log("[v0] Creating creature with data:", creatureData)

    createMutation.mutate(creatureData)
  }

  const availableImages = formData.race ? getAllImagesForRace(formData.race) : []

  const handleRaceChange = (value: string) => {
    setFormData({ ...formData, race: value })
    const images = getAllImagesForRace(value)
    setSelectedImage(images[0] || "")
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
              <Select value={formData.race} onValueChange={handleRaceChange} required>
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

            {formData.race && availableImages.length > 0 && (
              <div className="col-span-2 space-y-2">
                <Label>Selecciona una imagen *</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {availableImages.map((imageUrl) => (
                    <button
                      key={imageUrl}
                      type="button"
                      onClick={() => setSelectedImage(imageUrl)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedImage === imageUrl
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={`${formData.race} option`}
                        className="w-full h-full object-cover"
                      />
                      {selectedImage === imageUrl && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="w-8 h-8 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="col-span-2 space-y-2">
              <Label htmlFor="class">Clase *</Label>
              <Select
                value={formData.class}
                onValueChange={(value) => setFormData({ ...formData, class: value as CreatureClass })}
                required
              >
                <SelectTrigger id="class">
                  <SelectValue placeholder="Selecciona una clase" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((cls) => (
                    <SelectItem key={cls.value} value={cls.value}>
                      {cls.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !selectedImage || !formData.class}>
              {createMutation.isPending ? "Creando..." : "Crear Criatura"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
