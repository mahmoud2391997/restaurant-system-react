// TypeScript Entity Schema for Restaurant Operating System (ROS)
// Using basic class and interface structures, ORM-ready (e.g., for TypeORM, Prisma)

// ===================== CUSTOMER & CRM =====================
export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  tier: "Bronze" | "Silver" | "Gold"
  loyaltyPoints: number
  createdAt: Date
  updatedAt: Date
}

export interface CustomerFeedback {
  id: string
  customerId: string
  orderId: string
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
  sentiment?: string
  createdAt: Date
}

// ===================== MENU =====================
export interface Category {
  id: string
  name: string
  parentId?: string
}



export interface Modifier {
  id: string
  name: string
  type: "single" | "multiple"
}

export interface ItemModifier {
  id: string
  menuItemId: string
  modifierId: string
  extraPrice: number
}
export interface StockMovementPayload {
  inventory_item_id: string
  quantity: number
  movement_type: "in" | "out" | "transfer" | "waste" | "production";
  reference_type?: string
  reference_id?: string
  notes?: string
  location_from?: string
  location_to?: string
}
// ===================== INVENTORY =====================
export interface InventoryItem {
  id: string
  name: string
  unit: string
  type: "raw" | "semi-finished" | "finished"
  currentStock: number
  minimumStock: number
  costPerUnit: number
  locked: boolean
}

export interface StockAdjustment {
  id: string
  itemId: string
  adjustmentType: "manual" | "physical_count" | "variance"
  quantity: number
  createdAt: Date
}

export interface Recipe {
  id: string
  menuItemId: string
  ingredientId: string
  quantity: number
}

// ===================== EMPLOYEES & HR =====================
export interface Employee {
  id: string
  name: string
  role: string
  email: string
  phone: string
  shiftStart: string // HH:mm format
  shiftEnd: string
  salary: number
  joinDate: string
  biometricId?: string
  createdAt: Date
}
export interface Transaction {
  id: string;
  restaurant_id: string;
  order_id?: string;
  type: "sale" | "refund" | "expense" | "adjustment";
  amount: number;
  payment_method: string;
  description: string;
  category: string;
  createdBy: string;
  created_at?: Date;
}

export interface Attendance {
  id: string
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  method: "QR" | "biometric" | "manual"
}
export interface Reservation {
  id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  tableId: string
  partySize: number
  reservationDate: Date
  reservationTime: string
  status: "confirmed" | "seated" | "completed" | "cancelled" | "no-show"
  specialRequests?: string
  createdAt: Date
  updatedAt: Date
}
// ===================== POS / ORDERS =====================
export interface Table {
  id: string
  number: number
  zone: string
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

export interface Order {
  id: string
  tableId?: string
  customerId?: string
  employeeId: string
  orderType: "dine-in" | "delivery" | "takeaway"
  status: "placed" | "prepared" | "served" | "completed" | "cancelled"
  totalAmount: number
  discountCode?: string
  paymentMethod: string
  createdAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  quantity: number
  price: number
  modifiers?: Record<string, string> // key = modifier group, value = selected option
}

// ===================== AGGREGATORS =====================
export interface AggregatorOrder {
  id: string
  platform: "Zomato" | "Swiggy" | "UberEats"
  orderId: string
  externalOrderId: string
  trackingStatus: string
  deliveryPartner?: string
  createdAt: Date
}

// ===================== FINANCE =====================
export interface Expense {
  id: string
  category: string
  amount: number
  branch: string
  tags: string[]
  transactionDate: string
  createdBy: string
}

export interface Reconciliation {
  id: string
  bankName: string
  statementDate: string
  matchedAmount: number
  remarks?: string
}

// ===================== PERMISSIONS & ROLES =====================
export interface Role {
  id: string
  name: string
}

export interface Permission {
  id: string
  roleId: string
  moduleName: string
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
}

export interface UserRole {
  id: string
  employeeId: string
  roleId: string
}

// ===================== ADDITIONAL TYPES FOR SYSTEM =====================

// Supplier Management
export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  rating: number
  totalOrders: number
  onTimeDelivery: number
  categories: string[]
  status: "active" | "inactive" | "pending"
  createdAt: Date
  updatedAt: Date
}

