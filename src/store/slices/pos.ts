// src/features/pos/posSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { get, post, patch } from "../../services/api";
import type {
  MenuItem,
  MenuCategory as Category,
  Table,
  Customer,
  KitchenOrder,
  KitchenOrderItem,
  ModifierOption,
  MenuModifier as  ItemModifiers,
} from "@/types/entities";
import { RootState } from "../index";
import { createSelector } from "@reduxjs/toolkit";

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers?: Record<string, string>;
  specialInstructions?: string;
  station: "grill" | "fryer" | "salad" | "dessert" | "beverage" | "main";
  estimatedTime: number;
}

interface Transaction {
  id: string;
  orderId: string;
  orderNumber: string;
  tableNumber?: number;
  customerName?: string;
  orderType: "dine-in" | "delivery" | "takeaway";
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: "pending" | "paid" | "refunded";
  createdAt: string;
  paidAt?: string;
}

interface PosState {
  menuItems: MenuItem[];
  categories: Category[];
  tables: Table[];
  customers: Customer[];
  modifiers: Record<string, ItemModifiers>;
  kitchenOrders: KitchenOrder[];
  transactions: Transaction[];
  cart: CartItem[];
  selectedTable: Table | null;
  selectedCustomer: Customer | null;
  orderType: "dine-in" | "delivery" | "takeaway";
  searchTerm: string;
  selectedCategory: string;
  specialInstructions: string;
  kitchenStatusFilter: string;
  kitchenStationFilter: string;
  paymentDiscountAmount: number;
  paymentDiscountType: "percentage" | "fixed";
  splitPayment: boolean;
  splitAmounts: { method: string; amount: number }[];
  selectedOrderForPayment: KitchenOrder | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PosState = {
  menuItems: [],
  categories: [],
  tables: [],
  customers: [],
  modifiers: {},
  kitchenOrders: [],
  transactions: [],
  cart: [],
  selectedTable: null,
  selectedCustomer: null,
  orderType: "dine-in",
  searchTerm: "",
  selectedCategory: "All",
  specialInstructions: "",
  kitchenStatusFilter: "active",
  kitchenStationFilter: "all",
  paymentDiscountAmount: 0,
  paymentDiscountType: "percentage",
  splitPayment: false,
  splitAmounts: [],
  selectedOrderForPayment: null,
  status: "idle",
  error: null,
};

export const fetchMenuItems = createAsyncThunk("pos/fetchMenuItems", async () => {
  const response = await get<MenuItem[]>("/menu/items");
  return response;
});

export const fetchCategories = createAsyncThunk("pos/fetchCategories", async () => {
  const response = await get<Category[]>("/categories");
  return response;
});

export const fetchTables = createAsyncThunk("pos/fetchTables", async () => {
  const response = await get<Table[]>("/tables");
  return response;
});

export const fetchCustomers = createAsyncThunk("pos/fetchCustomers", async () => {
  const response = await get<Customer[]>("/customers");
  return response;
});

export const fetchModifiers = createAsyncThunk("pos/fetchModifiers", async () => {
  const response = await get<Record<string, ItemModifiers>>("/modifiers");
  return response;
});

export const fetchKitchenOrders = createAsyncThunk("pos/fetchKitchenOrders", async () => {
  const response = await get<KitchenOrder[]>("/kitchen-orders");
  return response;
});

export const fetchUnpaidOrders = createAsyncThunk("pos/fetchUnpaidOrders", async () => {
  const response = await get<KitchenOrder[]>("/kitchen-orders/unpaid");
  return response;
});

export const fetchTransactions = createAsyncThunk("pos/fetchTransactions", async () => {
  const response = await get<Transaction[]>("/transactions");
  return response;
});

export const createKitchenOrder = createAsyncThunk(
  "pos/createKitchenOrder",
  async (orderData: Omit<KitchenOrder, "id">) => {
    const response = await post<KitchenOrder>("/kitchen-orders", orderData);
    return response;
  }
);

export const updateKitchenOrderItemState = createAsyncThunk(
  "pos/updateKitchenOrderItemState",
  async ({ orderId, itemId, status }: { orderId: string; itemId: string; status: KitchenOrderItem["status"] }) => {
    const response = await patch<KitchenOrderItem>(
      `/kitchen-orders/${orderId}/menu/items/${itemId}`,
      { status }
    );
    return { orderId, itemId, status, updatedItem: response };
  }
);

export const createTransaction = createAsyncThunk(
  "pos/createTransaction",
  async (transactionData: Omit<Transaction, "id">) => {
    const response = await post<Transaction>("/transactions", transactionData);
    return response;
  }
);

const posSlice = createSlice({
  name: "pos",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.cart.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cart.push(action.payload);
      }
    },
    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; change: number }>) => {
      const { id, change } = action.payload;
      const item = state.cart.find((item) => item.id === id);
      if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
          state.cart = state.cart.filter((item) => item.id !== id);
        }
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.cart = [];
    },
    setSelectedTable: (state, action: PayloadAction<Table | null>) => {
      state.selectedTable = action.payload;
    },
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    setOrderType: (state, action: PayloadAction<"dine-in" | "delivery" | "takeaway">) => {
      state.orderType = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSpecialInstructions: (state, action: PayloadAction<string>) => {
      state.specialInstructions = action.payload;
    },
    setKitchenStatusFilter: (state, action: PayloadAction<string>) => {
      state.kitchenStatusFilter = action.payload;
    },
    setKitchenStationFilter: (state, action: PayloadAction<string>) => {
      state.kitchenStationFilter = action.payload;
    },
    setPaymentDiscountAmount: (state, action: PayloadAction<number>) => {
      state.paymentDiscountAmount = action.payload;
    },
    setPaymentDiscountType: (state, action: PayloadAction<"percentage" | "fixed">) => {
      state.paymentDiscountType = action.payload;
    },
    setSplitPayment: (state, action: PayloadAction<boolean>) => {
      state.splitPayment = action.payload;
    },
    setSplitAmounts: (state, action: PayloadAction<{ method: string; amount: number }[]>) => {
      state.splitAmounts = action.payload;
    },
    setSelectedOrderForPayment: (state, action: PayloadAction<KitchenOrder | null>) => {
      state.selectedOrderForPayment = action.payload;
    },
    updateElapsedTimes: (state) => {
      state.kitchenOrders = state.kitchenOrders.map((order) => ({
        ...order,
        elapsedTime: order.orderTime
          ? Math.floor((Date.now() - new Date(order.orderTime).getTime()) / (1000 * 60))
          : 0,
      }));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.menuItems = action.payload;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch menu items";
      })
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch categories";
      })
      .addCase(fetchTables.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tables = action.payload;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch tables";
      })
      .addCase(fetchCustomers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch customers";
      })
      .addCase(fetchModifiers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchModifiers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.modifiers = action.payload;
      })
      .addCase(fetchModifiers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch modifiers";
      })
      .addCase(fetchKitchenOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchKitchenOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.kitchenOrders = action.payload.map((order) => ({
          ...order,
          elapsedTime: order.orderTime
            ? Math.floor((Date.now() - new Date(order.orderTime).getTime()) / (1000 * 60))
            : 0,
        }));
      })
      .addCase(fetchKitchenOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch kitchen orders";
      })
      .addCase(fetchUnpaidOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUnpaidOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.kitchenOrders = state.kitchenOrders.map(
          (order) => action.payload.find((o) => o.id === order.id) || order
        );
      })
      .addCase(fetchUnpaidOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch unpaid orders";
      })
      .addCase(fetchTransactions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch transactions";
      })
      .addCase(createKitchenOrder.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createKitchenOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.kitchenOrders.push({
          ...action.payload,
          elapsedTime: 0,
        });
        state.cart = [];
        state.selectedTable = null;
        state.selectedCustomer = null;
        state.specialInstructions = "";
      })
      .addCase(createKitchenOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to create kitchen order";
      })
      .addCase(updateKitchenOrderItemState.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateKitchenOrderItemState.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { orderId, itemId, status, updatedItem } = action.payload;
        const orderIndex = state.kitchenOrders.findIndex((order) => order.id === orderId);
        if (orderIndex !== -1) {
          const itemIndex = state.kitchenOrders[orderIndex].items.findIndex((item) => item.id === itemId);
          if (itemIndex !== -1) {
            state.kitchenOrders[orderIndex].items[itemIndex] = {
              ...state.kitchenOrders[orderIndex].items[itemIndex],
              status,
              ...(status === "preparing" && !state.kitchenOrders[orderIndex].items[itemIndex].startTime
                ? { startTime: new Date().toISOString() }
                : {}),
              ...(status === "ready" ? { completionTime: new Date().toISOString() } : {}),
            };

            const allItemsReady = state.kitchenOrders[orderIndex].items.every(
              (item) => item.status === "ready"
            );
            const hasPreparingItems = state.kitchenOrders[orderIndex].items.some(
              (item) => item.status === "preparing"
            );

            if (allItemsReady && state.kitchenOrders[orderIndex].status !== "ready") {
              state.kitchenOrders[orderIndex].status = "ready";
              state.kitchenOrders[orderIndex].actualCompletionTime = new Date().toISOString();
            } else if (hasPreparingItems && state.kitchenOrders[orderIndex].status === "new") {
              state.kitchenOrders[orderIndex].status = "preparing";
            }
          }
        }
      })
      .addCase(updateKitchenOrderItemState.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to update kitchen order item state";
      })
      .addCase(createTransaction.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.transactions.push(action.payload);
        const orderIndex = state.kitchenOrders.findIndex(
          (order) => order.orderNumber === action.payload.orderNumber
        );
        if (orderIndex !== -1) {
          state.kitchenOrders[orderIndex].status = "served";
        }
        state.selectedOrderForPayment = null;
        state.paymentDiscountAmount = 0;
        state.splitPayment = false;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to create transaction";
      });
  },
});

