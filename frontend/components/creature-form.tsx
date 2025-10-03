"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { creatureSchema, type CreatureFormData } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useState } from "react"

const RACES = ["Elf", "Orc", "Dwarf", "Hobbit", "Man", "Ent", "Maiar", "Other"]
const ALIGNMENTS = [
  { value: "GOOD", label: "Bueno" },
  { value: "EVIL", label: "Malvado" },
  { value: "NEUTRAL", label: "Neutral" },
]

interface CreatureFormProps {
  defaultValues?: Partial<CreatureFormData>
  onSubmit: (data: CreatureFormData) => void
  isSubmitting?: boolean
}

export function CreatureForm({ defaultValues, onSubmit, isSubmitting }: CreatureFormProps) {
  const [abilityInput, setAbilityInput] = useState("")

  const form = useForm<CreatureFormData>({
    resolver: zodResolver(creatureSchema),
    defaultValues: {
      name: "",
      race: undefined,
      habitat: "",
      abilities: [],
      alignment: undefined,
      lore: "",
      ...defaultValues,
    },
  })

  const abilities = form.watch("abilities") || []

  const handleAddAbility = () => {
    if (abilityInput.trim() && abilities.length < 10) {
      form.setValue("abilities", [...abilities, abilityInput.trim()])
      setAbilityInput("")
    }
  }

  const handleRemoveAbility = (index: number) => {
    form.setValue(
      "abilities",
      abilities.filter((_, i) => i !== index),
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Legolas" {...field} />
              </FormControl>
              <FormDescription>El nombre de la criatura (2-60 caracteres)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="race"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raza *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una raza" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RACES.map((race) => (
                      <SelectItem key={race} value={race}>
                        {race}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alignment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alineamiento *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un alineamiento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ALIGNMENTS.map((alignment) => (
                      <SelectItem key={alignment.value} value={alignment.value}>
                        {alignment.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="habitat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hábitat</FormLabel>
              <FormControl>
                <Input placeholder="Mirkwood" {...field} />
              </FormControl>
              <FormDescription>Lugar donde habita la criatura (máx. 60 caracteres)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="abilities"
          render={() => (
            <FormItem>
              <FormLabel>Habilidades</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Archery"
                    value={abilityInput}
                    onChange={(e) => setAbilityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddAbility()
                      }
                    }}
                    disabled={abilities.length >= 10}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddAbility}
                    disabled={!abilityInput.trim() || abilities.length >= 10}
                  >
                    Añadir
                  </Button>
                </div>
                {abilities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {abilities.map((ability, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {ability}
                        <button
                          type="button"
                          onClick={() => handleRemoveAbility(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <FormDescription>Habilidades de la criatura (máx. 10, cada una 2-30 caracteres)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Historia</FormLabel>
              <FormControl>
                <Textarea placeholder="Prince of the Woodland Realm..." className="min-h-[120px]" {...field} />
              </FormControl>
              <FormDescription>Historia y descripción de la criatura (máx. 2000 caracteres)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  )
}
