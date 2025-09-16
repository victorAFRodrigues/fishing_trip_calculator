"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useData } from "@/contexts/DataContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Fish, Users, DollarSign, TrendingUp, Calendar, Star, Calculator, Activity, Target } from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import ExpenseScreen from "./ExpenseScreen"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function HomeScreen() {
  const { user } = useAuth()
  const { trips, users } = useData()
  const [selectedTripForExpenses, setSelectedTripForExpenses] = useState<string | null>(null)

  if (selectedTripForExpenses) {
    return <ExpenseScreen tripId={selectedTripForExpenses} onBack={() => setSelectedTripForExpenses(null)} />
  }

  // Calculate statistics
  const totalTrips = trips.length
  const totalUsers = users.length
  const totalExpenses = trips.reduce((sum, trip) => sum + trip.totalExpenses, 0)
  const averageRating = trips.length > 0 ? trips.reduce((sum, trip) => sum + trip.rating, 0) / trips.length : 0

  // Recent trips (last 3 months)
  const threeMonthsAgo = subMonths(new Date(), 3)
  const recentTrips = trips.filter((trip) => new Date(trip.date) >= threeMonthsAgo)

  // Monthly expenses data for chart
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)

    const monthTrips = trips.filter((trip) =>
      isWithinInterval(new Date(trip.date), { start: monthStart, end: monthEnd }),
    )

    monthlyData.push({
      month: format(date, "MMM", { locale: ptBR }),
      trips: monthTrips.length,
      expenses: monthTrips.reduce((sum, trip) => sum + trip.totalExpenses, 0),
    })
  }

  // Expense categories data
  const categoryData: { [key: string]: number } = {}
  trips.forEach((trip) => {
    trip.expenses.forEach((expense) => {
      categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount
    })
  })

  const pieData = Object.entries(categoryData).map(([category, amount]) => ({
    name: getCategoryName(category),
    value: amount,
  }))

  // Top locations
  const locationData: { [key: string]: number } = {}
  trips.forEach((trip) => {
    locationData[trip.location] = (locationData[trip.location] || 0) + 1
  })

  const topLocations = Object.entries(locationData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  function getCategoryName(category: string) {
    const categories: { [key: string]: string } = {
      fuel: "Combustível",
      bait: "Iscas",
      food: "Alimentação",
      equipment: "Equipamentos",
      supplies: "Suprimentos",
      other: "Outros",
    }
    return categories[category] || "Outros"
  }

  return (
    <div className="p-6 pb-24 lg:pb-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Olá, {user?.name}! 👋</h1>
        <p className="text-gray-600">Aqui está um resumo das suas aventuras de pesca</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Fish className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Pescarias</p>
                <p className="text-2xl font-bold text-gray-900">{totalTrips}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pescadores</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gastos Totais</p>
                <p className="text-2xl font-bold text-gray-900">R$ {totalExpenses.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Tendências Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === "trips" ? `${value} pescarias` : `R$ ${Number(value).toFixed(2)}`,
                    name === "trips" ? "Pescarias" : "Gastos",
                  ]}
                />
                <Bar yAxisId="left" dataKey="trips" fill="#8884d8" name="trips" />
                <Line yAxisId="right" type="monotone" dataKey="expenses" stroke="#82ca9d" name="expenses" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, "Valor"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Locations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Locais Mais Visitados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topLocations.map(([location, count], index) => (
              <div key={location} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{location}</p>
                    <p className="text-sm text-gray-600">{count} pescarias</p>
                  </div>
                </div>
                <Badge variant="secondary">{count}x</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Pescarias Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTrips.slice(0, 5).map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Fish className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{trip.location}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(trip.date), "dd/MM/yyyy")}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {trip.participants.length} pescadores
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        R$ {trip.totalExpenses.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < trip.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTripForExpenses(trip.id)}
                    className="ml-4"
                  >
                    <Calculator className="h-4 w-4 mr-1" />
                    Gastos
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {recentTrips.length === 0 && (
            <div className="text-center py-8">
              <Fish className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma pescaria recente</h3>
              <p className="mt-1 text-sm text-gray-500">Comece registrando sua primeira aventura!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
