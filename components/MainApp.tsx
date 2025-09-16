"use client"

import { useState } from "react"
import { Home, Users, Fish, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import HomeScreen from "./HomeScreen"
import UsersScreen from "./UsersScreen"
import TripsScreen from "./TripsScreen"
import ProfileScreen from "./ProfileScreen"

export default function MainApp() {
  const [activeTab, setActiveTab] = useState("home")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const tabs = [
    { id: "home", label: "Início", icon: Home, component: HomeScreen },
    { id: "users", label: "Usuários", icon: Users, component: UsersScreen },
    { id: "trips", label: "Pescarias", icon: Fish, component: TripsScreen },
    { id: "profile", label: "Perfil", icon: User, component: ProfileScreen },
  ]

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || HomeScreen

  const NavigationContent = () => (
    <div className="flex flex-col space-y-2 p-4">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            className="justify-start"
            onClick={() => {
              setActiveTab(tab.id)
              setIsMenuOpen(false)
            }}
          >
            <Icon className="mr-2 h-4 w-4" />
            {tab.label}
          </Button>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Fishing Manager</h1>
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="py-4">
              <h2 className="text-lg font-semibold mb-4">Menu</h2>
              <NavigationContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Fishing Manager</h1>
            <NavigationContent />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <ActiveComponent />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl px-6 py-3">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${
                  isActive ? "bg-white text-slate-900 shadow-lg scale-110" : "text-white/70 hover:text-white"
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? "mb-1" : ""}`} />
                {isActive && <span className="text-xs font-medium">{tab.label}</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
