import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { get, post, put, del } from "../../services/api"
import type { Customer, LoyaltyTransaction } from "../../types/entities"
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
interface CustomerState {
  customers: Customer[]
  selectedCustomer: Customer | null
  loyaltyTransactions: LoyaltyTransaction[]
  loading: boolean
  error: string | null
  total: number
  page: number
  limit: number
  totalPages: number
  filters: {
    loyalty_tier?: string
    min_orders?: number
    min_spent?: number
    date_joined_after?: string
    date_joined_before?: string
  }
  search: string
  sort: {
    field: string
    order: "asc" | "desc"
  }
}

// Initial state
const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  loyaltyTransactions: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  filters: {},
  search: "",
  sort: {
    field: "last_name",
    order: "asc",
  },
}

// Async thunks
export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (params: QueryParams, { rejectWithValue }) => {
    try {
      const queryString = buildQueryString(params)
      const response = await get<PaginatedResponse<Customer>>(`/customers?${queryString}`)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const fetchCustomerById = createAsyncThunk(
  "customers/fetchCustomerById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await get<Customer>(`/customers/${id}`)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customer: Omit<Customer, "id" | "created_at" | "updated_at">, { rejectWithValue }) => {
    try {
      const response = await post<Customer>("/customers", customer)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, data }: { id: string; data: Partial<Customer> }, { rejectWithValue }) => {
    try {
      const response = await put<Customer>(`/customers/${id}`, data)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const deleteCustomer = createAsyncThunk("customers/deleteCustomer", async (id: string, { rejectWithValue }) => {
  try {
    await del(`/customers/${id}`)
    return id
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const fetchLoyaltyTransactions = createAsyncThunk(
  "customers/fetchLoyaltyTransactions",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await get<LoyaltyTransaction[]>(`/customers/${customerId}/loyalty-transactions`)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const addLoyaltyPoints = createAsyncThunk(
  "customers/addLoyaltyPoints",
  async (
    {
      customerId,
      points,
      description,
    }: {
      customerId: string
      points: number
      description: string
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await post<{ customer: Customer; transaction: LoyaltyTransaction }>(
        `/customers/${customerId}/loyalty-points`,
        { points, description, type: "earned" },
      )
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

// Create the slice
const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload
      state.page = 1 // Reset to first page when search changes
    },
    setFilters: (state, action: PayloadAction<Partial<CustomerState["filters"]>>) => {
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
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null
      state.loyaltyTransactions = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchCustomers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.customers = action.payload.data
        state.total = action.payload.total
        state.page = action.payload.page
        state.limit = action.payload.limit
        state.totalPages = action.payload.totalPages
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Handle fetchCustomerById
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedCustomer = action.payload
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Handle createCustomer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.customers.push(action.payload)
        state.total += 1
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Handle updateCustomer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false
        const index = state.customers.findIndex((customer) => customer.id === action.payload.id)
        if (index !== -1) {
          state.customers[index] = action.payload
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Handle deleteCustomer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.customers = state.customers.filter((customer) => customer.id !== action.payload)
        state.total -= 1
        if (state.selectedCustomer?.id === action.payload) {
          state.selectedCustomer = null
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Handle fetchLoyaltyTransactions
      .addCase(fetchLoyaltyTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLoyaltyTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.loyaltyTransactions = action.payload
      })
      .addCase(fetchLoyaltyTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Handle addLoyaltyPoints
      .addCase(addLoyaltyPoints.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addLoyaltyPoints.fulfilled, (state, action) => {
        state.loading = false

        // Update the customer in the customers array
        const customerIndex = state.customers.findIndex((customer) => customer.id === action.payload.customer.id)
        if (customerIndex !== -1) {
          state.customers[customerIndex] = action.payload.customer
        }

        // Update the selected customer if it's the same one
        if (state.selectedCustomer?.id === action.payload.customer.id) {
          state.selectedCustomer = action.payload.customer
        }

        // Add the transaction to the loyalty transactions
        state.loyaltyTransactions.unshift(action.payload.transaction)
      })
      .addCase(addLoyaltyPoints.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// Export actions
export const { setSearch, setFilters, clearFilters, setSort, setPage, setLimit, clearSelectedCustomer } =
  customerSlice.actions

// Export selectors
export const selectCustomers = (state: RootState) => state.customers.customers
export const selectCustomerLoading = (state: RootState) => state.customers.loading
export const selectCustomerError = (state: RootState) => state.customers.error
export const selectCustomerPagination = (state: RootState) => ({
  page: state.customers.page,
  limit: state.customers.limit,
  total: state.customers.total,
  totalPages: state.customers.totalPages,
})
export const selectCustomerFilters = (state: RootState) => state.customers.filters
export const selectCustomerSearch = (state: RootState) => state.customers.search
export const selectCustomerSort = (state: RootState) => state.customers.sort
export const selectSelectedCustomer = (state: RootState) => state.customers.selectedCustomer
export const selectLoyaltyTransactions = (state: RootState) => state.customers.loyaltyTransactions

// Export reducer
export default customerSlice.reducer
