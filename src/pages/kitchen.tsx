"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  ChefHat,
  AlertTriangle,
  CheckCircle,
  Users,
  Utensils,
  Flame,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Bell,
  Settings,
  Filter,
  RefreshCw,
} from "lucide-react"

interface KitchenOrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  modifiers?: Record<string, string>
  specialInstructions?: string
  status: "pending" | "preparing" | "ready" | "served"
  estimatedTime?: number
  actualTime?: number
  startTime?: Date
  completionTime?: Date
  station: "grill" | "fryer" | "salad" | "dessert" | "beverage" | "main"
}

interface KitchenOrder {
  id: string
  orderNumber: string
  tableNumber?: number
  customerName?: string
  orderType: "dine-in" | "delivery" | "takeaway"
  items: KitchenOrderItem[]
  priority: "low" | "normal" | "high" | "urgent"
  status: "new" | "acknowledged" | "preparing" | "ready" | "served" | "delayed"
  orderTime: Date
  estimatedCompletionTime?: Date
  actualCompletionTime?: Date
  totalEstimatedTime: number
  elapsedTime: number
  isRushed: boolean
  specialNotes?: string
  allergens?: string[]
}

interface KitchenStation {
  id: string
  name: string
  type: "grill" | "fryer" | "salad" | "dessert" | "beverage" | "main"
  activeOrders: number
  averageTime: number
  status: "active" | "busy" | "offline"
}

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [selectedStation, setSelectedStation] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("active")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Kitchen stations
  const stations: KitchenStation[] = [
    { id: "grill", name: "Grill Station", type: "grill", activeOrders: 3, averageTime: 12, status: "busy" },
    { id: "fryer", name: "Fryer Station", type: "fryer", activeOrders: 2, averageTime: 8, status: "active" },
    { id: "salad", name: "Salad Station", type: "salad", activeOrders: 1, averageTime: 5, status: "active" },
    { id: "dessert", name: "Dessert Station", type: "dessert", activeOrders: 0, averageTime: 7, status: "active" },
    { id: "beverage", name: "Beverage Station", type: "beverage", activeOrders: 4, averageTime: 3, status: "busy" },
    { id: "main", name: "Main Kitchen", type: "main", activeOrders: 5, averageTime: 15, status: "busy" },
  ]

  // Mock orders data
  useEffect(() => {
    const mockOrders: KitchenOrder[] = [
      {
        id: "ORD-001",
        orderNumber: "001",
        tableNumber: 5,
        orderType: "dine-in",
        items: [
          {
            id: "item-1",
            menuItemId: "MENU-001",
            name: "Margherita Pizza",
            quantity: 2,
            modifiers: { Size: "Large", Crust: "Thin" },
            specialInstructions: "Extra cheese, light sauce",
            status: "preparing",
            estimatedTime: 15,
            startTime: new Date(Date.now() - 5 * 60 * 1000),
            station: "main",
          },
          {
            id: "item-2",
            menuItemId: "MENU-015",
            name: "Caesar Salad",
            quantity: 1,
            status: "ready",
            estimatedTime: 5,
            completionTime: new Date(),
            station: "salad",
          },
        ],
        priority: "normal",
        status: "preparing",
        orderTime: new Date(Date.now() - 10 * 60 * 1000),
        totalEstimatedTime: 15,
        elapsedTime: 10,
        isRushed: false,
        allergens: ["Gluten", "Dairy"],
      },
      {
        id: "ORD-002",
        orderNumber: "002",
        customerName: "John Doe",
        orderType: "takeaway",
        items: [
          {
            id: "item-3",
            menuItemId: "MENU-003",
            name: "Grilled Chicken Burger",
            quantity: 1,
            modifiers: { Cooking: "Medium", Cheese: "Extra" },
            status: "pending",
            estimatedTime: 12,
            station: "grill",
          },
          {
            id: "item-4",
            menuItemId: "MENU-020",
            name: "French Fries",
            quantity: 1,
            status: "pending",
            estimatedTime: 8,
            station: "fryer",
          },
        ],
        priority: "high",
        status: "new",
        orderTime: new Date(Date.now() - 2 * 60 * 1000),
        totalEstimatedTime: 12,
        elapsedTime: 2,
        isRushed: false,
      },
      {
        id: "ORD-003",
        orderNumber: "003",
        tableNumber: 12,
        orderType: "dine-in",
        items: [
          {
            id: "item-5",
            menuItemId: "MENU-008",
            name: "Grilled Salmon",
            quantity: 1,
            specialInstructions: "No lemon, extra vegetables",
            status: "preparing",
            estimatedTime: 18,
            startTime: new Date(Date.now() - 15 * 60 * 1000),
            station: "grill",
          },
        ],
        priority: "urgent",
        status: "delayed",
        orderTime: new Date(Date.now() - 25 * 60 * 1000),
        totalEstimatedTime: 18,
        elapsedTime: 25,
        isRushed: true,
        specialNotes: "Customer is waiting - priority order",
      },
    ]
    setOrders(mockOrders)
  }, [])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      // Update elapsed times
      setOrders((prevOrders) =>
        prevOrders.map((order) => ({
          ...order,
          elapsedTime: Math.floor((Date.now() - order.orderTime.getTime()) / (1000 * 60)),
        })),
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Filter orders based on selected filters
  const filteredOrders = orders.filter((order) => {
    const stationMatch = selectedStation === "all" || order.items.some((item) => item.station === selectedStation)
    const statusMatch =
      selectedStatus === "active"
        ? ["new", "acknowledged", "preparing"].includes(order.status)
        : selectedStatus === "ready"
          ? order.status === "ready"
          : selectedStatus === "completed"
            ? ["served"].includes(order.status)
            : true

    return stationMatch && statusMatch
  })

  // Update order status
  const updateOrderStatus = (orderId: string, newStatus: KitchenOrder["status"]) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status: newStatus }

          // Handle status-specific actions
          switch (newStatus) {
            case "acknowledged":
              console.log(`👁️ Order #${order.orderNumber} acknowledged`)
              break
            case "ready":
              updatedOrder.actualCompletionTime = new Date()
              console.log(`🎉 Order #${order.orderNumber} completed!`)
              break
            case "served":
              console.log(`🍽️ Order #${order.orderNumber} served to customer`)
              break
          }

          // Play sound notification for important status changes
          if (soundEnabled && ["ready", "served"].includes(newStatus)) {
            console.log("🔔 Order status notification sound")
          }

          return updatedOrder
        }
        return order
      }),
    )
  }

  // Update item status with proper state management
  const updateItemStatus = (orderId: string, itemId: string, newStatus: KitchenOrderItem["status"]) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          const updatedItems = order.items.map((item) => {
            if (item.id === itemId) {
              const updatedItem = { ...item, status: newStatus }

              // Handle status transitions
              if (newStatus === "preparing" && !item.startTime) {
                updatedItem.startTime = new Date()
                console.log(`🔥 Started preparing: ${item.name}`)
              } else if (newStatus === "ready") {
                updatedItem.completionTime = new Date()
                updatedItem.actualTime = item.startTime
                  ? Math.floor((Date.now() - item.startTime.getTime()) / (1000 * 60))
                  : undefined
                console.log(`✅ Item ready: ${item.name}`)

                // Play ready sound notification
                if (soundEnabled) {
                  console.log("🔔 Item ready notification sound")
                  // In a real app, you would play an actual sound file
                  // new Audio('/sounds/item-ready.mp3').play()
                }
              }
              return updatedItem
            }
            return item
          })

          // Check if all items are ready to update order status
          const allItemsReady = updatedItems.every((item) => item.status === "ready")
          const hasPreparingItems = updatedItems.some((item) => item.status === "preparing")

          let newOrderStatus = order.status
          if (allItemsReady && order.status !== "ready") {
            newOrderStatus = "ready"
            console.log(`🎉 Order #${order.orderNumber} is ready!`)

            // Play order ready sound
            if (soundEnabled) {
              console.log("🔔 Order complete notification sound")
              // new Audio('/sounds/order-ready.mp3').play()
            }
          } else if (hasPreparingItems && order.status === "new") {
            newOrderStatus = "preparing"
          }

          const updatedOrder = {
            ...order,
            items: updatedItems,
            status: newOrderStatus,
            actualCompletionTime: allItemsReady ? new Date() : order.actualCompletionTime,
          }

          return updatedOrder
        }
        return order
      }),
    )
  }

  // Get priority color
  const getPriorityColor = (priority: string, isRushed: boolean) => {
    if (isRushed) return "bg-red-600"
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "normal":
        return "bg-blue-500"
      case "low":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-purple-500"
      case "acknowledged":
        return "bg-blue-500"
      case "preparing":
        return "bg-yellow-500"
      case "ready":
        return "bg-green-500"
      case "served":
        return "bg-gray-500"
      case "delayed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Calculate progress percentage
  const getProgressPercentage = (order: KitchenOrder) => {
    if (order.status === "served") return 100
    if (order.status === "ready") return 90
    if (order.totalEstimatedTime === 0) return 0
    return Math.min((order.elapsedTime / order.totalEstimatedTime) * 100, 85)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Kitchen Display System</h1>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {currentTime.toLocaleTimeString()}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
              Auto Refresh
            </Button>

            <Button
              variant={soundEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              <Bell className="h-4 w-4 mr-2" />
              Sound {soundEnabled ? "On" : "Off"}
            </Button>

            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Kitchen Stations Overview */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          {stations.map((station) => (
            <Card
              key={station.id}
              className={`cursor-pointer transition-all ${
                selectedStation === station.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedStation(selectedStation === station.id ? "all" : station.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{station.name}</h3>
                  <Badge
                    variant={
                      station.status === "busy" ? "destructive" : station.status === "active" ? "default" : "secondary"
                    }
                  >
                    {station.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Active Orders:</span>
                    <span className="font-medium">{station.activeOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Time:</span>
                    <span className="font-medium">{station.averageTime}min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active Orders</SelectItem>
              <SelectItem value="ready">Ready Orders</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="all">All Orders</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredOrders.map((order) => (
          <Card
            key={order.id}
            className={`relative overflow-hidden border-l-4 ${getPriorityColor(order.priority, order.isRushed)} ${
              order.isRushed ? "animate-pulse" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">#{order.orderNumber}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {order.tableNumber ? (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Table {order.tableNumber}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {order.customerName || "Takeaway"}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {order.orderType}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge className={`text-xs ${getStatusColor(order.status)} text-white`}>{order.status}</Badge>
                  <Badge
                    variant={
                      order.priority === "urgent" || order.isRushed
                        ? "destructive"
                        : order.priority === "high"
                          ? "default"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {order.isRushed ? "RUSHED" : order.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Timer and Progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {order.elapsedTime}min / {order.totalEstimatedTime}min
                    </span>
                  </div>
                  {order.elapsedTime > order.totalEstimatedTime && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      DELAYED
                    </Badge>
                  )}
                </div>
                <Progress
                  value={getProgressPercentage(order)}
                  className={`h-2 ${order.elapsedTime > order.totalEstimatedTime ? "bg-red-100" : "bg-gray-200"}`}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Order Items */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-3 transition-all ${
                      item.status === "preparing"
                        ? "bg-yellow-50 border-yellow-200 shadow-md"
                        : item.status === "ready"
                          ? "bg-green-50 border-green-200 shadow-md"
                          : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {item.quantity}x {item.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {item.station}
                          </Badge>
                        </div>

                        {/* Modifiers */}
                        {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(item.modifiers).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Special Instructions */}
                        {item.specialInstructions && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                            <div className="flex items-center gap-1 text-yellow-800">
                              <Eye className="h-3 w-3" />
                              <span className="font-medium">Special Instructions:</span>
                            </div>
                            <p className="text-yellow-700 mt-1">{item.specialInstructions}</p>
                          </div>
                        )}
                      </div>

                      <Badge
                        className={`text-xs ml-2 ${
                          item.status === "ready"
                            ? "bg-green-500"
                            : item.status === "preparing"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                        } text-white`}
                      >
                        {item.status}
                      </Badge>
                    </div>

                    {/* Item Actions */}
                    <div className="flex gap-2 mt-2">
                      {item.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          onClick={() => {
                            updateItemStatus(order.id, item.id, "preparing")
                            console.log(`▶️ Started preparing ${item.name} for Order #${order.orderNumber}`)
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start Cooking
                        </Button>
                      )}

                      {item.status === "preparing" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
                            onClick={() => {
                              updateItemStatus(order.id, item.id, "pending")
                              console.log(`⏸️ Paused preparing ${item.name} for Order #${order.orderNumber}`)
                            }}
                          >
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 text-xs bg-green-600 hover:bg-green-700 transition-colors"
                            onClick={() => {
                              updateItemStatus(order.id, item.id, "ready")
                              console.log(`✅ ${item.name} is ready for Order #${order.orderNumber}`)
                            }}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Ready
                          </Button>
                        </>
                      )}

                      {item.status === "ready" && (
                        <div className="flex gap-2 w-full">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              updateItemStatus(order.id, item.id, "preparing")
                              console.log(`🔄 Reverted ${item.name} back to preparing for Order #${order.orderNumber}`)
                            }}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Undo
                          </Button>
                          <div className="flex-1 flex items-center justify-center bg-green-100 rounded text-green-800 text-xs font-medium">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ready to Serve
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timing Info */}
                    {item.estimatedTime && (
                      <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                        <span>Est: {item.estimatedTime}min</span>
                        {item.actualTime && <span>Actual: {item.actualTime}min</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Special Notes */}
              {order.specialNotes && (
                <div className="p-2 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center gap-1 text-red-800 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="font-medium">Special Notes:</span>
                  </div>
                  <p className="text-red-700 text-xs mt-1">{order.specialNotes}</p>
                </div>
              )}

              {/* Allergens */}
              {order.allergens && order.allergens.length > 0 && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                  <div className="flex items-center gap-1 text-orange-800 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="font-medium">Allergens:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {order.allergens.map((allergen) => (
                      <Badge key={allergen} variant="destructive" className="text-xs">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Actions */}
              <Separator />
              <div className="flex gap-2">
                {order.status === "new" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateOrderStatus(order.id, "acknowledged")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Acknowledge
                  </Button>
                )}

                {["acknowledged", "preparing"].includes(order.status) && (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => updateOrderStatus(order.id, "ready")}
                    disabled={!order.items.every((item) => item.status === "ready")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Order
                  </Button>
                )}

                {order.status === "ready" && (
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => updateOrderStatus(order.id, "served")}
                  >
                    <Utensils className="h-4 w-4 mr-2" />
                    Served
                  </Button>
                )}
              </div>
            </CardContent>

            {/* Rush Order Indicator */}
            {order.isRushed && (
              <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-xs font-bold transform rotate-12 translate-x-2 -translate-y-1">
                <Flame className="h-3 w-3 inline mr-1" />
                RUSH
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders to display</h3>
          <p className="text-gray-500">
            {selectedStatus === "active"
              ? "All caught up! No active orders in the kitchen."
              : "No orders match the current filters."}
          </p>
        </div>
      )}
    </div>
  )
}
