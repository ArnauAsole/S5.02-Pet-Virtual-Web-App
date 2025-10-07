"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "@/lib/schemas"
import { AuthAPI } from "@/lib/api"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import type { z } from "zod"
import { useBackgroundMusic } from "@/hooks/use-background-music"
import { useSoundEffect } from "@/hooks/use-sound-effect"

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  useBackgroundMusic(true)
  const playSwordClash = useSoundEffect("/sounds/sword-clash.mp3")

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    if (auth.isAuthed()) {
      router.push("/dashboard")
    }
  }, [router])

  const onSubmit = async (data: LoginFormData) => {
    playSwordClash()

    try {
      const response = await AuthAPI.login(data)

      auth.setToken(response.token)
      auth.setUser({
        token: response.token,
        roles: [],
        email: data.email,
      })

      toast.success("Sesión iniciada correctamente")

      router.push("/dashboard")
    } catch (err: any) {
      const message = err?.response?.data?.message || "Error de autenticación"
      toast.error(message)
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
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Accede a tu cuenta de Tolkien Creatures</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" autoComplete="off" {...field} />
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Iniciando..." : "Iniciar Sesión"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
