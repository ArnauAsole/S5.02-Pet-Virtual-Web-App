"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CreaturesAPI } from "@/lib/api"
import { creatureSchema, type CreatureFormData } from "@/lib/schemas"
import { ArrowLeft, Loader2, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const COMMON_RACES = ["Elf", "Dwarf", "Hobbit", "Man", "Orc", "Maia", "Ent", "Dragon", "Balrog"]

export default function NewCreaturePage() {
  const [loading, setLoading] = useState(false)
  const [accessoryInput, setAccessoryInput] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<CreatureFormData>({
    resolver: zodResolver(creatureSchema),
    defaultValues: {
      name: "",
      race: "",
      color: "",
      maxHealth: 100,
      attackBase: 5,
      defenseBase: 3,
      accessories: [],
    },
  })

  const onSubmit = async (data: CreatureFormData) => {
    setLoading(true)
    try {
      await CreaturesAPI.create(data)
      toast({
        title: "Criatura creada",
        description: "Tu criatura ha sido creada exitosamente",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la criatura",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addAccessory = () => {
    if (accessoryInput.trim() && form.getValues("accessories").length < 10) {
      const current = form.getValues("accessories")
      form.setValue("accessories", [...current, accessoryInput.trim()])
      setAccessoryInput("")
    }
  }

  const removeAccessory = (index: number) => {
    const current = form.getValues("accessories")
    form.setValue(
      "accessories",
      current.filter((_, i) => i !== index),
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Crear Nueva Criatura</CardTitle>
            <CardDescription>Añade una nueva criatura a tu colección de la Tierra Media</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Legolas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="race"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raza</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Elf" {...field} />
                      </FormControl>
                      <FormDescription>
                        Razas comunes:{" "}
                        {COMMON_RACES.map((race) => (
                          <button
                            key={race}
                            type="button"
                            onClick={() => form.setValue("race", race)}
                            className="mr-2 text-xs text-primary hover:underline"
                          >
                            {race}
                          </button>
                        ))}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Dorado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="maxHealth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salud Máxima</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>1-200</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="attackBase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ataque Base</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>0-50</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defenseBase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Defensa Base</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>0-50</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label>Accesorios (opcional)</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="Ej: Arco élfico"
                      value={accessoryInput}
                      onChange={(e) => setAccessoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addAccessory()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addAccessory}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {form.watch("accessories").length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.watch("accessories").map((acc, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-1">
                          {acc}
                          <button type="button" onClick={() => removeAccessory(idx)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">Máximo 10 accesorios</p>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear Criatura"
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/dashboard">Cancelar</Link>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
