"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useData } from "../context/DataContext"

export default function FishingTripsScreen({ navigation }) {
  const { fishingTrips, loading } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [filterBy, setFilterBy] = useState("all") // all, recent, high-rated

  const filteredTrips = fishingTrips
    .filter((trip) => {
      const matchesSearch =
        trip.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.participants.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))

      switch (filterBy) {
        case "recent":
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          return matchesSearch && new Date(trip.date) >= oneWeekAgo
        case "high-rated":
          return matchesSearch && trip.rating >= 4
        default:
          return matchesSearch
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const onRefresh = async () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const renderTrip = ({ item }) => (
    <TouchableOpacity style={styles.tripCard} onPress={() => navigation.navigate("TripDetails", { trip: item })}>
      <View style={styles.tripHeader}>
        <View style={styles.tripInfo}>
          <Text style={styles.tripLocation}>{item.location}</Text>
          <Text style={styles.tripDate}>{new Date(item.date).toLocaleDateString("pt-BR")}</Text>
        </View>

        <View style={styles.tripRating}>
          <Ionicons name="star" size={16} color="#FF9800" />
          <Text style={styles.ratingText}>{item.rating || 0}</Text>
        </View>
      </View>

      {item.photos && item.photos.length > 0 && <Image source={{ uri: item.photos[0] }} style={styles.tripImage} />}

      <View style={styles.tripDetails}>
        <View style={styles.participantsContainer}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.participantsText}>
            {item.participants.length} pescador{item.participants.length !== 1 ? "es" : ""}
          </Text>
        </View>

        <View style={styles.expenseContainer}>
          <Ionicons name="cash" size={16} color="#4CAF50" />
          <Text style={styles.expenseText}>R$ {(item.totalExpense || 0).toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.participantsList}>
        {item.participants.slice(0, 3).map((participant, index) => (
          <View key={index} style={styles.participantAvatar}>
            {participant.avatar ? (
              <Image source={{ uri: participant.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{participant.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>
        ))}
        {item.participants.length > 3 && (
          <View style={styles.moreParticipants}>
            <Text style={styles.moreText}>+{item.participants.length - 3}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por local ou pescador..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddTrip")}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterBy === "all" && styles.filterButtonActive]}
          onPress={() => setFilterBy("all")}
        >
          <Text style={[styles.filterText, filterBy === "all" && styles.filterTextActive]}>Todas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filterBy === "recent" && styles.filterButtonActive]}
          onPress={() => setFilterBy("recent")}
        >
          <Text style={[styles.filterText, filterBy === "recent" && styles.filterTextActive]}>Recentes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filterBy === "high-rated" && styles.filterButtonActive]}
          onPress={() => setFilterBy("high-rated")}
        >
          <Text style={[styles.filterText, filterBy === "high-rated" && styles.filterTextActive]}>Bem Avaliadas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{fishingTrips.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{filteredTrips.length}</Text>
          <Text style={styles.statLabel}>Filtradas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            R$ {fishingTrips.reduce((sum, trip) => sum + (trip.totalExpense || 0), 0).toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Gastos Totais</Text>
        </View>
      </View>

      <FlatList
        data={filteredTrips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id}
        style={styles.tripsList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2196F3"]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="boat-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? "Nenhuma pescaria encontrada" : "Nenhuma pescaria cadastrada"}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? "Tente buscar por outro termo" : "Toque no + para adicionar sua primeira pescaria"}
            </Text>
          </View>
        }
      />
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
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#2196F3",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: "#2196F3",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  tripsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tripCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  tripInfo: {
    flex: 1,
  },
  tripLocation: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 14,
    color: "#666",
  },
  tripRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF9800",
    marginLeft: 4,
  },
  tripImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
  },
  tripDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  participantsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantsText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  expenseContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  expenseText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
    marginLeft: 6,
  },
  participantsList: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantAvatar: {
    marginRight: -8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  moreParticipants: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  moreText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 40,
  },
})
