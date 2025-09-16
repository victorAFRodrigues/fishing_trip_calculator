"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { storage } from "@/lib/storage"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  totalTrips: number
  totalSpent: number
  isOnline: boolean
}

interface FishingTrip {
  id: string
  date: string
  location: string
  participants: string[]
  photos: string[]
  rating: number
  totalExpenses: number
  expenses: Expense[]
}

interface Expense {
  id: string
  description: string
  amount: number
  paidBy: string
  splitBetween: string[]
  category: string
  date: string
}

interface DataContextType {
  users: User[]
  trips: FishingTrip[]
  addUser: (user: Omit<User, "id">) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  addTrip: (trip: Omit<FishingTrip, "id">) => void
  updateTrip: (id: string, trip: Partial<FishingTrip>) => void
  deleteTrip: (id: string) => void
  addExpense: (tripId: string, expense: Omit<Expense, "id">) => void
  updateExpense: (tripId: string, expenseId: string, expense: Partial<Expense>) => void
  deleteExpense: (tripId: string, expenseId: string) => void
  refreshData: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [trips, setTrips] = useState<FishingTrip[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const usersData = await storage.getItem("users")
      const tripsData = await storage.getItem("trips")

      if (usersData) {
        setUsers(JSON.parse(usersData))
      } else {
        // Dados iniciais de exemplo
        const initialUsers: User[] = [
          {
            id: "1",
            name: "João Silva",
            email: "joao@email.com",
            phone: "(11) 99999-9999",
            totalTrips: 8,
            totalSpent: 1200.0,
            isOnline: true,
          },
          {
            id: "2",
            name: "Pedro Santos",
            email: "pedro@email.com",
            phone: "(11) 88888-8888",
            totalTrips: 5,
            totalSpent: 800.0,
            isOnline: false,
          },
        ]
        setUsers(initialUsers)
        await storage.setItem("users", JSON.stringify(initialUsers))
      }

      if (tripsData) {
        setTrips(JSON.parse(tripsData))
      } else {
        // Dados iniciais de exemplo
        const initialTrips: FishingTrip[] = [
          {
            id: "1",
            date: "2024-01-15",
            location: "Represa Billings",
            participants: ["1", "2"],
            photos: [],
            rating: 4,
            totalExpenses: 320.0,
            expenses: [
              {
                id: "1",
                description: "Combustível",
                amount: 120.0,
                paidBy: "1",
                splitBetween: ["1", "2"],
                category: "fuel",
                date: "2024-01-15",
              },
              {
                id: "2",
                description: "Iscas",
                amount: 80.0,
                paidBy: "2",
                splitBetween: ["1", "2"],
                category: "bait",
                date: "2024-01-15",
              },
            ],
          },
        ]
        setTrips(initialTrips)
        await storage.setItem("trips", JSON.stringify(initialTrips))
      }
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const saveUsers = async (newUsers: User[]) => {
    setUsers(newUsers)
    await storage.setItem("users", JSON.stringify(newUsers))
  }

  const saveTrips = async (newTrips: FishingTrip[]) => {
    setTrips(newTrips)
    await storage.setItem("trips", JSON.stringify(newTrips))
  }

  const addUser = (user: Omit<User, "id">) => {
    const newUser = { ...user, id: Date.now().toString() }
    saveUsers([...users, newUser])
  }

  const updateUser = (id: string, userData: Partial<User>) => {
    const updatedUsers = users.map((user) => (user.id === id ? { ...user, ...userData } : user))
    saveUsers(updatedUsers)
  }

  const deleteUser = (id: string) => {
    const filteredUsers = users.filter((user) => user.id !== id)
    saveUsers(filteredUsers)
  }

  const addTrip = (trip: Omit<FishingTrip, "id">) => {
    const newTrip = { ...trip, id: Date.now().toString() }
    saveTrips([...trips, newTrip])
  }

  const updateTrip = (id: string, tripData: Partial<FishingTrip>) => {
    const updatedTrips = trips.map((trip) => (trip.id === id ? { ...trip, ...tripData } : trip))
    saveTrips(updatedTrips)
  }

  const deleteTrip = (id: string) => {
    const filteredTrips = trips.filter((trip) => trip.id !== id)
    saveTrips(filteredTrips)
  }

  const addExpense = (tripId: string, expense: Omit<Expense, "id">) => {
    const newExpense = { ...expense, id: Date.now().toString() }
    const updatedTrips = trips.map((trip) => {
      if (trip.id === tripId) {
        const newExpenses = [...trip.expenses, newExpense]
        const totalExpenses = newExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        return { ...trip, expenses: newExpenses, totalExpenses }
      }
      return trip
    })
    saveTrips(updatedTrips)
  }

  const updateExpense = (tripId: string, expenseId: string, expenseData: Partial<Expense>) => {
    const updatedTrips = trips.map((trip) => {
      if (trip.id === tripId) {
        const updatedExpenses = trip.expenses.map((expense) =>
          expense.id === expenseId ? { ...expense, ...expenseData } : expense,
        )
        const totalExpenses = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        return { ...trip, expenses: updatedExpenses, totalExpenses }
      }
      return trip
    })
    saveTrips(updatedTrips)
  }

  const deleteExpense = (tripId: string, expenseId: string) => {
    const updatedTrips = trips.map((trip) => {
      if (trip.id === tripId) {
        const filteredExpenses = trip.expenses.filter((expense) => expense.id !== expenseId)
        const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        return { ...trip, expenses: filteredExpenses, totalExpenses }
      }
      return trip
    })
    saveTrips(updatedTrips)
  }

  const refreshData = () => {
    loadData()
  }

  return (
    <DataContext.Provider
      value={{
        users,
        trips,
        addUser,
        updateUser,
        deleteUser,
        addTrip,
        updateTrip,
        deleteTrip,
        addExpense,
        updateExpense,
        deleteExpense,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
