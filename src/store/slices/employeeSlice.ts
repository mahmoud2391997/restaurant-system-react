import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { get, post, put, del } from "../../services/api"

// Types from your uploaded file
import {
  InventoryItem,
  StockAdjustment,
  Recipe,
  StockMovement,
  QueryParams,
} from "../../types/entities"
import { RootState } from ".."

interface InventoryState {
  items: InventoryItem[]
  selectedItemId: string | null
  stockMovements: StockMovement[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: Partial<{
    minimum_stock: boolean
    type: "raw" | "semi-finished"  | "finished"
    [key: string]: any
  }>
  search: string
  sort: {
    field: string
    order: "asc" | "desc"
  }
}

const initialState: InventoryState = {
  items: [],
  selectedItemId: null,
  stockMovements: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  filters: {},
  search: "",
  sort: {
    field: "name",
    order: "asc",
  },
}

// Async Thunks

export const fetchInventoryItems = createAsyncThunk(
  "inventory/fetchInventoryItems",
  async (params: QueryParams, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams({
        ...params,
        ...(params.filters || {}),
      }).toString()
      const response = await get<{ data: InventoryItem[]; total: number; page: number; limit: number }>(
        `/inventory?${queryString}`
      )
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const fetchInventoryItemById = createAsyncThunk(
  "inventory/fetchInventoryItemById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await get<InventoryItem>(`/inventory/${id}`)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const createInventoryItem = createAsyncThunk(
  "inventory/createInventoryItem",
  async (item: Omit<InventoryItem, "id">, { rejectWithValue }) => {
    try {
      const response = await post<InventoryItem>("/inventory", item)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updateInventoryItem = createAsyncThunk(
  "inventory/updateInventoryItem",
  async (
    { id, data }: { id: string; data: Partial<InventoryItem> },
    { rejectWithValue }
  ) => {
    try {
      const response = await put<InventoryItem>(`/inventory/${id}`, data)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const deleteInventoryItem = createAsyncThunk(
  "inventory/deleteInventoryItem",
  async (id: string, { rejectWithValue }) => {
    try {
      await del(`/inventory/${id}`)
      return id
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const fetchStockMovements = createAsyncThunk(
  "inventory/fetchStockMovements",
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await get<StockMovement[]>(`/inventory/${itemId}/movements`)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const createStockMovement = createAsyncThunk(
  "inventory/createStockMovement",
  async (movement: Omit<StockMovement, "id" | "created_at">, { rejectWithValue }) => {
    try {
      const response = await post<StockMovement>("/inventory/movements", movement)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

// Recipe-related thunks
export const fetchRecipes = createAsyncThunk(
  "inventory/fetchRecipes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await get<Recipe[]>("/inventory/recipes")
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const createRecipe = createAsyncThunk(
  "inventory/createRecipe",
  async (recipe: Omit<Recipe, "id">, { rejectWithValue }) => {
    try {
      const response = await post<Recipe>("/inventory/recipes", recipe)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const updateRecipe = createAsyncThunk(
  "inventory/updateRecipe",
  async ({ id, data }: { id: string; data: Partial<Recipe> }, { rejectWithValue }) => {
    try {
      const response = await put<Recipe>(`/inventory/recipes/${id}`, data)
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const deleteRecipe = createAsyncThunk(
  "inventory/deleteRecipe",
  async (id: string, { rejectWithValue }) => {
    try {
      await del(`/inventory/recipes/${id}`)
      return id
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

// Slice Definition
const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload
      state.pagination.page = 1
    },
    setFilters: (state, action: PayloadAction<Partial<InventoryState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1
    },
    clearFilters: (state) => {
      state.filters = {}
      state.pagination.page = 1
    },
    setSort: (state, action: PayloadAction<{ field: string; order: "asc" | "desc" }>) => {
      state.sort = action.payload
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload
      state.pagination.page = 1
    },
    clearSelectedItem: (state) => {
      state.selectedItemId = null
      state.stockMovements = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inventory Items
      .addCase(fetchInventoryItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInventoryItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data
        state.pagination.total = action.payload.total
        state.pagination.page = action.payload.page
        state.pagination.limit = action.payload.limit
        state.pagination.totalPages = Math.ceil(action.payload.total / action.payload.limit)
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch Item by ID
      .addCase(fetchInventoryItemById.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        } else {
          state.items.push(action.payload)
        }
        state.selectedItemId = action.payload.id
      })

      // Create Item
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.pagination.total += 1
      })

      // Update Item
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })

      // Delete Item
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.pagination.total -= 1
        if (state.selectedItemId === action.payload) {
          state.selectedItemId = null
        }
      })

      // Fetch Stock Movements
      .addCase(fetchStockMovements.fulfilled, (state, action) => {
        state.stockMovements = action.payload
      })

      // Create Stock Movement
      .addCase(createStockMovement.fulfilled, (state, action) => {
        state.stockMovements.unshift(action.payload)
      })

      // Fetch Recipes (not used yet, but ready!)
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        // You can store recipes separately or use them in a different way
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        // Handle adding new recipe
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        // Handle updating existing recipe
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        // Handle deleting recipe
      })
  },
})

// Export actions and reducer
export const {
  setSearch,
  setFilters,
  clearFilters,
  setSort,
  setPage,
  setLimit,
  clearSelectedItem,
} = inventorySlice.actions

// Selectors
export const selectInventoryItems = (state: RootState) => state.inventory.items
export const selectSelectedInventoryItem = (state: RootState) =>
  state.inventory.items.find(item => item.id === state.inventory.selectedItem?.id) || null
export const selectStockMovements = (state: RootState) => state.inventory.stockMovements
export const selectInventoryLoading = (state: RootState) => state.inventory.loading
export const selectInventoryError = (state: RootState) => state.inventory.error
export const selectInventoryPagination = (state: RootState) => state.inventory.page
export const selectInventoryFilters = (state: RootState) => state.inventory.filters
export const selectInventorySearch = (state: RootState) => state.inventory.search
export const selectInventorySort = (state: RootState) => state.inventory.sort

export default inventorySlice.reducer