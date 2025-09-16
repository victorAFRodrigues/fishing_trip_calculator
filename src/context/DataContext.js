"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([])
  const [fishingTrips, setFishingTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usersData, tripsData] = await Promise.all([
        AsyncStorage.getItem("users"),
        AsyncStorage.getItem("fishingTrips"),
      ])

      if (usersData) {
        setUsers(JSON.parse(usersData))
      }
      if (tripsData) {
        setFishingTrips(JSON.parse(tripsData))
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveUsers = async (newUsers) => {
    try {
      await AsyncStorage.setItem("users", JSON.stringify(newUsers))
      setUsers(newUsers)
    } catch (error) {
      console.error("Error saving users:", error)
    }
  }

  const saveFishingTrips = async (newTrips) => {
    try {
      await AsyncStorage.setItem("fishingTrips", JSON.stringify(newTrips))
      setFishingTrips(newTrips)
    } catch (error) {
      console.error("Error saving trips:", error)
    }
  }

  const addUser = async (userData) => {
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
    }
    const updatedUsers = [...users, newUser]
    await saveUsers(updatedUsers)
    return newUser
  }

  const updateUser = async (userId, userData) => {
    const updatedUsers = users.map((user) => (user.id === userId ? { ...user, ...userData } : user))
    await saveUsers(updatedUsers)
  }

  const deleteUser = async (userId) => {
    const updatedUsers = users.filter((user) => user.id !== userId)
    await saveUsers(updatedUsers)
  }

  const addFishingTrip = async (tripData) => {
    const newTrip = {
      id: Date.now().toString(),
      ...tripData,
      createdAt: new Date().toISOString(),
    }
    const updatedTrips = [...fishingTrips, newTrip]
    await saveFishingTrips(updatedTrips)
    return newTrip
  }

  const updateFishingTrip = async (tripId, tripData) => {
    const updatedTrips = fishingTrips.map((trip) => (trip.id === tripId ? { ...trip, ...tripData } : trip))
    await saveFishingTrips(updatedTrips)
  }

  const deleteFishingTrip = async (tripId) => {
    const updatedTrips = fishingTrips.filter((trip) => trip.id !== tripId)
    await saveFishingTrips(updatedTrips)
  }

  const value = {
    users,
    fishingTrips,
    loading,
    addUser,
    updateUser,
    deleteUser,
    addFishingTrip,
    updateFishingTrip,
    deleteFishingTrip,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
