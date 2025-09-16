"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useData } from "../context/DataContext"

export default function AddTripScreen({ navigation, route }) {
  const { addFishingTrip, updateFishingTrip, users } = useData()
  const editingTrip = route?.params?.trip

  const [formData, setFormData] = useState({
    location: editingTrip?.location || "",
    date: editingTrip ? new Date(editingTrip.date) : new Date(),
    participants: editingTrip?.participants || [],
    photos: editingTrip?.photos || [],
    notes: editingTrip?.notes || "",
    rating: editingTrip?.rating || 0,
    weather: editingTrip?.weather || "",
    fishCaught: editingTrip?.fishCaught || 0,
  })

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showUserSelector, setShowUserSelector] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!formData.location) {
      Alert.alert("Erro", "Local é obrigatório")
      return
    }

    if (formData.participants.length === 0) {
      Alert.alert("Erro", "Adicione pelo menos um participante")
      return
    }

    setLoading(true)

    try {
      const tripData = {
        ...formData,
        date: formData.date.toISOString(),
        totalExpense: 0, // Será calculado na tela de divisão de gastos
      }

      if (editingTrip) {
        await updateFishingTrip(editingTrip.id, tripData)
        Alert.alert("Sucesso", "Pescaria atualizada com sucesso!")
      } else {
        await addFishingTrip(tripData)
        Alert.alert("Sucesso", "Pescaria adicionada com sucesso!")
      }

      navigation.goBack()
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar pescaria")
    } finally {
      setLoading(false)
    }
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Erro", "Precisamos de permissão para acessar suas fotos")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset) => asset.uri)
      setFormData({ ...formData, photos: [...formData.photos, ...newPhotos] })
    }
  }

  const removePhoto = (index) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index)
    setFormData({ ...formData, photos: newPhotos })
  }

  const addParticipant = (user) => {
    if (!formData.participants.find((p) => p.id === user.id)) {
      setFormData({
        ...formData,
        participants: [...formData.participants, user],
      })
    }
    setShowUserSelector(false)
  }

  const removeParticipant = (userId) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((p) => p.id !== userId),
    })
  }

  const renderStarRating = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setFormData({ ...formData, rating: star })}>
            <Ionicons
              name={star <= formData.rating ? "star" : "star-outline"}
              size={32}
              color={star <= formData.rating ? "#FF9800" : "#ccc"}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  const renderUserSelector = () => (
    <View style={styles.userSelectorContainer}>
      <View style={styles.userSelectorHeader}>
        <Text style={styles.userSelectorTitle}>Selecionar Participantes</Text>
        <TouchableOpacity onPress={() => setShowUserSelector(false)}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItem} onPress={() => addParticipant(item)}>
            <View style={styles.userInfo}>
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
              ) : (
                <View style={styles.userAvatarPlaceholder}>
                  <Text style={styles.userAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>
            </View>
            {formData.participants.find((p) => p.id === item.id) && (
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editingTrip ? "Editar Pescaria" : "Nova Pescaria"}</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
            {loading ? "Salvando..." : "Salvar"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Local da Pescaria *</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="Ex: Represa de Barra Bonita"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.dateText}>{formData.date.toLocaleDateString("pt-BR")}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false)
                if (selectedDate) {
                  setFormData({ ...formData, date: selectedDate })
                }
              }}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Clima</Text>
            <TextInput
              style={styles.input}
              value={formData.weather}
              onChangeText={(text) => setFormData({ ...formData, weather: text })}
              placeholder="Ex: Ensolarado, 25°C"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Peixes Capturados</Text>
            <TextInput
              style={styles.input}
              value={formData.fishCaught.toString()}
              onChangeText={(text) => setFormData({ ...formData, fishCaught: Number.parseInt(text) || 0 })}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participantes</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowUserSelector(true)}>
            <Ionicons name="add" size={20} color="#2196F3" />
            <Text style={styles.addButtonText}>Adicionar Participante</Text>
          </TouchableOpacity>

          {formData.participants.map((participant) => (
            <View key={participant.id} style={styles.participantItem}>
              <View style={styles.participantInfo}>
                {participant.avatar ? (
                  <Image source={{ uri: participant.avatar }} style={styles.participantAvatar} />
                ) : (
                  <View style={styles.participantAvatarPlaceholder}>
                    <Text style={styles.participantAvatarText}>{participant.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <Text style={styles.participantName}>{participant.name}</Text>
              </View>
              <TouchableOpacity onPress={() => removeParticipant(participant.id)}>
                <Ionicons name="close-circle" size={24} color="#f44336" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fotos</Text>
          <TouchableOpacity style={styles.addButton} onPress={pickImage}>
            <Ionicons name="camera" size={20} color="#2196F3" />
            <Text style={styles.addButtonText}>Adicionar Fotos</Text>
          </TouchableOpacity>

          <View style={styles.photosGrid}>
            {formData.photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity style={styles.removePhotoButton} onPress={() => removePhoto(index)}>
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliação</Text>
          {renderStarRating()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Adicione suas observações sobre a pescaria..."
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      {showUserSelector && renderUserSelector()}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2196F3",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    padding: 20,
  },
  section: {
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
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#2196F3",
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  addButtonText: {
    fontSize: 16,
    color: "#2196F3",
    marginLeft: 8,
    fontWeight: "600",
  },
  participantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  participantAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  participantName: {
    fontSize: 16,
    color: "#333",
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photoContainer: {
    position: "relative",
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#f44336",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  star: {
    marginHorizontal: 5,
  },
  userSelectorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 1000,
  },
  userSelectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  userSelectorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
})
