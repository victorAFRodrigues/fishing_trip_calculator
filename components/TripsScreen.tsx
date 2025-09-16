"use client"

import { useState } from "react"
import { useData } from "@/contexts/DataContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, Edit, Trash2, Fish, MapPin, Calendar, Users, Star, DollarSign, Calculator } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface FishingTrip {
  id: string
  date: string
  location: string
  participants: string[]
  photos: string[]
  rating: number
  totalExpenses: number
  expenses: any[]
}

export default function TripsScreen() {
  const { trips, users, addTrip, updateTrip, deleteTrip } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<FishingTrip | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<FishingTrip | null>(null)
  const [formData, setFormData] = useState({
    date: "",
    location: "",
    participants: [] as string[],
    rating: 5,
    notes: "",
  })

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.participants.some((participantId) => {
        const user = users.find((u) => u.id === participantId)
        return user?.name.toLowerCase().includes(searchTerm.toLowerCase())
      })

    const matchesFilter =
      filterType === "all" ||
      (filterType === "recent" && new Date(trip.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (filterType === "rated" && trip.rating >= 4)

    return matchesSearch && matchesFilter
  })

  const handleAddTrip = () => {
    if (formData.date && formData.location && formData.participants.length > 0) {
      addTrip({
        ...formData,
        photos: [],
        totalExpenses: 0,
        expenses: [],
      })
      resetForm()
      setIsAddDialogOpen(false)
    }
  }

  const handleEditTrip = () => {
    if (editingTrip && formData.date && formData.location && formData.participants.length > 0) {
      updateTrip(editingTrip.id, formData)
      setEditingTrip(null)
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      date: "",
      location: "",
      participants: [],
      rating: 5,
      notes: "",
    })
  }

  const openEditDialog = (trip: FishingTrip) => {
    setEditingTrip(trip)
    setFormData({
      date: trip.date,
      location: trip.location,
      participants: trip.participants,
      rating: trip.rating,
      notes: "",
    })
  }

  const handleDeleteTrip = (tripId: string) => {
    if (confirm("Tem certeza que deseja excluir esta pescaria?")) {
      deleteTrip(tripId)
    }
  }

  const toggleParticipant = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter((id) => id !== userId)
        : [...prev.participants, userId],
    }))
  }

  const getParticipantNames = (participantIds: string[]) => {
    return participantIds
      .map((id) => users.find((user) => user.id === id)?.name)
      .filter(Boolean)
      .join(", ")
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="p-6 pb-24 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pescarias</h1>
        <p className="text-gray-600">Gerencie suas aventuras de pesca</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Fish className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Este Mês</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    trips.filter(
                      (trip) =>
                        new Date(trip.date).getMonth() === new Date().getMonth() &&
                        new Date(trip.date).getFullYear() === new Date().getFullYear(),
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gasto Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {trips.reduce((sum, trip) => sum + trip.totalExpenses, 0).toFixed(0)}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {trips.length > 0
                    ? (trips.reduce((sum, trip) => sum + trip.rating, 0) / trips.length).toFixed(1)
                    : "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por local ou participante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant={filterType === "all" ? "default" : "outline"} onClick={() => setFilterType("all")} size="sm">
            Todas
          </Button>
          <Button
            variant={filterType === "recent" ? "default" : "outline"}
            onClick={() => setFilterType("recent")}
            size="sm"
          >
            Recentes
          </Button>
          <Button
            variant={filterType === "rated" ? "default" : "outline"}
            onClick={() => setFilterType("rated")}
            size="sm"
          >
            Bem Avaliadas
          </Button>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Pescaria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Pescaria</DialogTitle>
              <DialogDescription>Registre uma nova aventura de pesca</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Represa Billings"
                />
              </div>
              <div>
                <Label>Participantes</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={user.id}
                        checked={formData.participants.includes(user.id)}
                        onCheckedChange={() => toggleParticipant(user.id)}
                      />
                      <Label htmlFor={user.id} className="text-sm">
                        {user.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="rating">Avaliação</Label>
                <div className="flex space-x-1 mt-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: i + 1 })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${i < formData.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddTrip} className="w-full">
                Criar Pescaria
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrips.map((trip) => (
          <Card key={trip.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    {trip.location}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {format(new Date(trip.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedTrip(trip)}>
                    <Fish className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(trip)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTrip(trip.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex">{renderStars(trip.rating)}</div>
                  <Badge variant="secondary">R$ {trip.totalExpenses.toFixed(0)}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Participantes:</p>
                  <p className="text-sm font-medium">{getParticipantNames(trip.participants)}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    {trip.participants.length} pescadores
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Navigate to expense splitting
                      console.log("Navigate to expenses for trip:", trip.id)
                    }}
                  >
                    <Calculator className="h-4 w-4 mr-1" />
                    Gastos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trip Details Dialog */}
      <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              {selectedTrip?.location}
            </DialogTitle>
            <DialogDescription>
              {selectedTrip && format(new Date(selectedTrip.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex">{renderStars(selectedTrip.rating)}</div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  R$ {selectedTrip.totalExpenses.toFixed(2)}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Participantes</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTrip.participants.map((participantId) => {
                    const user = users.find((u) => u.id === participantId)
                    return (
                      <Badge key={participantId} variant="outline">
                        {user?.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => openEditDialog(selectedTrip)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={() => {
                    console.log("Navigate to expenses for trip:", selectedTrip.id)
                    setSelectedTrip(null)
                  }}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Gerenciar Gastos
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTrip} onOpenChange={() => setEditingTrip(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Pescaria</DialogTitle>
            <DialogDescription>Atualize os dados da pescaria</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Local</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Represa Billings"
              />
            </div>
            <div>
              <Label>Participantes</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${user.id}`}
                      checked={formData.participants.includes(user.id)}
                      onCheckedChange={() => toggleParticipant(user.id)}
                    />
                    <Label htmlFor={`edit-${user.id}`} className="text-sm">
                      {user.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-rating">Avaliação</Label>
              <div className="flex space-x-1 mt-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: i + 1 })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${i < formData.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleEditTrip} className="w-full">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filteredTrips.length === 0 && (
        <div className="text-center py-12">
          <Fish className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma pescaria encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Tente uma busca diferente" : "Comece registrando sua primeira pescaria"}
          </p>
        </div>
      )}
    </div>
  )
}
