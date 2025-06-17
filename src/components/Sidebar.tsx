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
  Settings,
  Truck,
  TrendingUp,
  Presentation,
  Smartphone,
  CookieIcon,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "POS System", href: "/pos", icon: ShoppingCart },
  { name: "Menu Management", href: "/menu", icon: Menu },
  { name: "Kitchen View", href: "/kitchen", icon: CookieIcon },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Aggregators", href: "/aggregators", icon: Smartphone },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "HR Management", href: "/hr", icon: UserCheck },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Supply Chain", href: "/supply-chain", icon: Truck },
  { name: "Menu Engineering", href: "/menu-engineering", icon: TrendingUp },
  { name: "Presentation", href: "/presentation", icon: Presentation },
  { name: "Settings", href: "/settings", icon: Settings },
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
