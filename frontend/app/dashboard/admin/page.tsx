"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { auth } from "@/lib/auth"
import { AdminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trash2, Users, ChevronRight, Heart } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function AdminPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null)
  const [deleteCreatureId, setDeleteCreatureId] = useState<number | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  useEffect(() => {
    if (!auth.isAuthed() || !auth.isAdmin()) {
      router.push("/dashboard")
    }
  }, [router, selectedUserId])

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: AdminAPI.listUsers,
  })

  const { data: userCreatures = [], isLoading: loadingUserCreatures } = useQuery({
    queryKey: ["user-creatures", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) {
        return []
      }
      const creatures = await AdminAPI.getUserCreatures(selectedUserId)
      return creatures
    },
    enabled: selectedUserId !== null,
  })

  const deleteUserMutation = useMutation({
    mutationFn: AdminAPI.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success("Usuario eliminado correctamente")
      setDeleteUserId(null)
      if (selectedUserId === deleteUserId) {
        setSelectedUserId(null)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al eliminar usuario")
    },
  })

  const deleteCreatureMutation = useMutation({
    mutationFn: AdminAPI.deleteCreature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-creatures", selectedUserId] })
      toast.success("Criatura eliminada correctamente")
      setDeleteCreatureId(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al eliminar criatura")
    },
  })

  const selectedUser = users.find((u) => u.id === selectedUserId)

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url(/images/backgrounds/morgothVSglorfindel.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="min-h-screen bg-black/70 backdrop-blur-sm">
        <header className="border-b border-white/10 bg-black/60 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="mb-2 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
            <p className="text-gray-200">Gestiona usuarios y sus criaturas</p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-black/60 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5" />
                  Usuarios
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Haz clic en un usuario para ver sus criaturas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <p className="text-center py-8 text-gray-300">Cargando usuarios...</p>
                ) : users.length === 0 ? (
                  <p className="text-center py-8 text-gray-300">No hay usuarios registrados</p>
                ) : (
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                          selectedUserId === user.id
                            ? "bg-amber-600/20 border-amber-600/50"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-white">{user.email}</p>
                          <div className="flex gap-1 mt-1">
                            {user.roles.map((role) => (
                              <Badge
                                key={role}
                                variant="outline"
                                className="text-xs bg-amber-600/20 text-amber-400 border-amber-600/30"
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteUserId(user.id)
                            }}
                            disabled={user.roles.includes("ROLE_ADMIN")}
                            className="hover:bg-red-500/20 text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">
                  {selectedUser ? `Criaturas de ${selectedUser.email}` : "Criaturas"}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {selectedUser
                    ? "Gestiona las criaturas de este usuario"
                    : "Selecciona un usuario para ver sus criaturas"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedUserId ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                    <p className="text-gray-400">Selecciona un usuario de la lista</p>
                  </div>
                ) : loadingUserCreatures ? (
                  <p className="text-center py-8 text-gray-300">Cargando criaturas...</p>
                ) : userCreatures.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Este usuario no tiene criaturas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userCreatures.map((creature) => (
                      <div
                        key={creature.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        {creature.imageUrl && (
                          <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-black/40">
                            <Image
                              src={creature.imageUrl || "/placeholder.svg"}
                              alt={creature.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{creature.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-600/20 text-blue-400 border-blue-600/30"
                            >
                              {creature.race}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs bg-purple-600/20 text-purple-400 border-purple-600/30"
                            >
                              Nivel {creature.level}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                            <span>
                              {creature.health}/{creature.maxHealth}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteCreatureId(creature.id)}
                          className="hover:bg-red-500/20 text-red-400 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Delete User Confirmation Dialog */}
        <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
          <AlertDialogContent className="bg-black/90 border-white/20 backdrop-blur-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Esta acción no se puede deshacer. Se eliminará permanentemente el usuario y todas sus criaturas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteUserId && deleteUserMutation.mutate(deleteUserId)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Creature Confirmation Dialog */}
        <AlertDialog open={deleteCreatureId !== null} onOpenChange={() => setDeleteCreatureId(null)}>
          <AlertDialogContent className="bg-black/90 border-white/20 backdrop-blur-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Esta acción no se puede deshacer. Se eliminará permanentemente la criatura.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteCreatureId && deleteCreatureMutation.mutate(deleteCreatureId)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
