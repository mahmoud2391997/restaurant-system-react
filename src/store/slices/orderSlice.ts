import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { get, post, put, del } from "../../services/api"
import type { Order } from "../../types/entities"
import { type QueryParams, buildQueryString } from "../../utils/queryUtils"
import type { RootState } from "../index"

// Define the response type for paginated data
interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Define the state type
interface OrderState {
  orders: Order[]
  selectedOrder: Order | null
  loading: boolean
  error: string | null
  total: number
  page: number
  limit: number
  totalPages: number
  filters: {
    status?: string
    order_type?: string
    payment_status?: string
    date_from?: string
    date_to?: string
    customer_id?: string
  }
  search: string
  sort: {
    field: string
    order: "asc" | "desc"
  }
}

// Initial state
const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  filters: {},
  search: "",
  sort: {
    field: "created_at",
    order: "desc",
  },
}

// Async thunks
export const fetchOrders = createAsyncThunk("orders/fetchOrders", async (params: QueryParams, { rejectWithValue }) => {
  try {
    const queryString = buildQueryString(params)
    const response = await get<PaginatedResponse<Order>>(`/orders?${queryString}`)
    return response
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const fetchOrderById = createAsyncThunk("orders/fetchOrderById", async (id: string, { rejectWithValue }) => {
  try {
    const response = await get<Order>(`/orders/${id}`)
    return response
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (order: Omit<Order, "id" | "created_at" | "updated_at">, { rejectWithValue }) => {
    try {
      const response = await post<Order>("/orders", order)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ id, data }: { id: string; data: Partial<Order> }, { rejectWithValue }) => {
    try {
      const response = await put<Order>(`/orders/${id}`, data)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const deleteOrder = createAsyncThunk("orders/deleteOrder", async (id: string, { rejectWithValue }) => {
  try {
    await del(`/orders/${id}`)
    return id
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

// Create the slice
const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload
      state.page = 1 // Reset to first page when search changes
    },
    setFilters: (state, action: PayloadAction<Partial<OrderState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.page = 1 // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {}
      state.page = 1
    },
    setSort: (state, action: PayloadAction<{ field: string; order: "asc" | "desc" }>) => {
      state.sort = action.payload
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload
      state.page = 1 // Reset to first page when limit changes
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchOrders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload.data
        state.total = action.payload.total
        state.page = action.payload.page
        state.limit = action.payload.limit
        state.totalPages = action.payload.totalPages
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Handle fetchOrderById
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedOrder = action.payload
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Handle createOrder
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.orders.unshift(action.payload) // Add to beginning of array
        state.total += 1
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Handle updateOrder
      .addCase(updateOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false
        const index = state.orders.findIndex((order) => order.id === action.payload.id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Handle deleteOrder
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false
        state.orders = state.orders.filter((order) => order.id !== action.payload)
        state.total -= 1
        if (state.selectedOrder?.id === action.payload) {
          state.selectedOrder = null
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// Export actions
export const { setSearch, setFilters, clearFilters, setSort, setPage, setLimit, clearSelectedOrder } =
  orderSlice.actions

// Export selectors
export const selectOrders = (state: RootState) => state.orders.orders
export const selectOrderLoading = (state: RootState) => state.orders.loading
export const selectOrderError = (state: RootState) => state.orders.error
export const selectOrderPagination = (state: RootState) => ({
  page: state.orders.page,
  limit: state.orders.limit,
  total: state.orders.total,
  totalPages: state.orders.totalPages,
})
export const selectOrderFilters = (state: RootState) => state.orders.filters
export const selectOrderSearch = (state: RootState) => state.orders.search
export const selectOrderSort = (state: RootState) => state.orders.sort
export const selectSelectedOrder = (state: RootState) => state.orders.selectedOrder

// Export reducer
export default orderSlice.reducer
