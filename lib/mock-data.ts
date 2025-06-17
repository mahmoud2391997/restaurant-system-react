import type {
  Customer,
  Employee,
  MenuItem,
  Category,
  Order,
  InventoryItem,
  Supplier,
  Branch,
  WhatsAppOrder,
  AggregatorOrder,
  Promotion,
} from "@/types/entities"

// Mock data based on the entity schema
export const mockCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "John Doe",
    phone: "+1-234-567-8901",
    email: "john.doe@email.com",
    tier: "Gold",
    loyaltyPoints: 1250,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "CUST-002",
    name: "Jane Smith",
    phone: "+1-234-567-8902",
    email: "jane.smith@email.com",
    tier: "Silver",
    loyaltyPoints: 750,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-14"),
  },
  {
    id: "CUST-003",
    name: "Mike Johnson",
    phone: "+1-234-567-8903",
    email: "mike.johnson@email.com",
    tier: "Bronze",
    loyaltyPoints: 320,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-16"),
  },
]

export const mockEmployees: Employee[] = [
  {
    id: "EMP-001",
    name: "Sarah Wilson",
    role: "Manager",
    email: "sarah.wilson@restaurant.com",
    phone: "+1-555-0101",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    salary: 55000,
    joinDate: "2023-06-01",
    biometricId: "BIO-001",
    createdAt: new Date("2023-06-01"),
  },
  {
    id: "EMP-002",
    name: "David Brown",
    role: "Chef",
    email: "david.brown@restaurant.com",
    phone: "+1-555-0102",
    shiftStart: "10:00",
    shiftEnd: "22:00",
    salary: 48000,
    joinDate: "2023-07-15",
    biometricId: "BIO-002",
    createdAt: new Date("2023-07-15"),
  },
  {
    id: "EMP-003",
    name: "Lisa Garcia",
    role: "Server",
    email: "lisa.garcia@restaurant.com",
    phone: "+1-555-0103",
    shiftStart: "11:00",
    shiftEnd: "20:00",
    salary: 32000,
    joinDate: "2023-08-01",
    biometricId: "BIO-003",
    createdAt: new Date("2023-08-01"),
  },
]
// types/entities.ts
// types/entities.ts
export interface Table {
  id: string;
  number: number;
  zone: string;
  capacity: number;  // Required property
  status: 'available' | 'occupied' | 'reserved';
}
export const mockTables: Table[] = [
  {
    id: "T-001",
    number: 1,
    zone: "Main Dining",
    capacity: 4,  // Now required
    status: "available",
  },
  {
    id: "T-002",
    number: 2,
    zone: "Main Dining",
    capacity: 6,  // Now required
    status: "available",
  },
  // ... other tables
];
export const mockCategories: Category[] = [
  { id: "CAT-001", name: "Appetizers" },
  { id: "CAT-002", name: "Pizza" },
  { id: "CAT-003", name: "Burgers" },
  { id: "CAT-004", name: "Pasta" },
  { id: "CAT-005", name: "Salads" },
  { id: "CAT-006", name: "Desserts" },
  { id: "CAT-007", name: "Beverages" },
]

export const mockMenuItems: MenuItem[] = [
  {
    id: "MENU-001",
    categoryId: "CAT-002",
    name: "Margherita Pizza",
    description: "Fresh tomatoes, mozzarella, basil",
    price: 18.99,
    imageUrl: "/placeholder.svg?height=200&width=200",
    isAvailable: true,
  },
  {
    id: "MENU-002",
    categoryId: "CAT-005",
    name: "Caesar Salad",
    description: "Romaine lettuce, parmesan, croutons, caesar dressing",
    price: 14.99,
    imageUrl: "/placeholder.svg?height=200&width=200",
    isAvailable: true,
  },
  {
    id: "MENU-003",
    categoryId: "CAT-003",
    name: "Beef Burger",
    description: "Angus beef patty, lettuce, tomato, cheese",
    price: 16.99,
    imageUrl: "/placeholder.svg?height=200&width=200",
    isAvailable: true,
  },
  {
    id: "MENU-004",
    categoryId: "CAT-004",
    name: "Pasta Carbonara",
    description: "Spaghetti, pancetta, eggs, parmesan",
    price: 19.99,
    imageUrl: "/placeholder.svg?height=200&width=200",
    isAvailable: false,
  },
]

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    tableId: "TBL-005",
    customerId: "CUST-001",
    employeeId: "EMP-003",
    orderType: "dine-in",
    status: "prepared",
    totalAmount: 45.5,
    paymentMethod: "card",
    createdAt: new Date("2024-01-16T12:30:00"),
  },
  {
    id: "ORD-002",
    customerId: "CUST-002",
    employeeId: "EMP-003",
    orderType: "delivery",
    status: "served",
    totalAmount: 32.75,
    paymentMethod: "upi",
    createdAt: new Date("2024-01-16T12:45:00"),
  },
  {
    id: "ORD-003",
    customerId: "CUST-003",
    employeeId: "EMP-003",
    orderType: "takeaway",
    status: "completed",
    totalAmount: 67.25,
    paymentMethod: "cash",
    createdAt: new Date("2024-01-16T11:15:00"),
  },
]

