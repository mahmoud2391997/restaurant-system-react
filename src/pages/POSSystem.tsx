"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import {
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Search,
  Clock,
  MapPin,
  ShoppingCart,
  User,
  Phone,
  Wifi,
  WifiOff,
  Globe,
  ChefHat,
  Receipt,
  Eye,
  Play,
  CheckCircle,
  AlertTriangle,
  Filter,
  DollarSign,
  TrendingUp,
} from "lucide-react"

import type { MenuItem, Table, Customer } from "@/types/entities"
import type { KitchenOrder, KitchenOrderItem } from "@/types/pos"
import { mockMenuItems, mockCategories, mockTables, mockCustomers } from "@/lib/mock-data"

interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  modifiers?: Record<string, string>
  specialInstructions?: string
  station: "grill" | "fryer" | "salad" | "dessert" | "beverage" | "main"
  estimatedTime: number
}

interface Transaction {
  id: string
  orderId: string
  orderNumber: string
  tableNumber?: number
  customerName?: string
  orderType: "dine-in" | "delivery" | "takeaway"
  items: CartItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: string
  status: "pending" | "paid" | "refunded"
  createdAt: Date
  paidAt?: Date
}

export default function ThreeTabPOSSystem() {
  // Core state
  const [activeTab, setActiveTab] = useState("ordering")
  const [cart, setCart] = useState<CartItem[]>([])
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Order details
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [orderType, setOrderType] = useState<"dine-in" | "delivery" | "takeaway">("dine-in")
  const [language, setLanguage] = useState<"en" | "ar">("en")
  const [isOnline, setIsOnline] = useState(true)

  // UI state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())

  // Modifier dialog state
  const [isModifierDialogOpen, setIsModifierDialogOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [currentModifiers, setCurrentModifiers] = useState<Record<string, string>>({})
  const [itemSpecialInstructions, setItemSpecialInstructions] = useState("")

  // Kitchen filters
  const [kitchenStatusFilter, setKitchenStatusFilter] = useState("active")
  const [kitchenStationFilter, setKitchenStationFilter] = useState("all")

  // Payment state
  const [readyForPaymentOrders, setReadyForPaymentOrders] = useState<KitchenOrder[]>([])
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<KitchenOrder | null>(null)
  const [paymentDiscountAmount, setPaymentDiscountAmount] = useState(0)
  const [paymentDiscountType, setPaymentDiscountType] = useState<"percentage" | "fixed">("percentage")
  const [splitPayment, setSplitPayment] = useState(false)
  const [splitAmounts, setSplitAmounts] = useState<{ method: string; amount: number }[]>([])

  // Mock data
  const menuItems = mockMenuItems.map((item) => ({
    ...item,
    isAvailable: true,
  }))
  const categories = ["All", ...mockCategories.map((cat) => cat.name)]
  const tables = mockTables
  const customers = mockCustomers

  // Mock modifiers data
  const mockModifiers = {
    "MENU-001": {
      // Pizza
      Size: { type: "single", options: ["Small (+$0)", "Medium (+$2)", "Large (+$4)"] },
      Crust: { type: "single", options: ["Thin", "Thick", "Stuffed (+$3)"] },
      "Extra Toppings": {
        type: "multiple",
        options: ["Extra Cheese (+$2)", "Pepperoni (+$3)", "Mushrooms (+$1)", "Olives (+$1)"],
      },
    },
    "MENU-002": {
      // Caesar Salad
      Size: { type: "single", options: ["Regular", "Large (+$3)"] },
      Dressing: { type: "single", options: ["Caesar", "Ranch", "Italian"] },
      "Add-ons": { type: "multiple", options: ["Grilled Chicken (+$4)", "Croutons", "Extra Parmesan (+$1)"] },
    },
    "MENU-003": {
      // Burger
      Cooking: { type: "single", options: ["Rare", "Medium Rare", "Medium", "Medium Well", "Well Done"] },
      Cheese: { type: "single", options: ["No Cheese", "American (+$1)", "Cheddar (+$1)", "Swiss (+$1)"] },
      Extras: { type: "multiple", options: ["Bacon (+$2)", "Avocado (+$2)", "Extra Patty (+$5)", "Onion Rings (+$2)"] },
    },
    "MENU-004": {
      // Pasta
      Size: { type: "single", options: ["Regular", "Large (+$3)"] },
      Sauce: { type: "single", options: ["Marinara", "Alfredo (+$2)", "Pesto (+$2)", "Carbonara (+$3)"] },
      "Add-ons": {
        type: "multiple",
        options: ["Grilled Chicken (+$4)", "Shrimp (+$6)", "Extra Cheese (+$2)", "Garlic Bread (+$3)"],
      },
    },
  }

  // Station mapping for menu items
  const getItemStation = (menuItemId: string): CartItem["station"] => {
    const stationMap: Record<string, CartItem["station"]> = {
      "MENU-001": "main", // Pizza
      "MENU-002": "salad", // Caesar Salad
      "MENU-003": "grill", // Burger
      "MENU-004": "main", // Pasta
      "MENU-005": "grill", // Steak
      "MENU-006": "fryer", // Fries
      "MENU-007": "beverage", // Drinks
    }
    return stationMap[menuItemId] || "main"
  }

  // Get estimated cooking time
  const getEstimatedTime = (menuItemId: string): number => {
    const timeMap: Record<string, number> = {
      "MENU-001": 15, // Pizza
      "MENU-002": 5, // Caesar Salad
      "MENU-003": 12, // Burger
      "MENU-004": 18, // Pasta
      "MENU-005": 20, // Steak
      "MENU-006": 8, // Fries
      "MENU-007": 3, // Drinks
    }
    return timeMap[menuItemId] || 10
  }

  // Initialize mock data
  useEffect(() => {
    // Mock kitchen orders
    const mockKitchenOrders: KitchenOrder[] = [
      {
        id: "KDS-001",
        orderNumber: "001",
        tableNumber: 5,
        customerName: "John Doe",
        orderType: "dine-in",
        items: [
          {
            id: "item-1",
            menuItemId: "MENU-001",
            name: "Margherita Pizza",
            quantity: 2,
            modifiers: { Size: "Large", Crust: "Thin" },
            specialInstructions: "Extra cheese",
            status: "preparing",
            estimatedTime: 15,
            startTime: new Date(Date.now() - 5 * 60 * 1000),
            station: "main",
          },
          {
            id: "item-2",
            menuItemId: "MENU-002",
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
      },
      {
        id: "KDS-002",
        orderNumber: "002",
        tableNumber: 8,
        orderType: "dine-in",
        items: [
          {
            id: "item-3",
            menuItemId: "MENU-003",
            name: "Chicken Burger",
            quantity: 1,
            status: "ready",
            estimatedTime: 12,
            completionTime: new Date(),
            station: "grill",
          },
        ],
        priority: "normal",
        status: "ready",
        orderTime: new Date(Date.now() - 15 * 60 * 1000),
        totalEstimatedTime: 12,
        elapsedTime: 15,
        isRushed: false,
      },
    ]
    setKitchenOrders(mockKitchenOrders)

    // Mock transactions
    const mockTransactions: Transaction[] = [
      {
        id: "TXN-001",
        orderId: "ORD-001",
        orderNumber: "001",
        tableNumber: 3,
        customerName: "Alice Smith",
        orderType: "dine-in",
        items: [
          {
            id: "item-1",
            menuItemId: "MENU-001",
            name: "Margherita Pizza",
            price: 18.99,
            quantity: 1,
            station: "main",
            estimatedTime: 15,
          },
        ],
        subtotal: 18.99,
        discount: 0,
        tax: 1.9,
        total: 20.89,
        paymentMethod: "card",
        status: "paid",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "TXN-002",
        orderId: "ORD-002",
        orderNumber: "002",
        customerName: "Bob Johnson",
        orderType: "takeaway",
        items: [
          {
            id: "item-2",
            menuItemId: "MENU-003",
            name: "Chicken Burger",
            price: 15.99,
            quantity: 2,
            station: "grill",
            estimatedTime: 12,
          },
        ],
        subtotal: 31.98,
        discount: 3.2,
        tax: 2.88,
        total: 31.66,
        paymentMethod: "cash",
        status: "paid",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ]
    setTransactions(mockTransactions)
  }, [])

  // Filter ready orders for payment
  useEffect(() => {
    const readyOrders = kitchenOrders.filter((order) => order.status === "ready")
    setReadyForPaymentOrders(readyOrders)
  }, [kitchenOrders])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      // Update elapsed times for kitchen orders
      setKitchenOrders((prevOrders) =>
        prevOrders.map((order) => ({
          ...order,
          elapsedTime: Math.floor((Date.now() - order.orderTime.getTime()) / (1000 * 60)),
        })),
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "All" || mockCategories.find((cat) => cat.id === item.categoryId)?.name === selectedCategory
    return matchesSearch && matchesCategory && item.isAvailable
  })

  // Group tables by zone
  const tablesByZone = tables.reduce(
    (acc, table) => {
      if (!acc[table.zone]) acc[table.zone] = []
      acc[table.zone].push(table)
      return acc
    },
    {} as Record<string, Table[]>,
  )

  // Filter kitchen orders
  const filteredKitchenOrders = kitchenOrders.filter((order) => {
    const statusMatch =
      kitchenStatusFilter === "active"
        ? ["new", "acknowledged", "preparing"].includes(order.status)
        : kitchenStatusFilter === "ready"
          ? order.status === "ready"
          : kitchenStatusFilter === "completed"
            ? order.status === "served"
            : true

    const stationMatch =
      kitchenStationFilter === "all" || order.items.some((item) => item.station === kitchenStationFilter)

    return statusMatch && stationMatch
  })

  // Enhanced add to cart function with modifier support
  const addToCartWithModifiers = (item: MenuItem, modifiers?: Record<string, string>, instructions?: string) => {
    const cartItemId = `${item.id}-${JSON.stringify(modifiers || {})}-${instructions || ""}`
    const existingItem = cart.find((cartItem) => cartItem.id === cartItemId)

    // Calculate modifier price
    const modifierPrice = calculateModifierPrice(item.id, modifiers || {})

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === cartItemId ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          id: cartItemId,
          menuItemId: item.id,
          name: item.name,
          price: item.price + modifierPrice,
          quantity: 1,
          modifiers: modifiers || {},
          specialInstructions: instructions,
          station: getItemStation(item.id),
          estimatedTime: getEstimatedTime(item.id),
        },
      ])
    }
  }

  // Calculate modifier price
  const calculateModifierPrice = (menuItemId: string, modifiers: Record<string, string>): number => {
    const itemModifiers = mockModifiers[menuItemId as keyof typeof mockModifiers]
    if (!itemModifiers) return 0

    let totalPrice = 0
    Object.entries(modifiers).forEach(([category, selection]) => {
      if (itemModifiers[category]) {
        if (itemModifiers[category].type === "single") {
          const match = selection.match(/$$\+\$(\d+)$$/)
          if (match) totalPrice += Number.parseFloat(match[1])
        } else {
          // Multiple selections
          const selections = selection.split(", ")
          selections.forEach((sel) => {
            const match = sel.match(/$$\+\$(\d+)$$/)
            if (match) totalPrice += Number.parseFloat(match[1])
          })
        }
      }
    })
    return totalPrice
  }

  // Open modifier dialog
  const openModifierDialog = (item: MenuItem) => {
    setSelectedMenuItem(item)
    setCurrentModifiers({})
    setItemSpecialInstructions("")
    setIsModifierDialogOpen(true)
  }

  // Handle modifier selection
  const handleModifierChange = (category: string, option: string, isMultiple: boolean) => {
    if (isMultiple) {
      const currentSelections = currentModifiers[category] ? currentModifiers[category].split(", ") : []
      const newSelections = currentSelections.includes(option)
        ? currentSelections.filter((sel) => sel !== option)
        : [...currentSelections, option]

      setCurrentModifiers((prev) => ({
        ...prev,
        [category]: newSelections.join(", "),
      }))
    } else {
      setCurrentModifiers((prev) => ({
        ...prev,
        [category]: option,
      }))
    }
  }

  // Add item with modifiers to cart
  const addItemWithModifiers = () => {
    if (selectedMenuItem) {
      addToCartWithModifiers(selectedMenuItem, currentModifiers, itemSpecialInstructions)
      setIsModifierDialogOpen(false)
      setSelectedMenuItem(null)
      setCurrentModifiers({})
      setItemSpecialInstructions("")
    }
  }

  const updateQuantity = (id: string, change: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + change
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
          }
          return item
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  // Send order to kitchen
  const sendToKitchen = () => {
    if (cart.length === 0) {
      alert("Cart is empty!")
      return
    }

    if (orderType === "dine-in" && !selectedTable) {
      alert("Please select a table for dine-in orders")
      return
    }

    const orderNumber = `${Date.now().toString().slice(-3)}`
    const newKitchenOrder: KitchenOrder = {
      id: `KDS-${Date.now()}`,
      orderNumber,
      tableNumber: selectedTable?.number,
      customerName: selectedCustomer?.name,
      orderType,
      items: cart.map((item) => ({
        id: `item-${Date.now()}-${item.id}`,
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        modifiers: item.modifiers,
        specialInstructions: item.specialInstructions,
        status: "pending",
        estimatedTime: item.estimatedTime,
        station: item.station,
      })),
      priority: "normal",
      status: "new",
      orderTime: new Date(),
      totalEstimatedTime: Math.max(...cart.map((item) => item.estimatedTime)),
      elapsedTime: 0,
      isRushed: false,
      specialNotes: specialInstructions,
    }

    setKitchenOrders((prev) => [...prev, newKitchenOrder])

    // Clear cart and reset form
    setCart([])
    setSpecialInstructions("")
    setSelectedTable(null)
    setSelectedCustomer(null)

    // Switch to kitchen orders tab
    setActiveTab("kitchen")

    alert(`Order #${orderNumber} sent to kitchen successfully!`)
  }

  // Update kitchen order item status
  const updateItemStatus = (orderId: string, itemId: string, newStatus: KitchenOrderItem["status"]) => {
    setKitchenOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          const updatedItems = order.items.map((item) => {
            if (item.id === itemId) {
              const updatedItem = { ...item, status: newStatus }
              if (newStatus === "preparing" && !item.startTime) {
                updatedItem.startTime = new Date()
              } else if (newStatus === "ready") {
                updatedItem.completionTime = new Date()
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
          } else if (hasPreparingItems && order.status === "new") {
            newOrderStatus = "preparing"
          }

          return {
            ...order,
            items: updatedItems,
            status: newOrderStatus,
            actualCompletionTime: allItemsReady ? new Date() : order.actualCompletionTime,
          }
        }
        return order
      }),
    )
  }

  // Update process payment function
  const processPayment = (paymentMethod: string) => {
    if (!selectedOrderForPayment) return

    const subtotal = selectedOrderForPayment.items.reduce((sum, item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)
      return sum + (menuItem?.price || 0) * item.quantity
    }, 0)

    const discountAmount =
      paymentDiscountType === "percentage" ? subtotal * (paymentDiscountAmount / 100) : paymentDiscountAmount

    const afterDiscount = subtotal - discountAmount
    const tax = afterDiscount * 0.1
    const total = afterDiscount + tax

    const newTransaction: Transaction = {
      id: `TXN-${Date.now()}`,
      orderId: `ORD-${Date.now()}`,
      orderNumber: selectedOrderForPayment.orderNumber,
      tableNumber: selectedOrderForPayment.tableNumber,
      customerName: selectedOrderForPayment.customerName,
      orderType: selectedOrderForPayment.orderType,
      items: selectedOrderForPayment.items.map((item) => {
        const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)
        return {
          id: item.id,
          menuItemId: item.menuItemId,
          name: item.name,
          price: menuItem?.price || 0,
          quantity: item.quantity,
          modifiers: item.modifiers,
          specialInstructions: item.specialInstructions,
          station: item.station,
          estimatedTime: item.estimatedTime || 0,
        }
      }),
      subtotal,
      discount: discountAmount,
      tax,
      total,
      paymentMethod,
      status: "paid",
      createdAt: new Date(),
      paidAt: new Date(),
    }

    setTransactions((prev) => [...prev, newTransaction])

    // Update kitchen order status to served
    setKitchenOrders((prev) =>
      prev.map((order) => (order.id === selectedOrderForPayment.id ? { ...order, status: "served" } : order)),
    )

    alert(`Payment of $${total.toFixed(2)} processed successfully!`)
  }

  // Calculate totals for cart
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Restaurant POS System</h1>
            <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {currentTime.toLocaleTimeString()}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <Select value={language} onValueChange={(value: "en" | "ar") => setLanguage(value)}>
              <SelectTrigger className="w-32">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>

            <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dine-in">Dine In</SelectItem>
                <SelectItem value="takeaway">Takeaway</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="ordering" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Making Order to Kitchen
          </TabsTrigger>
          <TabsTrigger value="kitchen" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Kitchen Orders ({filteredKitchenOrders.length})
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Order Payment ({readyForPaymentOrders.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Making Order to Kitchen */}
        <TabsContent value="ordering" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Menu and Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search menu items..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Table Selection for Dine-in */}
              {orderType === "dine-in" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Table Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(tablesByZone).map(([zone, zoneTables]) => (
                        <div key={zone}>
                          <h3 className="font-medium mb-2">{zone}</h3>
                          <div className="grid grid-cols-5 gap-2">
                            {zoneTables.map((table) => (
                              <Button
                                key={table.id}
                                variant={selectedTable?.id === table.id ? "default" : "outline"}
                                className="h-12"
                                onClick={() => setSelectedTable(table)}
                              >
                                {table.number}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Customer Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedCustomer?.id || "guest"}
                    onValueChange={(value) => {
                      const customer = customers.find((c) => c.id === value)
                      setSelectedCustomer(customer || null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer or continue as guest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest">Guest Customer</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Menu Categories */}
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {categories.slice(0, 4).map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={selectedCategory} className="mt-6">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenuItems.map((item) => (
                      <Card
                        key={item.id}
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => {
                          const itemModifiers = mockModifiers[item.id as keyof typeof mockModifiers]
                          if (itemModifiers && Object.keys(itemModifiers).length > 0) {
                            openModifierDialog(item)
                          } else {
                            addToCartWithModifiers(item)
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                            <span className="text-gray-400">Image</span>
                          </div>
                          <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="outline" className="text-xs">
                                {getItemStation(item.id)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {getEstimatedTime(item.id)}min
                              </Badge>
                              {mockModifiers[item.id as keyof typeof mockModifiers] && (
                                <Badge variant="default" className="text-xs bg-blue-500">
                                  Customizable
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Cart */}
            <div className="space-y-6">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Current Order
                    </span>
                    <div className="flex flex-col items-end text-sm gap-1">
                      {orderType === "dine-in" && selectedTable && (
                        <Badge variant="outline">Table {selectedTable.number}</Badge>
                      )}
                      <Badge variant="secondary">{orderType}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  {selectedCustomer && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{selectedCustomer.name}</span>
                        <Badge variant="outline">{selectedCustomer.tier}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {selectedCustomer.phone}
                        </div>
                        <div>Loyalty Points: {selectedCustomer.loyaltyPoints}</div>
                      </div>
                    </div>
                  )}

                  {/* Cart Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No items in cart</p>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                              <div className="flex gap-1 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {item.station}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {item.estimatedTime}min
                                </Badge>
                              </div>
                              {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                                <div className="mt-1">
                                  {Object.entries(item.modifiers).map(([key, value]) => (
                                    <Badge key={key} variant="outline" className="text-xs mr-1 mb-1">
                                      {key}: {value}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {item.specialInstructions && (
                                <p className="text-xs text-orange-600 mt-1">Note: {item.specialInstructions}</p>
                              )}
                            </div>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-red-500"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Special Instructions */}
                  {cart.length > 0 && (
                    <>
                      <div>
                        <Label htmlFor="instructions">Special Instructions</Label>
                        <Textarea
                          id="instructions"
                          placeholder="Any special requests for the kitchen..."
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                          rows={2}
                        />
                      </div>

                      {/* Order Summary */}
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Subtotal:</span>
                          <span>${cartSubtotal.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Send to Kitchen Button */}
                      <Button
                        onClick={sendToKitchen}
                        className="w-full"
                        size="lg"
                        disabled={cart.length === 0 || (orderType === "dine-in" && !selectedTable)}
                      >
                        <ChefHat className="h-4 w-4 mr-2" />
                        Send to Kitchen ({cart.length} items)
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Kitchen Orders */}
        <TabsContent value="kitchen" className="space-y-6">
          {/* Kitchen Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={kitchenStatusFilter} onValueChange={setKitchenStatusFilter}>
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

            <Select value={kitchenStationFilter} onValueChange={setKitchenStationFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                <SelectItem value="grill">Grill</SelectItem>
                <SelectItem value="fryer">Fryer</SelectItem>
                <SelectItem value="salad">Salad</SelectItem>
                <SelectItem value="main">Main Kitchen</SelectItem>
                <SelectItem value="beverage">Beverage</SelectItem>
                <SelectItem value="dessert">Dessert</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="outline">
              {filteredKitchenOrders.length} order{filteredKitchenOrders.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {/* Kitchen Orders Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredKitchenOrders.map((order) => (
              <Card
                key={order.id}
                className={`border-l-4 ${
                  order.status === "new"
                    ? "border-l-red-500"
                    : order.status === "preparing"
                      ? "border-l-yellow-500"
                      : order.status === "ready"
                        ? "border-l-green-500"
                        : "border-l-gray-500"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">#{order.orderNumber}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {order.tableNumber ? `Table ${order.tableNumber}` : order.customerName || order.orderType}
                      </p>
                    </div>
                    <Badge
                      className={`text-xs ${
                        order.status === "ready"
                          ? "bg-green-500"
                          : order.status === "preparing"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                      } text-white`}
                    >
                      {order.status}
                    </Badge>
                  </div>

                  {/* Timer */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
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
                            ? "bg-yellow-50 border-yellow-200"
                            : item.status === "ready"
                              ? "bg-green-50 border-green-200"
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

                            {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {Object.entries(item.modifiers).map(([key, value]) => (
                                  <Badge key={key} variant="secondary" className="text-xs">
                                    {key}: {value}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {item.specialInstructions && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                <div className="flex items-center gap-1 text-yellow-800">
                                  <Eye className="h-3 w-3" />
                                  <span className="font-medium">Note:</span>
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
                              className="flex-1 text-xs"
                              onClick={() => updateItemStatus(order.id, item.id, "preparing")}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          )}

                          {item.status === "preparing" && (
                            <Button
                              size="sm"
                              className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                              onClick={() => updateItemStatus(order.id, item.id, "ready")}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ready
                            </Button>
                          )}

                          {item.status === "ready" && (
                            <div className="flex-1 flex items-center justify-center bg-green-100 rounded text-green-800 text-xs font-medium py-1">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ready to Serve
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Actions */}
                  <Separator />
                  <div className="flex gap-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredKitchenOrders.length === 0 && (
            <div className="text-center py-12">
              <ChefHat className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No kitchen orders</h3>
              <p className="text-gray-500">No orders match the current filters.</p>
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Order Payment */}
        <TabsContent value="payment" className="space-y-6">
          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Ready Orders</p>
                    <p className="text-2xl font-bold">{readyForPaymentOrders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Pending Amount</p>
                    <p className="text-2xl font-bold">
                      $
                      {readyForPaymentOrders
                        .reduce((sum, order) => {
                          const orderTotal = order.items.reduce((itemSum, item) => {
                            const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)
                            return itemSum + (menuItem?.price || 0) * item.quantity
                          }, 0)
                          return sum + orderTotal * 1.1 // Including 10% tax
                        }, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Receipt className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Today's Payments</p>
                    <p className="text-2xl font-bold">
                      {
                        transactions.filter((t) => new Date(t.createdAt).toDateString() === new Date().toDateString())
                          .length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Today's Revenue</p>
                    <p className="text-2xl font-bold">
                      $
                      {transactions
                        .filter((t) => new Date(t.createdAt).toDateString() === new Date().toDateString())
                        .reduce((sum, t) => sum + t.total, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ready Orders for Payment */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {readyForPaymentOrders.map((order) => {
              const orderSubtotal = order.items.reduce((sum, item) => {
                const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)
                return sum + (menuItem?.price || 0) * item.quantity
              }, 0)
              const orderTax = orderSubtotal * 0.1
              const orderTotal = orderSubtotal + orderTax

              return (
                <Card key={order.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">#{order.orderNumber}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {order.tableNumber ? `Table ${order.tableNumber}` : order.customerName || order.orderType}
                        </p>
                        <p className="text-xs text-gray-400">
                          Ready at: {order.actualCompletionTime?.toLocaleTimeString() || "Just now"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500 text-white mb-2">READY</Badge>
                        <p className="text-2xl font-bold">${orderTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.map((item) => {
                        const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)
                        return (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span>${((menuItem?.price || 0) * item.quantity).toFixed(2)}</span>
                          </div>
                        )
                      })}
                    </div>

                    <Separator />

                    {/* Order Summary */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${orderSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (10%):</span>
                        <span>${orderTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${orderTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Payment Button */}
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => setSelectedOrderForPayment(order)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Process Payment
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Empty State */}
          {readyForPaymentOrders.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders ready for payment</h3>
              <p className="text-gray-500">Orders will appear here when they're ready from the kitchen.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Enhanced Payment Dialog */}
      <Dialog open={!!selectedOrderForPayment} onOpenChange={() => setSelectedOrderForPayment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Process Payment - Order #{selectedOrderForPayment?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrderForPayment && (
            <div className="space-y-6">
              {/* Order Details */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Order Type:</span>
                    <p>{selectedOrderForPayment.orderType}</p>
                  </div>
                  {selectedOrderForPayment.tableNumber && (
                    <div>
                      <span className="font-medium">Table:</span>
                      <p>Table {selectedOrderForPayment.tableNumber}</p>
                    </div>
                  )}
                  {selectedOrderForPayment.customerName && (
                    <div>
                      <span className="font-medium">Customer:</span>
                      <p>{selectedOrderForPayment.customerName}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Items:</span>
                    <p>{selectedOrderForPayment.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="font-medium">Order Items:</h4>
                {selectedOrderForPayment.items.map((item) => {
                  const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)
                  return (
                    <div key={item.id} className="flex justify-between text-sm border-b pb-1">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${((menuItem?.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>

              {/* Discount Section */}
              <div className="space-y-3">
                <h4 className="font-medium">Discount (Optional):</h4>
                <div className="flex gap-2">
                  <Select
                    value={paymentDiscountType}
                    onValueChange={(value: "percentage" | "fixed") => setPaymentDiscountType(value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">$</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="0"
                    value={paymentDiscountAmount}
                    onChange={(e) => setPaymentDiscountAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Split Payment Option */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="splitPayment"
                    checked={splitPayment}
                    onChange={(e) => setSplitPayment(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="splitPayment">Split Payment</Label>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    $
                    {selectedOrderForPayment.items
                      .reduce((sum, item) => {
                        const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)
                        return sum + (menuItem?.price || 0) * item.quantity
                      }, 0)
                      .toFixed(2)}
                  </span>
                </div>
                {paymentDiscountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>
                      -
                      {paymentDiscountType === "percentage"
                        ? `${paymentDiscountAmount}%`
                        : `$${paymentDiscountAmount.toFixed(2)}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span>
                    ${(() => {
                      const subtotal = selectedOrderForPayment.items.reduce((sum, item) => {
                        const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)
                        return sum + (menuItem?.price || 0) * item.quantity
                      }, 0)
                      const discountAmount =
                        paymentDiscountType === "percentage"
                          ? subtotal * (paymentDiscountAmount / 100)
                          : paymentDiscountAmount
                      return ((subtotal - discountAmount) * 0.1).toFixed(2)
                    })()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>
                    ${(() => {
                      const subtotal = selectedOrderForPayment.items.reduce((sum, item) => {
                        const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)
                        return sum + (menuItem?.price || 0) * item.quantity
                      }, 0)
                      const discountAmount =
                        paymentDiscountType === "percentage"
                          ? subtotal * (paymentDiscountAmount / 100)
                          : paymentDiscountAmount
                      const afterDiscount = subtotal - discountAmount
                      const tax = afterDiscount * 0.1
                      return (afterDiscount + tax).toFixed(2)
                    })()}
                  </span>
                </div>
              </div>

              {/* Payment Method Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    processPayment("card")
                    setSelectedOrderForPayment(null)
                    setPaymentDiscountAmount(0)
                    setSplitPayment(false)
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay by Card
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    processPayment("cash")
                    setSelectedOrderForPayment(null)
                    setPaymentDiscountAmount(0)
                    setSplitPayment(false)
                  }}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Cash Payment
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    processPayment("mobile")
                    setSelectedOrderForPayment(null)
                    setPaymentDiscountAmount(0)
                    setSplitPayment(false)
                  }}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile Payment
                </Button>
              </div>

              {/* Cancel Button */}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setSelectedOrderForPayment(null)
                  setPaymentDiscountAmount(0)
                  setSplitPayment(false)
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modifier Selection Dialog */}
      <Dialog open={isModifierDialogOpen} onOpenChange={setIsModifierDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Your Order</DialogTitle>
          </DialogHeader>
          {selectedMenuItem && (
            <div className="space-y-6">
              {/* Item Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-500">IMG</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{selectedMenuItem.name}</h3>
                  <p className="text-sm text-gray-600">{selectedMenuItem.description}</p>
                  <p className="text-lg font-bold text-green-600">
                    $
                    {(selectedMenuItem.price + calculateModifierPrice(selectedMenuItem.id, currentModifiers)).toFixed(
                      2,
                    )}
                  </p>
                </div>
              </div>

              {/* Modifiers */}
              {mockModifiers[selectedMenuItem.id as keyof typeof mockModifiers] && (
                <div className="space-y-4">
                  {Object.entries(mockModifiers[selectedMenuItem.id as keyof typeof mockModifiers]).map(
                    ([category, config]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-lg">{category}</h4>
                          <Badge variant="outline" className="text-xs">
                            {config.type === "single" ? "Choose One" : "Choose Multiple"}
                          </Badge>
                        </div>

                        <div className="grid gap-2">
                          {config.options.map((option) => {
                            const isSelected =
                              config.type === "single"
                                ? currentModifiers[category] === option
                                : currentModifiers[category]?.split(", ").includes(option) || false

                            return (
                              <div
                                key={option}
                                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                  isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => handleModifierChange(category, option, config.type === "multiple")}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{option.replace(/\s*$$\+\$\d+$$/, "")}</span>
                                  <div className="flex items-center gap-2">
                                    {option.includes("(+$") && (
                                      <span className="text-green-600 font-medium">
                                        {option.match(/$$\+\$\d+$$/)?.[0]}
                                      </span>
                                    )}
                                    <div
                                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                        isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                                      }`}
                                    >
                                      {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="itemInstructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="itemInstructions"
                  placeholder="Any special requests for this item..."
                  value={itemSpecialInstructions}
                  onChange={(e) => setItemSpecialInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Selected Modifiers Summary */}
              {Object.keys(currentModifiers).length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Selected Options:</h4>
                  <div className="space-y-1">
                    {Object.entries(currentModifiers).map(([category, selection]) => (
                      <div key={category} className="text-sm">
                        <span className="font-medium">{category}:</span> {selection}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsModifierDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={addItemWithModifiers}>
                  Add to Cart - $
                  {(selectedMenuItem.price + calculateModifierPrice(selectedMenuItem.id, currentModifiers)).toFixed(2)}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
