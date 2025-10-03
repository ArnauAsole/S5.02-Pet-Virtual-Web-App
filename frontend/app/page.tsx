"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Shield, BookOpen, Users } from "lucide-react"
import Link from "next/link"
import { useSound } from "@/hooks/use-sound"

export default function HomePage() {
  const router = useRouter()
  const { play: playSwordClash } = useSound("/sounds/sword-clash.mp3")

  useEffect(() => {
    if (auth.isAuthed()) {
      router.push("/dashboard")
    }
  }, [router])

  const handleAuthClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    playSwordClash()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-amber-900 dark:text-amber-100 mb-4">Tolkien Creatures</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explora y gestiona las criaturas del universo de J.R.R. Tolkien. Desde los nobles Elfos hasta los temibles
            Orcos de la Tierra Media.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/login" onClick={handleAuthClick}>
                Iniciar Sesión
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register" onClick={handleAuthClick}>
                Registrarse
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Sparkles className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-2" />
              <CardTitle>Criaturas Únicas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Descubre criaturas de todas las razas: Elfos, Enanos, Hobbits, Hombres y más.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-2" />
              <CardTitle>Alineamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Clasifica criaturas según su alineamiento: Bueno, Malvado o Neutral.</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-2" />
              <CardTitle>Historia Rica</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Cada criatura tiene su propia historia y habilidades únicas del lore de Tolkien.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-2" />
              <CardTitle>Gestión Completa</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Busca, filtra y gestiona tu colección de criaturas con herramientas avanzadas.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-amber-100 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-2xl">¿Listo para comenzar?</CardTitle>
              <CardDescription className="text-base">
                Únete a la comunidad y empieza a explorar el fascinante mundo de las criaturas de Tolkien.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full md:w-auto">
                <Link href="/register" onClick={handleAuthClick}>
                  Crear Cuenta Gratis
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
