"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Share,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useData } from "../context/DataContext"

const EXPENSE_CATEGORIES = [
  { id: "fuel", name: "Combustível", icon: "car", color: "#FF6384" },
  { id: "bait", name: "Iscas", icon: "fish", color: "#36A2EB" },
  { id: "food", name: "Alimentação", icon: "restaurant", color: "#FFCE56" },
  { id: "equipment", name: "Equipamentos", icon: "construct", color: "#4BC0C0" },
  { id: "accommodation", name: "Hospedagem", icon: "bed", color: "#9966FF" },
  { id: "transport", name: "Transporte", icon: "bus", color: "#FF9F40" },
  { id: "other", name: "Outros", icon: "ellipsis-horizontal", color: "#C9CBCF" },
]

export default function ExpenseSplitScreen({ navigation, route }) {
  const { trip } = route.params
  const { updateFishingTrip } = useData()

  const [expenses, setExpenses] = useState(trip.expenses || [])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [splitMethod, setSplitMethod] = useState("equal") // equal, custom, percentage
  const [customSplits, setCustomSplits] = useState({})

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    category: "other",
    paidBy: trip.participants[0]?.id || "",
    splitBetween: trip.participants.map((p) => p.id),
  })

  useEffect(() => {
    // Inicializar divisões customizadas
    const initialSplits = {}
    trip.participants.forEach((participant) => {
      initialSplits[participant.id] = {
        amount: 0,
        percentage: Math.round(100 / trip.participants.length),
      }
    })
    setCustomSplits(initialSplits)
  }, [trip.participants])

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const calculateSplits = () => {
    const splits = {}
    trip.participants.forEach((participant) => {
      splits[participant.id] = {
        owes: 0,
        paid: 0,
        balance: 0,
      }
    })

    expenses.forEach((expense) => {
      // Quem pagou
      splits[expense.paidBy].paid += expense.amount

      // Como dividir
      const splitAmount = expense.amount / expense.splitBetween.length
      expense.splitBetween.forEach((participantId) => {
        splits[participantId].owes += splitAmount
      })
    })

    // Calcular saldo final
    Object.keys(splits).forEach((participantId) => {
      splits[participantId].balance = splits[participantId].paid - splits[participantId].owes
    })

    return splits
  }

  const splits = calculateSplits()

  const resetExpenseForm = () => {
    setExpenseForm({
      description: "",
      amount: "",
      category: "other",
      paidBy: trip.participants[0]?.id || "",
      splitBetween: trip.participants.map((p) => p.id),
    })
    setEditingExpense(null)
  }

  const openExpenseModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense)
      setExpenseForm({
        description: expense.description,
        amount: expense.amount.toString(),
        category: expense.category,
        paidBy: expense.paidBy,
        splitBetween: expense.splitBetween,
      })
    } else {
      resetExpenseForm()
    }
    setModalVisible(true)
  }

  const saveExpense = () => {
    if (!expenseForm.description || !expenseForm.amount) {
      Alert.alert("Erro", "Descrição e valor são obrigatórios")
      return
    }

    const amount = Number.parseFloat(expenseForm.amount)
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Erro", "Valor deve ser um número positivo")
      return
    }

    const newExpense = {
      id: editingExpense?.id || Date.now().toString(),
      ...expenseForm,
      amount,
      createdAt: editingExpense?.createdAt || new Date().toISOString(),
    }

    let updatedExpenses
    if (editingExpense) {
      updatedExpenses = expenses.map((exp) => (exp.id === editingExpense.id ? newExpense : exp))
    } else {
      updatedExpenses = [...expenses, newExpense]
    }

    setExpenses(updatedExpenses)
    setModalVisible(false)
    resetExpenseForm()
  }

  const deleteExpense = (expenseId) => {
    Alert.alert("Confirmar exclusão", "Deseja excluir este gasto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          const updatedExpenses = expenses.filter((exp) => exp.id !== expenseId)
          setExpenses(updatedExpenses)
        },
      },
    ])
  }

  const saveToTrip = async () => {
    try {
      const updatedTrip = {
        ...trip,
        expenses,
        totalExpense: totalExpenses,
      }
      await updateFishingTrip(trip.id, updatedTrip)
      Alert.alert("Sucesso", "Gastos salvos com sucesso!")
      navigation.goBack()
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar gastos")
    }
  }

  const shareExpenseReport = async () => {
    let report = `📊 RELATÓRIO DE GASTOS - ${trip.location}\n`
    report += `📅 Data: ${new Date(trip.date).toLocaleDateString("pt-BR")}\n\n`

    report += `💰 RESUMO FINANCEIRO:\n`
    report += `Total gasto: R$ ${totalExpenses.toFixed(2)}\n`
    report += `Por pessoa: R$ ${(totalExpenses / trip.participants.length).toFixed(2)}\n\n`

    report += `👥 SALDO POR PARTICIPANTE:\n`
    trip.participants.forEach((participant) => {
      const split = splits[participant.id]
      const status = split.balance > 0 ? "recebe" : split.balance < 0 ? "deve" : "quite"
      const amount = Math.abs(split.balance)
      report += `${participant.name}: ${status} R$ ${amount.toFixed(2)}\n`
    })

    report += `\n📋 GASTOS DETALHADOS:\n`
    expenses.forEach((expense) => {
      const payer = trip.participants.find((p) => p.id === expense.paidBy)
      const category = EXPENSE_CATEGORIES.find((c) => c.id === expense.category)
      report += `• ${expense.description} - R$ ${expense.amount.toFixed(2)}\n`
      report += `  Pago por: ${payer?.name}\n`
      report += `  Categoria: ${category?.name}\n\n`
    })

    try {
      await Share.share({
        message: report,
        title: `Gastos da Pescaria - ${trip.location}`,
      })
    } catch (error) {
      Alert.alert("Erro", "Erro ao compartilhar relatório")
    }
  }

  const getParticipantName = (participantId) => {
    return trip.participants.find((p) => p.id === participantId)?.name || "Desconhecido"
  }

  const getCategoryInfo = (categoryId) => {
    return EXPENSE_CATEGORIES.find((c) => c.id === categoryId) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]
  }

  const renderExpense = ({ item }) => {
    const category = getCategoryInfo(item.category)
    const payer = trip.participants.find((p) => p.id === item.paidBy)

    return (
      <View style={styles.expenseCard}>
        <View style={styles.expenseHeader}>
          <View style={styles.expenseInfo}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
              <Ionicons name={category.icon} size={20} color="#fff" />
            </View>
            <View style={styles.expenseDetails}>
              <Text style={styles.expenseDescription}>{item.description}</Text>
              <Text style={styles.expensePayer}>Pago por: {payer?.name}</Text>
              <Text style={styles.expenseCategory}>{category.name}</Text>
            </View>
          </View>
          <View style={styles.expenseActions}>
            <Text style={styles.expenseAmount}>R$ {item.amount.toFixed(2)}</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.editButton} onPress={() => openExpenseModal(item)}>
                <Ionicons name="pencil" size={16} color="#2196F3" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteExpense(item.id)}>
                <Ionicons name="trash" size={16} color="#f44336" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.splitInfo}>
          <Text style={styles.splitText}>
            Dividido entre: {item.splitBetween.map((id) => getParticipantName(id)).join(", ")}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Divisão de Gastos</Text>
        <TouchableOpacity onPress={shareExpenseReport}>
          <Ionicons name="share" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo Financeiro</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de Gastos:</Text>
            <Text style={styles.summaryValue}>R$ {totalExpenses.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Por Pessoa:</Text>
            <Text style={styles.summaryValue}>R$ {(totalExpenses / trip.participants.length).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.sectionTitle}>Saldo dos Participantes</Text>
          {trip.participants.map((participant) => {
            const split = splits[participant.id]
            const isPositive = split.balance > 0
            const isNegative = split.balance < 0

            return (
              <View key={participant.id} style={styles.balanceItem}>
                <Text style={styles.participantName}>{participant.name}</Text>
                <View style={styles.balanceDetails}>
                  <Text style={styles.balanceText}>Pagou: R$ {split.paid.toFixed(2)}</Text>
                  <Text style={styles.balanceText}>Deve: R$ {split.owes.toFixed(2)}</Text>
                  <Text
                    style={[
                      styles.balanceAmount,
                      isPositive && styles.positiveBalance,
                      isNegative && styles.negativeBalance,
                    ]}
                  >
                    {isPositive ? "Recebe" : isNegative ? "Deve" : "Quite"}: R$ {Math.abs(split.balance).toFixed(2)}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>

        <View style={styles.expensesCard}>
          <View style={styles.expensesHeader}>
            <Text style={styles.sectionTitle}>Gastos ({expenses.length})</Text>
            <TouchableOpacity style={styles.addExpenseButton} onPress={() => openExpenseModal()}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addExpenseText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {expenses.length === 0 ? (
            <View style={styles.emptyExpenses}>
              <Ionicons name="receipt-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum gasto adicionado</Text>
              <Text style={styles.emptySubtext}>Toque em "Adicionar" para começar</Text>
            </View>
          ) : (
            <FlatList
              data={expenses}
              renderItem={renderExpense}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveToTrip}>
          <Ionicons name="checkmark" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>Salvar Gastos</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Adicionar/Editar Gasto */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingExpense ? "Editar Gasto" : "Novo Gasto"}</Text>
            <TouchableOpacity onPress={saveExpense}>
              <Text style={styles.modalSaveButton}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Descrição *</Text>
              <TextInput
                style={styles.input}
                value={expenseForm.description}
                onChangeText={(text) => setExpenseForm({ ...expenseForm, description: text })}
                placeholder="Ex: Gasolina do barco"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Valor *</Text>
              <TextInput
                style={styles.input}
                value={expenseForm.amount}
                onChangeText={(text) => setExpenseForm({ ...expenseForm, amount: text })}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Categoria</Text>
              <View style={styles.categoriesGrid}>
                {EXPENSE_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      expenseForm.category === category.id && styles.categoryButtonActive,
                      { borderColor: category.color },
                    ]}
                    onPress={() => setExpenseForm({ ...expenseForm, category: category.id })}
                  >
                    <Ionicons
                      name={category.icon}
                      size={20}
                      color={expenseForm.category === category.id ? "#fff" : category.color}
                    />
                    <Text
                      style={[
                        styles.categoryButtonText,
                        expenseForm.category === category.id && styles.categoryButtonTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Pago por</Text>
              <View style={styles.participantSelector}>
                {trip.participants.map((participant) => (
                  <TouchableOpacity
                    key={participant.id}
                    style={[
                      styles.participantButton,
                      expenseForm.paidBy === participant.id && styles.participantButtonActive,
                    ]}
                    onPress={() => setExpenseForm({ ...expenseForm, paidBy: participant.id })}
                  >
                    <Text
                      style={[
                        styles.participantButtonText,
                        expenseForm.paidBy === participant.id && styles.participantButtonTextActive,
                      ]}
                    >
                      {participant.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Dividir entre</Text>
              <View style={styles.participantSelector}>
                {trip.participants.map((participant) => (
                  <TouchableOpacity
                    key={participant.id}
                    style={[
                      styles.participantButton,
                      expenseForm.splitBetween.includes(participant.id) && styles.participantButtonActive,
                    ]}
                    onPress={() => {
                      const isSelected = expenseForm.splitBetween.includes(participant.id)
                      let newSplitBetween
                      if (isSelected) {
                        newSplitBetween = expenseForm.splitBetween.filter((id) => id !== participant.id)
                      } else {
                        newSplitBetween = [...expenseForm.splitBetween, participant.id]
                      }
                      setExpenseForm({ ...expenseForm, splitBetween: newSplitBetween })
                    }}
                  >
                    <Text
                      style={[
                        styles.participantButtonText,
                        expenseForm.splitBetween.includes(participant.id) && styles.participantButtonTextActive,
                      ]}
                    >
                      {participant.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
  },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  balanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  balanceDetails: {
    alignItems: "flex-end",
  },
  balanceText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  positiveBalance: {
    color: "#4CAF50",
  },
  negativeBalance: {
    color: "#f44336",
  },
  expensesCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  expensesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  addExpenseButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  addExpenseText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 5,
  },
  emptyExpenses: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
  expenseCard: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 15,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  expenseInfo: {
    flexDirection: "row",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  expensePayer: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  expenseCategory: {
    fontSize: 12,
    color: "#999",
  },
  expenseActions: {
    alignItems: "flex-end",
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#e3f2fd",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#ffebee",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  splitInfo: {
    marginTop: 8,
    marginLeft: 52,
  },
  splitText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalSaveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2196F3",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  categoryButtonActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  categoryButtonText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#333",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  participantSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  participantButton: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  participantButtonActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  participantButtonText: {
    fontSize: 14,
    color: "#333",
  },
  participantButtonTextActive: {
    color: "#fff",
  },
})
