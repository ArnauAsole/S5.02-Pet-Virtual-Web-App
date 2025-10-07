"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreaturesAPI } from "@/lib/api"
import { getAllImagesForRace } from "@/lib/utils"
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
import { Check } from "lucide-react"

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
        alignment: "",
        habitat: "",
        description: "",
        abilities: "",
      })
      setSelectedImage("")
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

    createMutation.mutate({
      ...formData,
      abilities,
      imageUrl: selectedImage,
    })
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
              <Select value={formData.race} onValueChange={handleRaceChange}>
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
            <Button type="submit" disabled={createMutation.isPending || !selectedImage}>
              {createMutation.isPending ? "Creando..." : "Crear Criatura"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
