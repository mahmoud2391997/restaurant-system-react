// Core Entity Types for Restaurant Operating System
export interface Restaurant {
  id: string
  name: string
  address: string
  phone: string
  email: string
  website?: string
  cuisine_type: string
  operating_hours: OperatingHours
  tax_rate: number
  currency: string
  timezone: string
  created_at: Date
  updated_at: Date
}
// types/inventory.ts
type MovementType = 'in' | 'out' ;
export interface StockMovementPayload {
  inventory_item_id: string;
  quantity: number;
  movement_type: MovementType;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
}



export interface DashboardProps {
  items: InventoryItem[];
}

export interface InventoryFilterBarProps {
  search: string;
  filters: {
    type?: string;
    category?: string;
    lowStock?: boolean;
  };
  onSearchChange: (value: string) => void;
  onFilterChange: (filters: {
    type?: string;
    category?: string;
    lowStock?: boolean;
  }) => void;
}
export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  tableId: string;
  partySize: number;
  reservationDate: Date;
  reservationTime: string;
  status: "confirmed" | "seated" | "completed" | "cancelled" | "no-show";
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface CartItem {
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
export interface OperatingHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export interface DayHours {
  open: string // HH:MM format
  close: string // HH:MM format
  is_closed: boolean
}

// Menu Management
export interface MenuCategory {
  _id: string;
  id: string;
  name: string;
  description?: string;
}
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
export interface Table {
  id: string
  number: number
  zone: string
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}
export interface  MenuItem {
  _id:string
  id: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  category_id: string;
  available: boolean;
  popularity: number;
  profit: number;
  prep_time?: number;
  allergens?: string[];
};
export interface MenuModifier {
  id: string
  menu_item_ids: string[]
  type:"single" | "multiple"
  name: string
  price_adjustment: number
  is_required: boolean
  max_selections: number
  options: ModifierOption[]
}

export interface ModifierOption {
  id: string
  modifier_id: string
  name: string
  price_adjustment: number
  is_available: boolean
}
export interface KitchenOrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  modifiers?: Record<string, string>
  specialInstructions?: string
  status: "pending" | "preparing" | "ready" | "served"
  estimatedTime?: number
  actualTime?: number
  startTime?: Date | string
  completionTime?: Date | string
  station: KitchenStationType
}

// Kitchen Order
export interface KitchenOrder {
    id:string, // or generate some unique ID
  orderNumber: string
  tableNumber?: number
  customerName?: string
  orderType: "dine-in" | "delivery" | "takeaway"
  items: KitchenOrderItem[]
  priority: "low" | "normal" | "high" | "urgent"
  status: "new" | "acknowledged" | "preparing" | "ready" | "served" | "delayed"
  orderTime?: Date | string
  estimatedCompletionTime?: Date | string
  actualCompletionTime?: Date | string
  totalEstimatedTime?: number
  elapsedTime?: number
  isRushed?: boolean
  specialNotes?: string
  allergens?: string[]
  paid:boolean
}

// Kitchen Station
export type KitchenStationType = "grill" | "fryer" | "salad" | "dessert" | "beverage" | "main"

export interface KitchenStation {
  id: string
  name: string
  type: KitchenStationType
  activeOrders: number
  averageTime: number
  status: "active" | "busy" | "offline"
}

// Order Management
export interface Order {
  id: string
  restaurant_id: string
  customer_id?: string
  order_number: string
  order_type: "dine-in" | "takeaway" | "delivery" | "online"
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled"
  tableId?: string
  subtotal: number
  employeeId:string
  tax_amount: number
  tip_amount: number
  discount_amount: number
  discountCode?:string
  total_amount: number
  payment_status: "pending" | "paid" | "refunded"
  payment_method: "cash" | "card" | "online"
  special_instructions?: string
  estimated_ready_time?: Date
  created_at: Date
  updated_at: Date
  items: Omit<OrderItem, 'id' | 'order_id'>[];
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  total_price: number
  special_instructions?: string
  modifiers: OrderItemModifier[]
}

export interface OrderItemModifier {
  id: string
  order_item_id: string
  modifier_option_id: string
  quantity: number
  unit_price: number
}

// Customer Management
export interface Customer {
  id: string
  restaurant_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  date_of_birth?: Date
  address?: CustomerAddress
  loyalty_points: number
  total_orders: number
  total_spent: number
  last_orderDate?: Date
  preferences: CustomerPreferences
  created_at: Date
  updated_at: Date
}

export interface CustomerAddress {
  street: string
  city: string
  state: string
  zip_code: string
  country: string
}

export interface CustomerPreferences {
  dietary_restrictions: string[]
  favorite_items: string[]
  communication_preferences: {
    email: boolean
    sms: boolean
    push_notifications: boolean
  }
}

export interface LoyaltyProgram {
  id: string
  restaurant_id: string
  name: string
  points_per_dollar: number
  redemption_rate: number // points needed per dollar discount
  tier_benefits: LoyaltyTier[]
  is_active: boolean
}

export interface LoyaltyTier {
  name: string
  min_points: number
  benefits: string[]
  discount_percentage: number
}
// types.ts
export interface InventoryItem {
  id: string
  name: string
  unit: string
  type: "raw" | "finished" | "packaging" | "other" | "semi-finished"; // ✅ fixed
  createdBy:string
  currentStock: number
  minimumStock: number
  costPerUnit: number
  locked: boolean
  category?: string
  supplier?: string
  lastUpdated?: string
}
export interface StockAdjustment {
  id: string;
  itemId: string;
  change: "increment" | "decrement"
  adjustmentType: "manual" | "physical_count" | "variance";
  quantity: number;
  createdAt: Date; // <-- change to snake_case
  notes?: string;}
 
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  menuItemId: string;
  ingredients: {
    inventoryItemId: string;
    quantity: number;
    unit: string;
  }[];
}
export interface StockMovement {
  id: string
  createdBy:string
  inventory_item_id: string
  movement_type:"in" | "out" | "transfer" | "waste" | "production";
  quantity: number
  reference_type?: string
  reference_id?: string
  notes?: string
  created_at: Date
}


