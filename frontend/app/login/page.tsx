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

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    console.log("[v0] LoginPage mounted, checking auth status")
    if (auth.isAuthed()) {
      console.log("[v0] User already authenticated, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [router])

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log("[v0] Sending login request with data:", { email: data.email, password: "***" })
      const response = await AuthAPI.login(data)
      console.log("[v0] Login response received:", { hasToken: !!response.token })

      auth.setToken(response.token)
      auth.setUser({
        token: response.token,
        roles: [],
        email: data.email,
      })

      console.log("[v0] Token and user saved to localStorage and cookies")
      console.log("[v0] Token in localStorage:", !!auth.getToken())
      console.log("[v0] Cookies:", document.cookie)

      toast.success("Sesión iniciada correctamente")

      console.log("[v0] Attempting to redirect to /dashboard")
      router.push("/dashboard")
      console.log("[v0] router.push called")
    } catch (err: any) {
      console.error("[v0] Login error:", err)
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
                      <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
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
