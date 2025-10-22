"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Shield, BookOpen, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (auth.isAuthed()) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url(/images/minas-tirith-pelennor.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay for better text readability */}
      <div className="min-h-screen bg-black/40 backdrop-blur-sm">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">Tolkien Creatures</h1>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto drop-shadow-md">
              Explora y gestiona las criaturas del universo de J.R.R. Tolkien. Desde los nobles Elfos hasta los temibles
              Orcos de la Tierra Media.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="shadow-lg">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-lg"
              >
                <Link href="/register">Registrarse</Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="bg-black/60 backdrop-blur-md border-white/20">
              <CardHeader>
                <Sparkles className="h-8 w-8 text-amber-400 mb-2" />
                <CardTitle className="text-white">Criaturas Únicas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-200">
                  Descubre criaturas de todas las razas: Elfos, Enanos, Hobbits, Hombres y más.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-md border-white/20">
              <CardHeader>
                <Shield className="h-8 w-8 text-amber-400 mb-2" />
                <CardTitle className="text-white">Alineamientos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-200">
                  Clasifica criaturas según su alineamiento: Bueno, Malvado o Neutral.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-md border-white/20">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-amber-400 mb-2" />
                <CardTitle className="text-white">Historia Rica</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-200">
                  Cada criatura tiene su propia historia y habilidades únicas del lore de Tolkien.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-md border-white/20">
              <CardHeader>
                <Users className="h-8 w-8 text-amber-400 mb-2" />
                <CardTitle className="text-white">Gestión Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-200">
                  Busca, filtra y gestiona tu colección de criaturas con herramientas avanzadas.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto bg-amber-900/80 backdrop-blur-md border-amber-700/50">
              <CardHeader>
                <CardTitle className="text-2xl text-white">¿Listo para comenzar?</CardTitle>
                <CardDescription className="text-base text-gray-200">
                  Únete a la comunidad y empieza a explorar el fascinante mundo de las criaturas de Tolkien.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="lg" className="w-full md:w-auto shadow-lg">
                  <Link href="/register">Crear Cuenta Gratis</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