export interface Supplier {
  _id: string
  restaurant_id: string
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  payment_terms: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}
export // In your types/entities.ts
interface PurchaseOrder {
  id: string;
  supplier_name:string;
  supplierId: string;
  orderDate: string;
  status: 'pending' | 'received' | 'cancelled';
  createdBy: string;
  created_at: string;
  updated_at: string; // This is the required field
  items: {
    item_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
  total_amount: number;
}
export interface InventoryLog {
  id: string;
  action: "create" | "update" | "delete" | "adjustment" | "movement";
  item_id: string;
  item_name: string;
  quantity_changed: number;
  previous_quantity: number;
  new_quantity: number;
  user: string;
  timestamp: string; // ISO string
  reason?: string;
}

// Staff Management
export interface Employee {
  id: string
  restaurant_id: string
  employee_number: string
  first_name: string
  last_name: string
  email: string
  phone: string
  position: string
  department: string
  hire_date: Date
  hourly_rate: number
  is_active: boolean
  permissions: EmployeePermissions
  created_at: Date
  updated_at: Date
}

export interface EmployeePermissions {
  pos_access: boolean
  inventory_access: boolean
  reports_access: boolean
  admin_access: boolean
  can_process_refunds: boolean
  can_modify_orders: boolean
}

export interface Shift {
  id: string
  employee_id: string
  start_time: Date
  end_time?: Date
  break_duration: number // in minutes
  hourly_rate: number
  total_hours?: number
  total_pay?: number
  notes?: string
}

export interface Schedule {
  id: string
  restaurant_id: string
  employee_id: string
  date: Date
  start_time: string
  end_time: string
  position: string
  is_confirmed: boolean
  created_at: Date
  updated_at: Date
}
// types/entities.ts
export type SortDirection = 'asc' | 'desc';

export type SortParams = {
  field: string;
  order: SortDirection;
};
// src/types/entities.ts
export type QueryParams = {
  page: number;           // Required
  limit: number;          // Required
  search?: string;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  filters?: {
    category?: string;
    minimum_stock?: boolean;
    supplierId?: string;
  };
};
// Financial Management
export interface Transaction {
  id: string
  restaurant_id: string
  order_id?: string
  type: "sale" | "refund" | "expense" | "adjustment"
  amount: number
  payment_method: string
  description: string
  category: string
  createdBy: string
  created_at: Date
}

export interface Expense {
  id: string
  restaurant_id: string
  category: string
  description: string
  amount: number
  date: Date
  receipt_url?: string
  is_recurring: boolean
  createdBy: string
  created_at: Date
}

// Aggregator Integration
export interface AggregatorIntegration {
  id: string
  restaurant_id: string
  platform: "ubereats" | "doordash" | "grubhub" | "postmates" | "zomato" | "swiggy"
  is_active: boolean
  api_credentials: Record<string, string>
  commission_rate: number
  menu_sync_enabled: boolean
  order_sync_enabled: boolean
  last_sync: Date
  created_at: Date
  updated_at: Date
}

export interface AggregatorOrder {
  id: string
  restaurant_id: string
  aggregator_id: string
  external_order_id: string
  platform: string
  customer_info: {
    name: string
    phone?: string
    address?: string
  }
  items: AggregatorOrderItem[]
  subtotal: number
  delivery_fee: number
  commission_fee: number
  total_amount: number
  status: string
  estimated_delivery_time?: Date
  created_at: Date
}

export interface AggregatorOrderItem {
  external_item_id: string
  name: string
  quantity: number
  unit_price: number
  modifiers?: string[]
  special_instructions?: string
}

// Analytics and Reporting
export interface SalesReport {
  id: string
  restaurant_id: string
  report_type: "daily" | "weekly" | "monthly" | "yearly"
  start_date: Date
  end_date: Date
  total_sales: number
  total_orders: number
  average_order_value: number
  top_selling_items: TopSellingItem[]
  sales_by_hour: HourlySales[]
  payment_method_breakdown: PaymentMethodSales[]
  generated_at: Date
}

export interface TopSellingItem {
  menu_item_id: string
  name: string
  quantity_sold: number
  revenue: number
}

export interface HourlySales {
  hour: number
  sales: number
  orders: number
}

export interface PaymentMethodSales {
  method: string
  amount: number
  percentage: number
}

// System Configuration
export interface SystemSettings {
  id: string
  restaurant_id: string
  pos_settings: POSSettings
  notification_settings: NotificationSettings
  integration_settings: IntegrationSettings
  updated_at: Date
}

export interface POSSettings {
  auto_print_receipts: boolean
  require_customer_info: boolean
  enable_tips: boolean
  default_tip_percentages: number[]
  tax_inclusive_pricing: boolean
}

export interface NotificationSettings {
  low_stock_alerts: boolean
  new_order_notifications: boolean
  daily_report_email: boolean
  notification_email: string
}

export interface IntegrationSettings {
  accounting_software?: string
  email_service?: string
  sms_service?: string
  payment_processor?: string
}
