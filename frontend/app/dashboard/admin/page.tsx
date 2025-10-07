"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { auth } from "@/lib/auth"
import { AdminAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Trash2, Users, Swords } from "lucide-react"
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

export default function AdminPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null)
  const [deleteCreatureId, setDeleteCreatureId] = useState<number | null>(null)

  useEffect(() => {
    if (!auth.isAuthed() || !auth.isAdmin()) {
      router.push("/dashboard")
    }
  }, [router])

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: AdminAPI.listUsers,
  })

  const { data: creatures = [], isLoading: loadingCreatures } = useQuery({
    queryKey: ["admin-creatures"],
    queryFn: AdminAPI.listAllCreatures,
  })

  const deleteUserMutation = useMutation({
    mutationFn: AdminAPI.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success("Usuario eliminado correctamente")
      setDeleteUserId(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al eliminar usuario")
    },
  })

  const deleteCreatureMutation = useMutation({
    mutationFn: AdminAPI.deleteCreature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-creatures"] })
      toast.success("Criatura eliminada correctamente")
      setDeleteCreatureId(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al eliminar criatura")
    },
  })

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
            <p className="text-gray-200">Gestiona usuarios y criaturas del sistema</p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-black/60 border border-white/10">
              <TabsTrigger
                value="users"
                className="gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
              >
                <Users className="h-4 w-4" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger
                value="creatures"
                className="gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
              >
                <Swords className="h-4 w-4" />
                Criaturas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card className="bg-black/60 border-white/10 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Gestión de Usuarios</CardTitle>
                  <CardDescription className="text-gray-300">
                    Lista de todos los usuarios registrados en el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingUsers ? (
                    <p className="text-center py-8 text-gray-300">Cargando usuarios...</p>
                  ) : users.length === 0 ? (
                    <p className="text-center py-8 text-gray-300">No hay usuarios registrados</p>
                  ) : (
                    <div className="rounded-md border border-white/10">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-gray-200">ID</TableHead>
                            <TableHead className="text-gray-200">Email</TableHead>
                            <TableHead className="text-gray-200">Roles</TableHead>
                            <TableHead className="text-right text-gray-200">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                              <TableCell className="font-medium text-white">{user.id}</TableCell>
                              <TableCell className="text-gray-200">{user.email}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {user.roles.map((role) => (
                                    <span
                                      key={role}
                                      className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-amber-600/20 text-amber-400 border border-amber-600/30"
                                    >
                                      {role}
                                    </span>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteUserId(user.id)}
                                  disabled={user.roles.includes("ADMIN")}
                                  className="hover:bg-red-500/20 text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="creatures">
              <Card className="bg-black/60 border-white/10 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Gestión de Criaturas</CardTitle>
                  <CardDescription className="text-gray-300">
                    Lista de todas las criaturas creadas por los usuarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingCreatures ? (
                    <p className="text-center py-8 text-gray-300">Cargando criaturas...</p>
                  ) : creatures.length === 0 ? (
                    <p className="text-center py-8 text-gray-300">No hay criaturas creadas</p>
                  ) : (
                    <div className="rounded-md border border-white/10">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-gray-200">ID</TableHead>
                            <TableHead className="text-gray-200">Nombre</TableHead>
                            <TableHead className="text-gray-200">Raza</TableHead>
                            <TableHead className="text-gray-200">Nivel</TableHead>
                            <TableHead className="text-gray-200">Propietario</TableHead>
                            <TableHead className="text-right text-gray-200">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {creatures.map((creature) => (
                            <TableRow key={creature.id} className="border-white/10 hover:bg-white/5">
                              <TableCell className="font-medium text-white">{creature.id}</TableCell>
                              <TableCell className="text-gray-200">{creature.name}</TableCell>
                              <TableCell className="text-gray-200">{creature.race}</TableCell>
                              <TableCell className="text-gray-200">Nivel {creature.level}</TableCell>
                              <TableCell className="text-gray-200">Usuario #{creature.ownerId}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteCreatureId(creature.id)}
                                  className="hover:bg-red-500/20 text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