export const mockInventoryItems: InventoryItem[] = [
  {
    id: "INV-001",
    name: "Chicken Breast",
    unit: "kg",
    type: "raw",
    currentStock: 5,
    minimumStock: 20,
    costPerUnit: 12.5,
    locked: false,
  },
  {
    id: "INV-002",
    name: "Tomatoes",
    unit: "kg",
    type: "raw",
    currentStock: 8,
    minimumStock: 15,
    costPerUnit: 3.2,
    locked: false,
  },
  {
    id: "INV-003",
    name: "Mozzarella Cheese",
    unit: "kg",
    type: "raw",
    currentStock: 0,
    minimumStock: 10,
    costPerUnit: 8.9,
    locked: true,
  },
  {
    id: "INV-004",
    name: "Olive Oil",
    unit: "L",
    type: "raw",
    currentStock: 25,
    minimumStock: 5,
    costPerUnit: 15.0,
    locked: false,
  },
]

export const mockSuppliers: Supplier[] = [
  {
    id: "SUP-001",
    name: "Fresh Meat Co.",
    contactPerson: "John Smith",
    email: "orders@freshmeat.com",
    phone: "+1-555-0201",
    address: "123 Industrial Ave, City",
    rating: 4.8,
    totalOrders: 156,
    onTimeDelivery: 95,
    categories: ["Meat", "Poultry"],
    status: "active",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "SUP-002",
    name: "Farm Fresh Produce",
    contactPerson: "Maria Garcia",
    email: "supply@farmfresh.com",
    phone: "+1-555-0202",
    address: "456 Farm Road, Valley",
    rating: 4.6,
    totalOrders: 203,
    onTimeDelivery: 88,
    categories: ["Vegetables", "Fruits"],
    status: "active",
    createdAt: new Date("2023-02-01"),
    updatedAt: new Date("2024-01-14"),
  },
]

export const mockBranches: Branch[] = [
  {
    id: "BRANCH-001",
    name: "Main Location",
    address: "123 Main Street, Downtown",
    phone: "+1-555-0001",
    email: "main@restaurant.com",
    managerId: "EMP-001",
    isActive: true,
    openingTime: "10:00",
    closingTime: "23:00",
    timezone: "America/New_York",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "BRANCH-002",
    name: "Downtown Branch",
    address: "456 Business District, Downtown",
    phone: "+1-555-0002",
    email: "downtown@restaurant.com",
    managerId: "EMP-002",
    isActive: true,
    openingTime: "11:00",
    closingTime: "22:00",
    timezone: "America/New_York",
    createdAt: new Date("2023-06-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

export const mockWhatsAppOrders: WhatsAppOrder[] = [
  {
    id: "WA-001",
    customerPhone: "+1-234-567-8904",
    customerName: "Sarah Wilson",
    messageId: "MSG-001",
    orderStatus: "confirmed",
    items: JSON.stringify([
      { name: "Fish & Chips", quantity: 1, price: 22.99 },
      { name: "Mushy Peas", quantity: 1, price: 5.99 },
    ]),
    totalAmount: 28.98,
    deliveryAddress: "789 Pine St, Apt 2B",
    specialInstructions: "Call when arriving",
    createdAt: new Date("2024-01-16T13:00:00"),
    updatedAt: new Date("2024-01-16T13:05:00"),
  },
]

export const mockAggregatorOrders: AggregatorOrder[] = [
  {
    id: "AGG-001",
    platform: "UberEats",
    orderId: "ORD-002",
    externalOrderId: "UE-123456789",
    trackingStatus: "in_transit",
    deliveryPartner: "John Driver",
    createdAt: new Date("2024-01-16T12:45:00"),
  },
  {
    id: "AGG-002",
    platform: "Zomato",
    orderId: "ORD-004",
    externalOrderId: "ZO-987654321",
    trackingStatus: "preparing",
    createdAt: new Date("2024-01-16T13:15:00"),
  },
]

export const mockPromotions: Promotion[] = [
  {
    id: "PROMO-001",
    name: "Weekend Special",
    type: "percentage",
    value: 20,
    code: "WEEKEND20",
    description: "20% off on all orders above $50",
    startDate: new Date("2024-01-13"),
    endDate: new Date("2024-01-21"),
    isActive: true,
    usageLimit: 100,
    usageCount: 23,
    minimumOrderValue: 50,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "PROMO-002",
    name: "New Customer Discount",
    type: "fixed_amount",
    value: 10,
    code: "WELCOME10",
    description: "$10 off for new customers",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    isActive: true,
    usageLimit: 1000,
    usageCount: 156,
    minimumOrderValue: 25,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-16"),
  },
]

// Helper functions to work with mock data
export const getCustomerById = (id: string): Customer | undefined => {
  return mockCustomers.find((customer) => customer.id === id)
}

export const getEmployeeById = (id: string): Employee | undefined => {
  return mockEmployees.find((employee) => employee.id === id)
}

export const getMenuItemById = (id: string): MenuItem | undefined => {
  return mockMenuItems.find((item) => item.id === id)
}

export const getCategoryById = (id: string): Category | undefined => {
  return mockCategories.find((category) => category.id === id)
}

export const getOrdersByCustomer = (customerId: string): Order[] => {
  return mockOrders.filter((order) => order.customerId === customerId)
}

export const getInventoryItemById = (id: string): InventoryItem | undefined => {
  return mockInventoryItems.find((item) => item.id === id)
}

export const getLowStockItems = (): InventoryItem[] => {
  return mockInventoryItems.filter((item) => item.currentStock <= item.minimumStock)
}

export const getActivePromotions = (): Promotion[] => {
  const now = new Date()
  return mockPromotions.filter((promo) => promo.isActive && promo.startDate <= now && promo.endDate >= now)
}
