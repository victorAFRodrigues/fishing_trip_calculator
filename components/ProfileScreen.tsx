"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useData } from "@/contexts/DataContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mail, Phone, Edit, Fish, DollarSign, Star, Calendar, LogOut, Trophy, Target } from "lucide-react"

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth()
  const { trips, users } = useData()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })

  if (!user) return null

  // Calculate user statistics
  const userTrips = trips.filter((trip) => trip.participants.includes(user.id))
  const totalSpent = userTrips.reduce((sum, trip) => {
    const userExpenses = trip.expenses.filter((expense) => expense.paidBy === user.id)
    return sum + userExpenses.reduce((expSum, expense) => expSum + expense.amount, 0)
  }, 0)

  const averageRating =
    userTrips.length > 0 ? userTrips.reduce((sum, trip) => sum + trip.rating, 0) / userTrips.length : 0

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(formData)
      setIsEditDialogOpen(false)
    } catch (error) {
      alert("Erro ao atualizar perfil")
    }
  }

  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair?")) {
      logout()
    }
  }

  // Recent activity
  const recentTrips = userTrips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)

  // Achievements
  const achievements = [
    {
      id: "first_trip",
      name: "Primeira Pescaria",
      description: "Registrou sua primeira aventura",
      icon: Fish,
      earned: userTrips.length > 0,
    },
    {
      id: "frequent_angler",
      name: "Pescador Frequente",
      description: "Participou de 5+ pescarias",
      icon: Trophy,
      earned: userTrips.length >= 5,
    },
    {
      id: "big_spender",
      name: "Grande Investidor",
      description: "Gastou mais de R$ 1000",
      icon: DollarSign,
      earned: totalSpent >= 1000,
    },
    {
      id: "five_star",
      name: "Excelência",
      description: "Avaliação média 4.5+",
      icon: Star,
      earned: averageRating >= 4.5,
    },
  ]

  return (
    <div className="p-6 pb-24 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações e veja suas estatísticas</p>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-600">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <span className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {user.phone}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <Badge variant={user.isOnline ? "default" : "secondary"}>{user.isOnline ? "Online" : "Offline"}</Badge>
                <Badge variant="outline">Pescador desde 2024</Badge>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                    <DialogDescription>Atualize suas informações pessoais</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleUpdateProfile} className="w-full">
                      Salvar Alterações
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Fish className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pescarias</p>
                <p className="text-2xl font-bold text-gray-900">{userTrips.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Gasto</p>
                <p className="text-2xl font-bold text-gray-900">R$ {totalSpent.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conquistas</p>
                <p className="text-2xl font-bold text-gray-900">{achievements.filter((a) => a.earned).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon
              return (
                <div
                  key={achievement.id}
                  className={`flex items-center p-4 rounded-lg border ${
                    achievement.earned ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.earned ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${achievement.earned ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-semibold ${achievement.earned ? "text-gray-900" : "text-gray-500"}`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-sm ${achievement.earned ? "text-gray-600" : "text-gray-400"}`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.earned && <Badge className="ml-auto bg-green-100 text-green-800">Conquistado</Badge>}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTrips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Fish className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{trip.location}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(trip.date).toLocaleDateString("pt-BR")} • R$ {trip.totalExpenses.toFixed(0)}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < trip.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {recentTrips.length === 0 && (
            <div className="text-center py-8">
              <Fish className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma atividade recente</h3>
              <p className="mt-1 text-sm text-gray-500">Suas pescarias aparecerão aqui</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
