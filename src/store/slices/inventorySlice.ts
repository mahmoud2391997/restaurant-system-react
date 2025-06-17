import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get, post, put, del } from "../../services/api";
import type {
  InventoryItem,
  StockMovement,
  StockAdjustment,
  Recipe,
  PurchaseOrder,
  InventoryLog,
} from "../../types/entities";
import { buildQueryString, type QueryParams } from "../../utils/queryUtils";
import type { RootState } from "../index";

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface InventoryState {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  stockMovements: StockMovement[];
  stockAdjustments: StockAdjustment[];
  recipes: Recipe[];
  purchaseOrders: PurchaseOrder[];
  inventoryLogs: InventoryLog[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    [key: string]: string | boolean | undefined;
  };
  search: string;
  sort: { field: string; order: "asc" | "desc" };
}

const initialState: InventoryState = {
  items: [],
  selectedItem: null,
  stockMovements: [],
  stockAdjustments: [],
  recipes: [],
  purchaseOrders: [],
  inventoryLogs: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  filters: {},
  search: "",
  sort: { field: "name", order: "asc" },
};

// Async thunks
export const fetchItems = createAsyncThunk(
  "inventory/fetchItems",
  async (params: QueryParams, { rejectWithValue }) => {
    try {
      const res = await get<Paginated<InventoryItem>>(`/inventory/item?${buildQueryString(params)}`);
      return res;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchItemById = createAsyncThunk(
  "inventory/fetchItemById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await get<InventoryItem>(`/inventory/item/${id}`);
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const createItem = createAsyncThunk(
  "inventory/createItem",
  async (data: Omit<InventoryItem, "id" | "created_at" | "updated_at">, { rejectWithValue }) => {
    try {
      return await post<InventoryItem>("/inventory/item", data);
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const updateItem = createAsyncThunk(
  "inventory/updateItem",
  async ({ id, data }: { id: string; data: Partial<InventoryItem> }, { rejectWithValue }) => {
    try {
      return await put<InventoryItem>(`/inventory/item/${id}`, data);
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const deleteItem = createAsyncThunk(
  "inventory/deleteItem",
  async (id: string, { rejectWithValue }) => {
    try {
      await del(`/inventory/item/${id}`);
      return id;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchStockMovements = createAsyncThunk(
  "inventory/fetchStockMovements",
  async (params: QueryParams, { rejectWithValue }) => {
    try {
      return await get<Paginated<StockMovement>>(`/inventory/movement?${buildQueryString(params)}`);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);


export const createStockMovement = createAsyncThunk(
  "inventory/createStockMovement",
  async (movement: Omit<StockMovement, "id" | "created_at">, { rejectWithValue }) => {
    try {
      return await post<StockMovement>("/inventory/movement", movement);
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchStockAdjustments = createAsyncThunk(
  "inventory/fetchStockAdjustments",
  async (params: QueryParams, { rejectWithValue }) => {
    try {
      return await get<Paginated<StockAdjustment>>(`/inventory/adjustment?${buildQueryString(params)}`);
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const createStockAdjustment = createAsyncThunk(
  "inventory/createStockAdjustment",
  async (adj: Omit<StockAdjustment, "id" | "createdAt">, { rejectWithValue }) => {
    try {
      return await post<StockAdjustment>("/inventory/adjustment", adj);
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchRecipes = createAsyncThunk(
  "inventory/fetchRecipes",
  async (params: QueryParams, { rejectWithValue }) => {
    try {
      return await get<Paginated<Recipe>>(`/inventory/recipe?${buildQueryString(params)}`);
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchRecipeById = createAsyncThunk(
  "inventory/fetchRecipeById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await get<Recipe>(`/inventory/recipe/${id}`);
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const createRecipe = createAsyncThunk(
  "inventory/createRecipe",
  async (recipe: Omit<Recipe, "id" | "created_at">, { rejectWithValue }) => {
    try {
      return await post<Recipe>("/inventory/recipe", recipe);
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const updateRecipe = createAsyncThunk(
  "inventory/updateRecipe",
  async ({ id, data }: { id: string; data: Partial<Recipe> }, { rejectWithValue }) => {
    try {
      return await put<Recipe>(`/inventory/recipe/${id}`, data);
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const deleteRecipe = createAsyncThunk(
  "inventory/deleteRecipe",
  async (id: string, { rejectWithValue }) => {
    try {
      await del(`/inventory/recipe/${id}`);
      return id;
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchPurchaseOrders = createAsyncThunk(
  "inventory/fetchPurchaseOrders",
  async (params: QueryParams, { rejectWithValue }) => {
    try {
      return await get<Paginated<PurchaseOrder>>(`/inventory/purchaseOrders?${buildQueryString(params)}`);
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const createPurchaseOrder = createAsyncThunk(
  "inventory/createPurchaseOrder",
  async (order: Omit<PurchaseOrder, "id" | "created_at">, { rejectWithValue }) => {
    try {
  const res =    await post<PurchaseOrder>("/inventory/purchaseOrders", order);
  console.log(res);
  
      return res
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

export const fetchInventoryLogs = createAsyncThunk(
  "inventory/fetchInventoryLogs",
  async (params: QueryParams, { rejectWithValue }) => {
    try {
      return await get<Paginated<InventoryLog>>(`/inventory/logs?${buildQueryString(params)}`);
    } catch (err) { return rejectWithValue((err as Error).message); }
  }
);

const slice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setSearch: (s, { payload }: PayloadAction<string>) => { s.search = payload; s.page = 1; },
    setFilters: (s, { payload }: PayloadAction<Partial<InventoryState["filters"]>>) => { s.filters = {...s.filters, ...payload}; s.page = 1; },
    clearFilters: (s) => { s.filters = {}; s.page = 1; },
    setSort: (s, { payload }: PayloadAction<{ field: string; order: "asc" | "desc" }>) => { s.sort = payload; },
    setPage: (s, { payload }: PayloadAction<number>) => { s.page = payload; },
    setLimit: (s, { payload }: PayloadAction<number>) => { s.limit = payload; s.page = 1; },
    clearSelectedItem: (s) => { s.selectedItem = null; s.stockMovements = []; },
  },
  extraReducers: (b) => {
    const handlePending = (s: InventoryState) => { s.loading = true; s.error = null; };
    const handleRejected = (s: InventoryState, a: any) => { s.loading = false; s.error = a.payload as string; };

    b.addCase(fetchItems.pending, handlePending)
     .addCase(fetchItems.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.data;
        s.total = a.payload.total;
        s.page = a.payload.page;
        s.limit = a.payload.limit;
        s.totalPages = a.payload.totalPages;
      }).addCase(fetchItems.rejected, handleRejected);

    b.addCase(fetchItemById.pending, handlePending)
     .addCase(fetchItemById.fulfilled, (s, a) => {
        s.loading = false;
        s.selectedItem = a.payload;
      }).addCase(fetchItemById.rejected, handleRejected);

    b.addCase(createItem.pending, handlePending)
     .addCase(createItem.fulfilled, (s, a) => {
        s.loading = false; s.items.unshift(a.payload); s.total++;
      }).addCase(createItem.rejected, handleRejected);

    b.addCase(updateItem.pending, handlePending)
     .addCase(updateItem.fulfilled, (s, a) => {
        s.loading = false;
        const i = s.items.findIndex(i => i.id === a.payload.id);
        if (i !== -1) s.items[i] = a.payload;
        if (s.selectedItem?.id === a.payload.id) s.selectedItem = a.payload;
      }).addCase(updateItem.rejected, handleRejected);

    b.addCase(deleteItem.pending, handlePending)
     .addCase(deleteItem.fulfilled, (s, a) => {
        s.loading = false;
        s.items = s.items.filter(i => i.id !== a.payload);
        s.total--;
        if (s.selectedItem?.id === a.payload) s.selectedItem = null;
      }).addCase(deleteItem.rejected, handleRejected);

    b.addCase(fetchStockMovements.pending, handlePending)
.addCase(fetchStockMovements.fulfilled, (state, action) => {
  state.loading = false;
  state.stockMovements = action.payload.data;
  state.total = action.payload.total; // optional, if you want to store pagination info
  state.page = action.payload.page;
  state.limit = action.payload.limit;
  state.totalPages = action.payload.totalPages;
})
     .addCase(fetchStockMovements.rejected, handleRejected);

    b.addCase(createStockMovement.pending, handlePending)
     .addCase(createStockMovement.fulfilled, (s, a) => {
        s.loading = false;
        s.stockMovements.unshift(a.payload);
        const id = a.payload.inventory_item_id;
        const idx = s.items.findIndex(i => i.id === id);
        if (idx !== -1) {
          a.payload.movement_type === "in"
            ? s.items[idx].currentStock += a.payload.quantity
            : s.items[idx].currentStock -= a.payload.quantity;
        }
        if (s.selectedItem?.id === id) {
          a.payload.movement_type === "in"
            ? s.selectedItem.currentStock += a.payload.quantity
            : s.selectedItem.currentStock -= a.payload.quantity;
        }
      }).addCase(createStockMovement.rejected, handleRejected);

    b.addCase(fetchStockAdjustments.pending, handlePending)
     .addCase(fetchStockAdjustments.fulfilled, (s, a) => {
        s.loading = false;
        s.stockAdjustments = a.payload.data;
        s.total = a.payload.total;
        s.page = a.payload.page;
        s.limit = a.payload.limit;
        s.totalPages = a.payload.totalPages;
      }).addCase(fetchStockAdjustments.rejected, handleRejected);

    b.addCase(createStockAdjustment.pending, handlePending)
     .addCase(createStockAdjustment.fulfilled, (s, a) => {
        s.loading = false;
        s.stockAdjustments.unshift(a.payload);
        const idx = s.items.findIndex(i => i.id === a.payload.itemId);
        if (idx !== -1) s.items[idx].currentStock += a.payload.quantity;
      }).addCase(createStockAdjustment.rejected, handleRejected);

    b.addCase(fetchRecipes.pending, handlePending)
     .addCase(fetchRecipes.fulfilled, (s, a) => {
        s.loading = false;
        s.recipes = a.payload.data;
        s.total = a.payload.total;
        s.page = a.payload.page;
        s.limit = a.payload.limit;
        s.totalPages = a.payload.totalPages;
      }).addCase(fetchRecipes.rejected, handleRejected);

    b.addCase(fetchRecipeById.pending, handlePending)
     .addCase(fetchRecipeById.fulfilled, (s, a) => {
        s.loading = false;
        const i = s.recipes.findIndex(r => r.id === a.payload.id);
        if (i === -1) s.recipes.push(a.payload);
        else s.recipes[i] = a.payload;
      }).addCase(fetchRecipeById.rejected, handleRejected);

    b.addCase(createRecipe.pending, handlePending)
     .addCase(createRecipe.fulfilled, (s, a) => { s.loading = false; s.recipes.unshift(a.payload); s.total++; })
     .addCase(createRecipe.rejected, handleRejected);

    b.addCase(updateRecipe.pending, handlePending)
     .addCase(updateRecipe.fulfilled, (s, a) => {
        const i = s.recipes.findIndex(r => r.id === a.payload.id);
        if (i !== -1) s.recipes[i] = a.payload;
        s.loading = false;
      }).addCase(updateRecipe.rejected, handleRejected);

    b.addCase(deleteRecipe.pending, handlePending)
     .addCase(deleteRecipe.fulfilled, (s, a) => {
        s.recipes = s.recipes.filter(r => r.id !== a.payload);
        s.total--;
        s.loading = false;
      }).addCase(deleteRecipe.rejected, handleRejected);

    b.addCase(fetchPurchaseOrders.pending, handlePending)
     .addCase(fetchPurchaseOrders.fulfilled, (s, a) => {
        s.loading = false;
        s.purchaseOrders = a.payload.data;
      }).addCase(fetchPurchaseOrders.rejected, handleRejected);

    b.addCase(createPurchaseOrder.pending, handlePending)
     .addCase(createPurchaseOrder.fulfilled, (s, a) => {
        s.loading = false;
        s.purchaseOrders.unshift(a.payload);
      }).addCase(createPurchaseOrder.rejected, handleRejected);

    b.addCase(fetchInventoryLogs.pending, handlePending)
     .addCase(fetchInventoryLogs.fulfilled, (s, a) => {
        s.loading = false;
        s.inventoryLogs = a.payload.data;
      }).addCase(fetchInventoryLogs.rejected, handleRejected);
  },
});
// ... (previous slice code remains the same until the exports section)

// Export actions
export const {
  setSearch,
  setFilters,
  clearFilters,
  setSort,
  setPage,
  setLimit,
  clearSelectedItem,
} = slice.actions;

// Export selectors
export const selectInventory = (state: RootState) => state.inventory;
export const selectInventoryItems = (state: RootState) => state.inventory.items;
export const selectInventoryLoading = (state: RootState) => state.inventory.loading;
export const selectInventoryError = (state: RootState) => state.inventory.error;
export const selectInventoryPagination = (state: RootState) => ({
  page: state.inventory.page,
  limit: state.inventory.limit,
  total: state.inventory.total,
  totalPages: state.inventory.totalPages,
});
export const selectInventoryFilters = (state: RootState) => state.inventory.filters;
export const selectInventorySearch = (state: RootState) => state.inventory.search;
export const selectInventorySort = (state: RootState) => state.inventory.sort;
export const selectSelectedInventoryItem = (state: RootState) => state.inventory.selectedItem;
export const selectStockMovements = (state: RootState) => state.inventory.stockMovements;
export const selectStockAdjustments = (state: RootState) => state.inventory.stockAdjustments;
export const selectRecipes = (state: RootState) => state.inventory.recipes;
export const selectPurchaseOrders = (state: RootState) => state.inventory.purchaseOrders;
export const selectInventoryLogs = (state: RootState) => state.inventory.inventoryLogs;

// Export reducer
export default slice.reducer;