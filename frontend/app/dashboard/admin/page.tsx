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
      className="min-h-screen bg-background"
      style={{
        backgroundImage: "url(/images/backgrounds/morgothVSglorfindel.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="min-h-screen bg-background/95 backdrop-blur-sm">
        <header className="border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestiona usuarios y criaturas del sistema</p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="creatures" className="gap-2">
                <Swords className="h-4 w-4" />
                Criaturas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>Lista de todos los usuarios registrados en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingUsers ? (
                    <p className="text-center py-8 text-muted-foreground">Cargando usuarios...</p>
                  ) : users.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No hay usuarios registrados</p>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.id}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {user.roles.map((role) => (
                                    <span
                                      key={role}
                                      className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary"
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
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
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
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Criaturas</CardTitle>
                  <CardDescription>Lista de todas las criaturas creadas por los usuarios</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingCreatures ? (
                    <p className="text-center py-8 text-muted-foreground">Cargando criaturas...</p>
                  ) : creatures.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No hay criaturas creadas</p>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Raza</TableHead>
                            <TableHead>Nivel</TableHead>
                            <TableHead>Propietario</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {creatures.map((creature) => (
                            <TableRow key={creature.id}>
                              <TableCell className="font-medium">{creature.id}</TableCell>
                              <TableCell>{creature.name}</TableCell>
                              <TableCell>{creature.race}</TableCell>
                              <TableCell>Nivel {creature.level}</TableCell>
                              <TableCell>Usuario #{creature.ownerId}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => setDeleteCreatureId(creature.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el usuario y todas sus criaturas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteUserId && deleteUserMutation.mutate(deleteUserId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Creature Confirmation Dialog */}
        <AlertDialog open={deleteCreatureId !== null} onOpenChange={() => setDeleteCreatureId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente la criatura.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteCreatureId && deleteCreatureMutation.mutate(deleteCreatureId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
