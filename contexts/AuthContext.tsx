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

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Omit<User, "id" | "totalTrips" | "totalSpent" | "isOnline">) => Promise<boolean>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const userData = await storage.getItem("user")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Error loading user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulação de login - aceita qualquer email/senha
      const userData: User = {
        id: "1",
        name: email.split("@")[0],
        email,
        totalTrips: 5,
        totalSpent: 1250.0,
        isOnline: true,
      }

      await storage.setItem("user", JSON.stringify(userData))
      setUser(userData)
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (userData: Omit<User, "id" | "totalTrips" | "totalSpent" | "isOnline">): Promise<boolean> => {
    try {
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        totalTrips: 0,
        totalSpent: 0,
        isOnline: true,
      }

      await storage.setItem("user", JSON.stringify(newUser))
      setUser(newUser)
      return true
    } catch (error) {
      console.error("Register error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await storage.removeItem("user")
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return

    try {
      const updatedUser = { ...user, ...userData }
      await storage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (error) {
      console.error("Update profile error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