// Purchase Orders
export interface PurchaseOrder {
  id: string
  supplierId: string
  status: "draft" | "sent" | "confirmed" | "in-transit" | "delivered" | "cancelled"
  orderDate: Date
  expectedDelivery: Date
  actualDelivery?: Date
  totalAmount: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface PurchaseOrderItem {
  id: string
  purchaseOrderId: string
  inventoryItemId: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

// WhatsApp Integration
export interface WhatsAppOrder {
  id: string
  customerPhone: string
  customerName?: string
  messageId: string
  orderStatus: "received" | "confirmed" | "preparing" | "ready" | "delivered"
  items: string // JSON string of ordered items
  totalAmount: number
  deliveryAddress?: string
  specialInstructions?: string
  createdAt: Date
  updatedAt: Date
}

// Loyalty Program
export interface LoyaltyTransaction {
  id: string
  customerId: string
  orderId?: string
  type: "earned" | "redeemed" | "expired"
  points: number
  description: string
  createdAt: Date
}

// Menu Engineering
export interface MenuAnalytics {
  id: string
  menuItemId: string
  period: string // YYYY-MM format
  salesCount: number
  revenue: number
  profitMargin: number
  popularity: number
  classification: "star" | "plow-horse" | "puzzle" | "dog"
  recommendation: string
  createdAt: Date
}

// Branch Management
export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  email: string
  managerId: string
  isActive: boolean
  openingTime: string
  closingTime: string
  timezone: string
  createdAt: Date
  updatedAt: Date
}

// Notifications
export interface Notification {
  id: string
  type: "order" | "inventory" | "system" | "promotion"
  title: string
  message: string
  priority: "low" | "medium" | "high" | "critical"
  isRead: boolean
  recipientId: string
  createdAt: Date
}

// System Configuration
export interface SystemConfig {
  id: string
  key: string
  value: string
  description?: string
  category: string
  updatedBy: string
  updatedAt: Date
}

// Audit Trail
export interface AuditLog {
  id: string
  entityType: string
  entityId: string
  action: "create" | "update" | "delete"
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  userId: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

// Payment Processing
export interface Payment {
  id: string
  orderId: string
  amount: number
  method: "cash" | "card" | "upi" | "wallet" | "bank_transfer"
  status: "pending" | "completed" | "failed" | "refunded"
  transactionId?: string
  gatewayResponse?: Record<string, any>
  processedAt?: Date
  createdAt: Date
}

// Promotions & Discounts
export interface Promotion {
  id: string
  name: string
  type: "percentage" | "fixed_amount" | "buy_x_get_y"
  value: number
  code?: string
  description?: string
  startDate: Date
  endDate: Date
  isActive: boolean
  usageLimit?: number
  usageCount: number
  applicableItems?: string[] // menu item IDs
  minimumOrderValue?: number
  createdAt: Date
  updatedAt: Date
}

// Kitchen Display System
export interface KitchenOrder {
  id: string
  orderId: string
  stationId: string
  items: string // JSON string of items for this station
  status: "pending" | "in-progress" | "completed"
  priority: number
  estimatedTime: number // in minutes
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
}

export interface KitchenStation {
  id: string
  name: string
  type: "grill" | "fryer" | "salad" | "dessert" | "beverage"
  isActive: boolean
  maxCapacity: number
  currentLoad: number
}

// Delivery Management
export interface DeliveryPartner {
  id: string
  name: string
  phone: string
  vehicleType: "bike" | "car" | "bicycle"
  vehicleNumber: string
  isAvailable: boolean
  currentLocation?: string
  rating: number
  totalDeliveries: number
  createdAt: Date
}

export interface Delivery {
  id: string
  orderId: string
  partnerId?: string
  customerAddress: string
  customerPhone: string
  status: "assigned" | "picked_up" | "in_transit" | "delivered" | "failed"
  estimatedTime: number
  actualTime?: number
  deliveryFee: number
  tips?: number
  assignedAt?: Date
  pickedUpAt?: Date
  deliveredAt?: Date
  createdAt: Date
}