export const {
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  setSelectedTable,
  setSelectedCustomer,
  setOrderType,
  setSearchTerm,
  setSelectedCategory,
  setSpecialInstructions,
  setKitchenStatusFilter,
  setKitchenStationFilter,
  setPaymentDiscountAmount,
  setPaymentDiscountType,
  setSplitPayment,
  setSplitAmounts,
  setSelectedOrderForPayment,
  updateElapsedTimes,
} = posSlice.actions;
export const selectMenuItems = (state: { pos: PosState }) => state.pos.menuItems;
export const selectCategories = (state: { pos: PosState }) => state.pos.categories;
export const selectTables = (state: { pos: PosState }) => state.pos.tables;
export const selectCustomers = (state: { pos: PosState }) => state.pos.customers;
export const selectModifiers = (state: { pos: PosState }) => state.pos.modifiers;
export const selectKitchenOrders = (state: { pos: PosState }) => state.pos.kitchenOrders;
export const selectTransactions = (state: { pos: PosState }) => state.pos.transactions;
export const selectCart = (state: { pos: PosState }) => state.pos.cart;
export const selectSelectedTable = (state: { pos: PosState }) => state.pos.selectedTable;
export const selectSelectedCustomer = (state: { pos: PosState }) => state.pos.selectedCustomer;
export const selectOrderType = (state: { pos: PosState }) => state.pos.orderType;
export const selectSearchTerm = (state: { pos: PosState }) => state.pos.searchTerm;
export const selectSelectedCategory = (state: { pos: PosState }) => state.pos.selectedCategory;
export const selectSpecialInstructions = (state: { pos: PosState }) => state.pos.specialInstructions;
export const selectKitchenStatusFilter = (state: { pos: PosState }) => state.pos.kitchenStatusFilter;
export const selectKitchenStationFilter = (state: { pos: PosState }) => state.pos.kitchenStationFilter;
export const selectPaymentDiscountAmount = (state: { pos: PosState }) => state.pos.paymentDiscountAmount;
export const selectPaymentDiscountType = (state: { pos: PosState }) => state.pos.paymentDiscountType;
export const selectSplitPayment = (state: { pos: PosState }) => state.pos.splitPayment;
export const selectSplitAmounts = (state: { pos: PosState }) => state.pos.splitAmounts;
export const selectSelectedOrderForPayment = (state: { pos: PosState }) =>
  state.pos.selectedOrderForPayment;
