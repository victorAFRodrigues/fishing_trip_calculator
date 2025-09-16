"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, FlatList, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useData } from "../context/DataContext"

const { width } = Dimensions.get("window")

export default function TripDetailsScreen({ navigation, route }) {
  const { trip } = route.params
  const { deleteFishingTrip } = useData()
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  const handleDelete = () => {
    Alert.alert("Confirmar exclusão", "Deseja excluir esta pescaria?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFishingTrip(trip.id)
            Alert.alert("Sucesso", "Pescaria excluída com sucesso!")
            navigation.goBack()
          } catch (error) {
            Alert.alert("Erro", "Erro ao excluir pescaria")
          }
        },
      },
    ])
  }

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={20}
            color={star <= rating ? "#FF9800" : "#ccc"}
          />
        ))}
      </View>
    )
  }

  const renderPhoto = ({ item, index }) => (
    <TouchableOpacity onPress={() => setSelectedPhotoIndex(index)}>
      <Image source={{ uri: item }} style={styles.photo} />
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("ExpenseSplit", { trip })}>
            <Ionicons name="calculator" size={20} color="#4CAF50" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("AddTrip", { trip })}>
            <Ionicons name="pencil" size={20} color="#2196F3" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
            <Ionicons name="trash" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.location}>{trip.location}</Text>
          <Text style={styles.date}>{new Date(trip.date).toLocaleDateString("pt-BR")}</Text>
          {renderStars(trip.rating || 0)}
        </View>

        {trip.photos && trip.photos.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Fotos</Text>
            <Image source={{ uri: trip.photos[selectedPhotoIndex] }} style={styles.mainPhoto} />
            {trip.photos.length > 1 && (
              <FlatList
                data={trip.photos}
                renderItem={renderPhoto}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.photosList}
                contentContainerStyle={styles.photosListContent}
              />
            )}
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informações</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="people" size={24} color="#2196F3" />
              <Text style={styles.infoNumber}>{trip.participants.length}</Text>
              <Text style={styles.infoLabel}>Participantes</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="fish" size={24} color="#4CAF50" />
              <Text style={styles.infoNumber}>{trip.fishCaught || 0}</Text>
              <Text style={styles.infoLabel}>Peixes</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="cash" size={24} color="#FF9800" />
              <Text style={styles.infoNumber}>R$ {(trip.totalExpense || 0).toFixed(0)}</Text>
              <Text style={styles.infoLabel}>Gastos</Text>
            </View>
          </View>

          {trip.weather && (
            <View style={styles.weatherContainer}>
              <Ionicons name="partly-sunny" size={20} color="#FF9800" />
              <Text style={styles.weatherText}>{trip.weather}</Text>
            </View>
          )}
        </View>

        <View style={styles.participantsSection}>
          <Text style={styles.sectionTitle}>Participantes</Text>
          {trip.participants.map((participant) => (
            <View key={participant.id} style={styles.participantItem}>
              <View style={styles.participantInfo}>
                {participant.avatar ? (
                  <Image source={{ uri: participant.avatar }} style={styles.participantAvatar} />
                ) : (
                  <View style={styles.participantAvatarPlaceholder}>
                    <Text style={styles.participantAvatarText}>{participant.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.participantDetails}>
                  <Text style={styles.participantName}>{participant.name}</Text>
                  <Text style={styles.participantEmail}>{participant.email}</Text>
                </View>
              </View>
              <View style={styles.participantExpense}>
                <Text style={styles.expenseAmount}>
                  R$ {((trip.totalExpense || 0) / trip.participants.length).toFixed(2)}
                </Text>
                <Text style={styles.expenseLabel}>Valor individual</Text>
              </View>
            </View>
          ))}
        </View>

        {trip.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.notesText}>{trip.notes}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.expenseButton} onPress={() => navigation.navigate("ExpenseSplit", { trip })}>
          <Ionicons name="calculator" size={24} color="#fff" />
          <Text style={styles.expenseButtonText}>Gerenciar Gastos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#ffebee",
  },
  content: {
    padding: 20,
  },
  titleSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  location: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  date: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 5,
  },
  photosSection: {
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
  mainPhoto: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  photosList: {
    marginTop: 10,
  },
  photosListContent: {
    gap: 10,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  infoSection: {
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
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  infoCard: {
    alignItems: "center",
  },
  infoNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  weatherContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    padding: 12,
    borderRadius: 10,
  },
  weatherText: {
    fontSize: 14,
    color: "#FF9800",
    marginLeft: 8,
    fontWeight: "500",
  },
  participantsSection: {
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
  participantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  participantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  participantAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  participantAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  participantEmail: {
    fontSize: 14,
    color: "#666",
  },
  participantExpense: {
    alignItems: "flex-end",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  expenseLabel: {
    fontSize: 12,
    color: "#666",
  },
  notesSection: {
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
  notesText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  expenseButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  expenseButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
})
