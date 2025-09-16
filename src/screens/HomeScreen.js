"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { LineChart, PieChart, BarChart } from "react-native-chart-kit"
import { useData } from "../context/DataContext"
import { useAuth } from "../context/AuthContext"

const screenWidth = Dimensions.get("window").width

export default function HomeScreen({ navigation }) {
  const { fishingTrips, users } = useData()
  const { user } = useAuth()

  const recentTrips = fishingTrips.slice(-6)
  const totalExpenses = fishingTrips.reduce((sum, trip) => sum + (trip.totalExpense || 0), 0)
  const averageRating =
    fishingTrips.length > 0 ? fishingTrips.reduce((sum, trip) => sum + (trip.rating || 0), 0) / fishingTrips.length : 0
  const totalFishCaught = fishingTrips.reduce((sum, trip) => sum + (trip.fishCaught || 0), 0)
  const averageExpensePerTrip = fishingTrips.length > 0 ? totalExpenses / fishingTrips.length : 0

  const expenseChartData = {
    labels:
      recentTrips.length > 0
        ? recentTrips.map((trip) =>
            new Date(trip.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          )
        : ["Sem dados"],
    datasets: [
      {
        data: recentTrips.length > 0 ? recentTrips.map((trip) => trip.totalExpense || 0) : [0],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      },
    ],
  }

  const getExpensesByCategory = () => {
    const categories = {}
    fishingTrips.forEach((trip) => {
      if (trip.expenses) {
        trip.expenses.forEach((expense) => {
          categories[expense.category] = (categories[expense.category] || 0) + expense.amount
        })
      }
    })

    const categoryNames = {
      fuel: "Combustível",
      bait: "Iscas",
      food: "Alimentação",
      equipment: "Equipamentos",
      accommodation: "Hospedagem",
      transport: "Transporte",
      other: "Outros",
    }

    const colors = {
      fuel: "#FF6384",
      bait: "#36A2EB",
      food: "#FFCE56",
      equipment: "#4BC0C0",
      accommodation: "#9966FF",
      transport: "#FF9F40",
      other: "#C9CBCF",
    }

    return Object.entries(categories).map(([key, value]) => ({
      name: categoryNames[key] || "Outros",
      population: value,
      color: colors[key] || "#C9CBCF",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }))
  }

  const pieData = getExpensesByCategory()

  const getMonthlyExpenses = () => {
    const monthlyData = {}
    fishingTrips.forEach((trip) => {
      const month = new Date(trip.date).toLocaleDateString("pt-BR", { month: "short" })
      monthlyData[month] = (monthlyData[month] || 0) + (trip.totalExpense || 0)
    })

    const last6Months = Object.entries(monthlyData).slice(-6)
    return {
      labels: last6Months.map(([month]) => month),
      datasets: [
        {
          data: last6Months.map(([, amount]) => amount),
        },
      ],
    }
  }

  const monthlyExpensesData = getMonthlyExpenses()

  const getLocationStats = () => {
    const locations = {}
    fishingTrips.forEach((trip) => {
      locations[trip.location] = (locations[trip.location] || 0) + 1
    })

    return Object.entries(locations)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }

  const topLocations = getLocationStats()

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#2196F3", "#21CBF3"]} style={styles.header}>
        <Text style={styles.welcomeText}>Olá, {user?.name}!</Text>
        <Text style={styles.headerSubtitle}>Suas pescarias em resumo</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="boat" size={30} color="#2196F3" />
          <Text style={styles.statNumber}>{fishingTrips.length}</Text>
          <Text style={styles.statLabel}>Pescarias</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="cash" size={30} color="#4CAF50" />
          <Text style={styles.statNumber}>R$ {totalExpenses.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Gastos Totais</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="star" size={30} color="#FF9800" />
          <Text style={styles.statNumber}>{averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Nota Média</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="fish" size={30} color="#00BCD4" />
          <Text style={styles.statNumber}>{totalFishCaught}</Text>
          <Text style={styles.statLabel}>Peixes Capturados</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={30} color="#9C27B0" />
          <Text style={styles.statNumber}>R$ {averageExpensePerTrip.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Média por Pescaria</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="people" size={30} color="#FF5722" />
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Pescadores</Text>
        </View>
      </View>

      {recentTrips.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Gastos das Últimas Pescarias</Text>
          <LineChart
            data={expenseChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#2196F3",
                fill: "#fff",
              },
            }}
            bezier
            style={styles.chart}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            withDots={true}
            withShadow={false}
          />
        </View>
      )}

      {monthlyExpensesData.labels.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Gastos Mensais</Text>
          <BarChart
            data={monthlyExpensesData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              barPercentage: 0.7,
            }}
            style={styles.chart}
            showValuesOnTopOfBars={true}
          />
        </View>
      )}

      {pieData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Distribuição de Gastos por Categoria</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={true}
          />
        </View>
      )}

      {topLocations.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Locais Mais Visitados</Text>
          {topLocations.map(([location, count], index) => (
            <View key={location} style={styles.locationItem}>
              <View style={styles.locationRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{location}</Text>
                <Text style={styles.locationCount}>
                  {count} pescaria{count !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.locationBar}>
                <View style={[styles.locationBarFill, { width: `${(count / topLocations[0][1]) * 100}%` }]} />
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Atividade Recente</Text>
        {fishingTrips
          .slice(-3)
          .reverse()
          .map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.activityItem}
              onPress={() =>
                navigation.navigate("Pescarias", {
                  screen: "TripDetails",
                  params: { trip },
                })
              }
            >
              <View style={styles.activityIcon}>
                <Ionicons name="boat" size={20} color="#2196F3" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{trip.location}</Text>
                <Text style={styles.activityDate}>
                  {new Date(trip.date).toLocaleDateString("pt-BR")} • {trip.participants.length} pescadores
                </Text>
              </View>
              <View style={styles.activityAmount}>
                <Text style={styles.activityExpense}>R$ {(trip.totalExpense || 0).toFixed(2)}</Text>
                <View style={styles.activityRating}>
                  <Ionicons name="star" size={12} color="#FF9800" />
                  <Text style={styles.ratingText}>{trip.rating || 0}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("Pescarias", { screen: "AddTrip" })}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Nova Pescaria</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate("Usuários")}
        >
          <Ionicons name="people" size={24} color="#2196F3" />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Gerenciar Usuários</Text>
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
    padding: 30,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: -30,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  chartContainer: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  locationRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  locationInfo: {
    flex: 1,
    marginRight: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  locationCount: {
    fontSize: 12,
    color: "#666",
  },
  locationBar: {
    width: 60,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  locationBarFill: {
    height: "100%",
    backgroundColor: "#2196F3",
    borderRadius: 4,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  activityDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  activityAmount: {
    alignItems: "flex-end",
  },
  activityExpense: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  activityRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: "#FF9800",
    marginLeft: 2,
  },
  quickActions: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: "#2196F3",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  secondaryButtonText: {
    color: "#2196F3",
  },
})
