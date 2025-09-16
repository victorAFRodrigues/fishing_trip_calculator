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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Users,
  Calculator,
  Share,
  Fuel,
  FishIcon,
  Utensils,
  ShoppingBag,
  Wrench,
  MoreHorizontal,
} from "lucide-react"

interface Expense {
  id: string
  description: string
  amount: number
  paidBy: string
  splitBetween: string[]
  category: string
  date: string
}

interface ExpenseScreenProps {
  tripId: string
  onBack: () => void
}

const expenseCategories = [
  { id: "fuel", name: "Combustível", icon: Fuel, color: "bg-red-500" },
  { id: "bait", name: "Iscas", icon: FishIcon, color: "bg-blue-500" },
  { id: "food", name: "Alimentação", icon: Utensils, color: "bg-green-500" },
  { id: "equipment", name: "Equipamentos", icon: Wrench, color: "bg-purple-500" },
  { id: "supplies", name: "Suprimentos", icon: ShoppingBag, color: "bg-orange-500" },
  { id: "other", name: "Outros", icon: MoreHorizontal, color: "bg-gray-500" },
]

export default function ExpenseScreen({ tripId, onBack }: ExpenseScreenProps) {
  const { trips, users, addExpense, updateExpense, deleteExpense } = useData()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splitBetween: [] as string[],
    category: "other",
  })

  const trip = trips.find((t) => t.id === tripId)
  if (!trip) return null

  const tripParticipants = trip.participants.map((id) => users.find((u) => u.id === id)).filter(Boolean)

  // Calculate balances
  const calculateBalances = () => {
    const balances: { [userId: string]: number } = {}

    // Initialize balances
    trip.participants.forEach((userId) => {
      balances[userId] = 0
    })

    // Calculate what each person owes/is owed
    trip.expenses.forEach((expense) => {
      const amountPerPerson = expense.amount / expense.splitBetween.length

      // Person who paid gets credited
      balances[expense.paidBy] += expense.amount

      // People who owe get debited
      expense.splitBetween.forEach((userId) => {
        balances[userId] -= amountPerPerson
      })
    })

    return balances
  }

  const balances = calculateBalances()

  const handleAddExpense = () => {
    if (formData.description && formData.amount && formData.paidBy && formData.splitBetween.length > 0) {
      addExpense(tripId, {
        ...formData,
        amount: Number.parseFloat(formData.amount),
        date: new Date().toISOString().split("T")[0],
      })
      resetForm()
      setIsAddDialogOpen(false)
    }
  }

  const handleEditExpense = () => {
    if (
      editingExpense &&
      formData.description &&
      formData.amount &&
      formData.paidBy &&
      formData.splitBetween.length > 0
    ) {
      updateExpense(tripId, editingExpense.id, {
        ...formData,
        amount: Number.parseFloat(formData.amount),
      })
      setEditingExpense(null)
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      paidBy: "",
      splitBetween: [],
      category: "other",
    })
  }

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      paidBy: expense.paidBy,
      splitBetween: expense.splitBetween,
      category: expense.category,
    })
  }

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm("Tem certeza que deseja excluir este gasto?")) {
      deleteExpense(tripId, expenseId)
    }
  }

  const toggleSplitParticipant = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(userId)
        ? prev.splitBetween.filter((id) => id !== userId)
        : [...prev.splitBetween, userId],
    }))
  }

  const getCategoryInfo = (categoryId: string) => {
    return expenseCategories.find((cat) => cat.id === categoryId) || expenseCategories[expenseCategories.length - 1]
  }

  const generateReport = () => {
    const reportLines = [
      `📊 RELATÓRIO DE GASTOS - ${trip.location}`,
      `📅 Data: ${new Date(trip.date).toLocaleDateString("pt-BR")}`,
      "",
      `💰 RESUMO FINANCEIRO:`,
      `• Total de gastos: R$ ${trip.totalExpenses.toFixed(2)}`,
      `• Valor por pessoa: R$ ${(trip.totalExpenses / trip.participants.length).toFixed(2)}`,
      "",
      `👥 SALDOS INDIVIDUAIS:`,
    ]

    Object.entries(balances).forEach(([userId, balance]) => {
      const user = users.find((u) => u.id === userId)
      if (user) {
        if (balance > 0.01) {
          reportLines.push(`• ${user.name}: Deve receber R$ ${balance.toFixed(2)} ✅`)
        } else if (balance < -0.01) {
          reportLines.push(`• ${user.name}: Deve pagar R$ ${Math.abs(balance).toFixed(2)} ❌`)
        } else {
          reportLines.push(`• ${user.name}: Está quite ⚖️`)
        }
      }
    })

    reportLines.push("")
    reportLines.push(`📋 DETALHES DOS GASTOS:`)

    trip.expenses.forEach((expense, index) => {
      const payer = users.find((u) => u.id === expense.paidBy)
      const category = getCategoryInfo(expense.category)
      reportLines.push(`${index + 1}. ${expense.description}`)
      reportLines.push(`   💵 R$ ${expense.amount.toFixed(2)} - Pago por: ${payer?.name}`)
      reportLines.push(`   📂 Categoria: ${category.name}`)
      reportLines.push("")
    })

    const reportText = reportLines.join("\n")

    if (navigator.share) {
      navigator.share({
        title: `Relatório de Gastos - ${trip.location}`,
        text: reportText,
      })
    } else {
      navigator.clipboard.writeText(reportText)
      alert("Relatório copiado para a área de transferência!")
    }
  }

  return (
    <div className="p-6 pb-24 lg:pb-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Voltar para Pescarias
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Divisão de Gastos</h1>
        <p className="text-gray-600">
          {trip.location} - {new Date(trip.date).toLocaleDateString("pt-BR")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Gastos</p>
                <p className="text-2xl font-bold text-gray-900">R$ {trip.totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Por Pessoa</p>
                <p className="text-2xl font-bold text-gray-900">
                  R${" "}
                  {trip.participants.length > 0 ? (trip.totalExpenses / trip.participants.length).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Itens</p>
                <p className="text-2xl font-bold text-gray-900">{trip.expenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Saldos Individuais</span>
            <Button onClick={generateReport} variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Compartilhar Relatório
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(balances).map(([userId, balance]) => {
              const user = users.find((u) => u.id === userId)
              if (!user) return null

              return (
                <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="text-right">
                    {balance > 0.01 ? (
                      <Badge className="bg-green-100 text-green-800">+R$ {balance.toFixed(2)}</Badge>
                    ) : balance < -0.01 ? (
                      <Badge className="bg-red-100 text-red-800">-R$ {Math.abs(balance).toFixed(2)}</Badge>
                    ) : (
                      <Badge variant="secondary">Quite</Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Expense Button */}
      <div className="mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Gasto</DialogTitle>
              <DialogDescription>Adicione um novo gasto à pescaria</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Combustível para o barco"
                />
              </div>
              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => {
                      const Icon = category.icon
                      return (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2" />
                            {category.name}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paidBy">Pago por</Label>
                <Select value={formData.paidBy} onValueChange={(value) => setFormData({ ...formData, paidBy: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Quem pagou?" />
                  </SelectTrigger>
                  <SelectContent>
                    {tripParticipants.map((user) => (
                      <SelectItem key={user!.id} value={user!.id}>
                        {user!.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dividir entre</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {tripParticipants.map((user) => (
                    <div key={user!.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={user!.id}
                        checked={formData.splitBetween.includes(user!.id)}
                        onCheckedChange={() => toggleSplitParticipant(user!.id)}
                      />
                      <Label htmlFor={user!.id} className="text-sm">
                        {user!.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddExpense} className="w-full">
                Adicionar Gasto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        {trip.expenses.map((expense) => {
          const category = getCategoryInfo(expense.category)
          const Icon = category.icon
          const payer = users.find((u) => u.id === expense.paidBy)
          const splitParticipants = expense.splitBetween
            .map((id) => users.find((u) => u.id === id)?.name)
            .filter(Boolean)

          return (
            <Card key={expense.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-10 h-10 ${category.color} rounded-full flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Pago por <span className="font-medium">{payer?.name}</span>
                      </p>
                      <p className="text-sm text-gray-600">Dividido entre: {splitParticipants.join(", ")}</p>
                      <Badge variant="outline" className="mt-2">
                        {category.name}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">R$ {expense.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      R$ {(expense.amount / expense.splitBetween.length).toFixed(2)} por pessoa
                    </p>
                    <div className="flex space-x-1 mt-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(expense)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Gasto</DialogTitle>
            <DialogDescription>Atualize os dados do gasto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Combustível para o barco"
              />
            </div>
            <div>
              <Label htmlFor="edit-amount">Valor (R$)</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => {
                    const Icon = category.icon
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-2" />
                          {category.name}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-paidBy">Pago por</Label>
              <Select value={formData.paidBy} onValueChange={(value) => setFormData({ ...formData, paidBy: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Quem pagou?" />
                </SelectTrigger>
                <SelectContent>
                  {tripParticipants.map((user) => (
                    <SelectItem key={user!.id} value={user!.id}>
                      {user!.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dividir entre</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {tripParticipants.map((user) => (
                  <div key={user!.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${user!.id}`}
                      checked={formData.splitBetween.includes(user!.id)}
                      onCheckedChange={() => toggleSplitParticipant(user!.id)}
                    />
                    <Label htmlFor={`edit-${user!.id}`} className="text-sm">
                      {user!.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleEditExpense} className="w-full">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {trip.expenses.length === 0 && (
        <div className="text-center py-12">
          <Calculator className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum gasto registrado</h3>
          <p className="mt-1 text-sm text-gray-500">Comece adicionando os gastos da pescaria</p>
        </div>
      )}
    </div>
  )
}