export const selectStatus = (state: { pos: PosState }) => state.pos.status;
export const selectError = (state: { pos: PosState }) => state.pos.error;

// Derived selectors
export const selectFilteredMenuItems = (state: { pos: PosState }) => {
  const { menuItems, searchTerm, selectedCategory, categories } = state.pos;
  return menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || categories.find((cat) => cat.id === item.category_id)?.name === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });
};

const selectPosState = (state: RootState) => state.pos;

export const selectFilteredKitchenOrders = createSelector(
  [selectPosState],
  (pos) => {
    const { kitchenOrders, kitchenStatusFilter, kitchenStationFilter } = pos;

    return kitchenOrders.filter((order) => {
      const matchesStatus = kitchenStatusFilter === "all" || order.status === kitchenStatusFilter;
      const matchesStation =
        kitchenStationFilter === "all" ||
        order.items.some((item) => item.station === kitchenStationFilter);

      return matchesStatus && matchesStation;
    });
  }
);

// 2. Select cart subtotal
export const selectCartSubtotal = createSelector(
  [selectCart],
  (cart) => cart.reduce((total, item) => total + item.price * item.quantity, 0)
);

// 3. Select orders ready for payment (e.g., unpaid but completed kitchen orders)
export const selectReadyForPaymentOrders = createSelector(
  [selectKitchenOrders],
  (orders) => orders.filter((order) => order.status === "served" && !order.paid)
);

export default posSlice.reducer;