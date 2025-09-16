"use client"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { View } from "react-native"

// Screens
import HomeScreen from "./src/screens/HomeScreen"
import FishingTripsScreen from "./src/screens/FishingTripsScreen"
import UsersScreen from "./src/screens/UsersScreen"
import ProfileScreen from "./src/screens/ProfileScreen"
import LoginScreen from "./src/screens/LoginScreen"
import AddTripScreen from "./src/screens/AddTripScreen"
import TripDetailsScreen from "./src/screens/TripDetailsScreen"
import ExpenseSplitScreen from "./src/screens/ExpenseSplitScreen"

// Context
import { AuthProvider, useAuth } from "./src/context/AuthContext"
import { DataProvider } from "./src/context/DataContext"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function FishingTripsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FishingTripsList" component={FishingTripsScreen} options={{ title: "Pescarias" }} />
      <Stack.Screen name="AddTrip" component={AddTripScreen} options={{ title: "Nova Pescaria" }} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} options={{ title: "Detalhes da Pescaria" }} />
      <Stack.Screen name="ExpenseSplit" component={ExpenseSplitScreen} options={{ title: "Divisão de Gastos" }} />
    </Stack.Navigator>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Pescarias") {
            iconName = focused ? "list" : "list-outline"
          } else if (route.name === "Usuários") {
            iconName = focused ? "heart" : "heart-outline"
          } else if (route.name === "Perfil") {
            iconName = focused ? "apps" : "apps-outline"
          }

          return (
            <View
              style={{
                backgroundColor: focused ? "#ffffff" : "transparent",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
                minWidth: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={iconName} size={size} color={focused ? "#2c2c2c" : "#ffffff"} />
            </View>
          )
        },
        tabBarActiveTintColor: "transparent", // Hide default tint since we're using custom styling
        tabBarInactiveTintColor: "transparent",
        tabBarShowLabel: false, // Hide labels to match the design
        tabBarStyle: {
          backgroundColor: "#2c2c2c",
          borderTopWidth: 0,
          borderRadius: 25,
          marginHorizontal: 20,
          marginBottom: 20,
          height: 60,
          paddingHorizontal: 10,
          position: "absolute",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        headerStyle: {
          backgroundColor: "#2196F3",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Início" }} />
      <Tab.Screen name="Pescarias" component={FishingTripsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Usuários" component={UsersScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

function AppNavigator() {
  const { user } = useAuth()

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </DataProvider>
    </AuthProvider>
  )
}
