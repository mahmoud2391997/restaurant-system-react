// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import {
//   Home,
//   ShoppingCart,
//   Package,
//   Users,
//   Settings,
//   Truck,
//   DollarSign,
//   Phone,
//   Utensils,
//   BarChart3,
// } from "lucide-react"

// const navigation = [
//   { name: "Dashboard", href: "/", icon: Home },
//   { name: "POS System", href: "/pos", icon: ShoppingCart },
//   { name: "Menu Management", href: "/menu", icon: Utensils },
//   { name: "Orders", href: "/orders", icon: Truck },
//   { name: "Inventory", href: "/inventory", icon: Package },
//   { name: "Aggregators", href: "/aggregators", icon: Phone },
//   { name: "HR Management", href: "/hr", icon: Users },
//   { name: "Finance", href: "/finance", icon: DollarSign },
//   { name: "Reports", href: "/reports", icon: BarChart3 },
//   { name: "Settings", href: "/settings", icon: Settings },
// ]

// export function Sidebar() {
//   const pathname = usePathname()

//   return (
//     <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
//       <div className="p-6 border-b border-gray-200">
//         <h1 className="text-xl font-bold text-gray-900">RestaurantOS</h1>
//         <p className="text-sm text-gray-500">Complete Management System</p>
//       </div>

//       <nav className="flex-1 p-4 space-y-2">
//         {navigation.map((item) => {
//           const isActive = pathname === item.href
//           return (
//             <Button
//               key={item.name}
//               variant={isActive ? "default" : "ghost"}
//               className={cn("w-full justify-start gap-3", isActive && "bg-primary text-primary-foreground")}
//               asChild
//             >
//               <Link href={item.href}>
//                 <item.icon className="h-4 w-4" />
//                 {item.name}
//               </Link>
//             </Button>
//           )
//         })}
//       </nav>

//       <div className="p-4 border-t border-gray-200">
//         <div className="text-sm text-gray-500">
//           <p>Branch: Main Location</p>
//           <p>User: Admin</p>
//         </div>
//       </div>
//     </div>
//   )
// }
