import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Dashboard } from "./pages/Dashboard"
import  POSSystem  from "./pages/POSSystem"
import  MenuManagement from "./pages/MenuManagement"
import { OrderHub } from "./pages/OrderHub"
import  InventoryManagement from "./pages/InventoryManagement"
import { AggregatorManagement } from "./pages/AggregatorManagement"
import { CustomerManagement } from "./pages/CustomerManagement"
import { HRManagement } from "./pages/HRManagement"
import { FinanceManagement } from "./pages/FinanceManagement"
import { Reports } from "./pages/Reports"
import { Settings } from "./pages/Settings"
import { SupplyChainManagement } from "./pages/SupplyChainManagement"
import { MenuEngineering } from "./pages/MenuEngineering"
import { Presentation } from "./pages/Presentation"

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POSSystem />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/orders" element={<OrderHub />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/aggregators" element={<AggregatorManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/hr" element={<HRManagement />} />
          <Route path="/finance" element={<FinanceManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/supply-chain" element={<SupplyChainManagement />} />
          <Route path="/menu-engineering" element={<MenuEngineering />} />
          <Route path="/presentation" element={<Presentation />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/kitchen" element={<KitchenDisplaySystem />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
import type React from "react"
import { Header } from "../src/components/Header"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">{children}</main>
      </div>
    </div>
  )
}
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingCart,
  Menu,
  Package,
  Users,
  UserCheck,
  DollarSign,
  BarChart3,
  Truck,
  TrendingUp,
  Smartphone,
  Presentation as presentation,
Settings as settings,
Building2,
Building2Icon,
CookingPot
} from "lucide-react"
import BranchesPage from "./pages/branches"
import KitchenDisplaySystem from "./pages/kitchen"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "POS System", href: "/pos", icon: ShoppingCart },
  { name: "Kitchen View", href: "/kitchen", icon: CookingPot },
  { name: "Menu Management", href: "/menu", icon: Menu },
  { name: "Order Hub", href: "/orders", icon: Package },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Aggregators", href: "/aggregators", icon: Smartphone },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "HR Management", href: "/hr", icon: UserCheck },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Supply Chain", href: "/supply-chain", icon: Truck },
  { name: "Menu Engineering", href: "/menu-engineering", icon: TrendingUp },
  { name: "Branches", href: "/branches", icon: Building2Icon },
  { name: "Presentation", href: "/presentation", icon: presentation },
  { name: "Settings", href: "/settings", icon: settings },
]

export function Sidebar() {
  let location
  try {
    location = useLocation()
  } catch (e) {
    console.error("useLocation hook error:", e)
    location = { pathname: "/" } // fallback
  }
  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 px-4 bg-orange-600">
        <h1 className="text-xl font-bold text-white">Restaurant OS</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive ? "bg-orange-100 text-orange-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-500",
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
