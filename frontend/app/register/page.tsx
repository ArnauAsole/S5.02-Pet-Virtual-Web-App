"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema } from "@/lib/schemas"
import { AuthAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import type { z } from "zod"
import { useBackgroundMusic } from "@/hooks/use-background-music"
import { useSoundEffect } from "@/hooks/use-sound-effect"
import { getAllProfileImages } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Check } from "lucide-react"
import { auth } from "@/lib/auth"

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  useBackgroundMusic(true)
  const playSwordClash = useSoundEffect("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Efecto%20de%20sonido%20de%20katana%20desenfundada%20-%20Sound%20Effects%20%26%20Music%20%28youtube%29-fyrDOqylrPPof3Fge4Ua0G9Ij47LwX.mp3")

  const [selectedProfileImage, setSelectedProfileImage] = useState<string>(getAllProfileImages()[0])
  const profileImages = getAllProfileImages()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    playSwordClash()

    console.log("[v0] Register attempt with email:", data.email)
    console.log("[v0] Selected profile image:", selectedProfileImage)
    console.log("[v0] API URL:", process.env.NEXT_PUBLIC_API_URL)

    try {
      const fullProfileImageUrl = selectedProfileImage.startsWith("http")
        ? selectedProfileImage
        : `${window.location.origin}${selectedProfileImage}`

      const payload = {
        email: data.email,
        password: data.password,
        profileImage: fullProfileImageUrl,
      }
      console.log("[v0] Sending register payload:", payload)

      const response = await AuthAPI.register(payload)
      console.log("[v0] Register response:", response)

      if (response.token) {
        console.log("[v0] Token received, setting auth...")
        auth.setToken(response.token)
        console.log("[v0] Auth set successfully, redirecting to dashboard...")
        toast.success("Usuario creado correctamente. Redirigiendo...")
        setTimeout(() => router.push("/dashboard"), 1500)
      } else {
        console.log("[v0] No token received, redirecting to login...")
        toast.success("Usuario creado correctamente. Redirigiendo...")
        setTimeout(() => router.push("/login"), 1500)
      }
    } catch (err: any) {
      console.log("[v0] ===== REGISTER ERROR DETAILS =====")
      console.log("[v0] Error object:", err)
      console.log("[v0] Error code:", err.code)
      console.log("[v0] Error message:", err.message)
      console.log("[v0] Response status:", err.response?.status)
      console.log("[v0] Response data:", err.response?.data)
      console.log("[v0] Response headers:", err.response?.headers)
      console.log("[v0] =====================================")

      let errorMessage = "No se pudo crear el usuario"

      if (err.code === "ERR_NETWORK" || !err.response) {
        errorMessage = "No se puede conectar con el servidor. Verifica que la API esté activa en http://localhost:8080"
      } else if (err.response?.status === 409) {
        errorMessage = "Este email ya está registrado. Prueba con otro email."
      } else if (err.response?.status === 400) {
        errorMessage =
          err.response?.data?.message || err.response?.data?.error || "Datos inválidos. Verifica el formulario."
      } else if (err.response?.status >= 500) {
        errorMessage = "Error del servidor. Inténtalo más tarde."
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }

      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/company.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <Card className="w-full max-w-md relative z-10 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>Regístrate en Tolkien Creatures</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Imagen de Perfil</FormLabel>
                <div className="grid grid-cols-4 gap-2">
                  {profileImages.map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedProfileImage(image)}
                      className={`relative rounded-full border-2 transition-all ${
                        selectedProfileImage === image
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={image || "/placeholder.svg"} alt="Profile" />
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                      {selectedProfileImage === image && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormDescription>Mínimo 8 caracteres, 1 mayúscula y 1 número</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creando..." : "Crear Cuenta"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
