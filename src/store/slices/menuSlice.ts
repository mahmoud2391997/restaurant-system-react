import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get, post, put, del } from "../../services/api";
import type { RootState } from '../index'; // Adjust path as needed
import { MenuItem } from "../../types/entities";

// === TYPES ===

interface MenuCategory {
  _id: string;
  id: string;
  name: string;
  description?: string;
}

interface Modifier {
  id: string;
  name: string;
  description?:string;
  price?: number;
}

interface ItemModifier {
  id: string;
  menuItemId: string;
  modifierId: string;
  name: string;
  price: number;
  description?: string;
};

// Pagination Response Type
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// === MENU SLICE ===
interface MenuState {
  items: MenuItem[];
  selectedItem: MenuItem | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    category_id?: string;
    is_available?: boolean;
    price_min?: number;
    price_max?: number;
  };
  search: string;
  sort: {
    field: string;
    order: "asc" | "desc";
  };
}

const menuInitialState: MenuState = {
  items: [],
  selectedItem: null,
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
const SERVER_URL = "http://localhost:3000"
// Async Thunks - Menu
export const fetchMenuItems = createAsyncThunk(
  "menu/fetchItems",
  async (params: any, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await get<PaginatedResponse<MenuItem>>(`${SERVER_URL}/menu/items?${queryString}`);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchMenuItemById = createAsyncThunk(
  "menu/fetchItemById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await get<MenuItem>(`${SERVER_URL}/menu/items/${id}`);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createMenuItem = createAsyncThunk(
  "menu/createItem",
  async (
    item: Omit<MenuItem, "id" | "created_at" | "updated_at">,
    { rejectWithValue }
  ) => {
    try {
      const response = await post<MenuItem>(`${SERVER_URL}/menu/items`, item);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  "menu/updateItem",
  async ({ id, data }: { id: string; data: Partial<MenuItem> }, { rejectWithValue }) => {
    try {
      const response = await put<MenuItem>(`${SERVER_URL}/menu/items/${id}`, data);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  "menu/deleteItem",
  async (id: string, { rejectWithValue }) => {
    try {
      await del(`/menu/items/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Menu Slice
const menuSlice = createSlice({
  name: "menu",
  initialState: menuInitialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
    setFilters: (state, action: PayloadAction<Partial<MenuState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.page = 1;
    },
    setSort: (state, action: PayloadAction<{ field: string; order: "asc" | "desc" }>) => {
      state.sort = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1;
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Items
    builder.addCase(fetchMenuItems.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMenuItems.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.data;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(fetchMenuItems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Item By ID
    builder.addCase(fetchMenuItemById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMenuItemById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedItem = action.payload;
    });
    builder.addCase(fetchMenuItemById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Item
    builder.addCase(createMenuItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createMenuItem.fulfilled, (state, action) => {
      state.loading = false;
      state.items.push(action.payload);
      state.total += 1;
    });
    builder.addCase(createMenuItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Item
    builder.addCase(updateMenuItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateMenuItem.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedItem?.id === action.payload.id) {
        state.selectedItem = action.payload;
      }
    });
    builder.addCase(updateMenuItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Item
    builder.addCase(deleteMenuItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteMenuItem.fulfilled, (state, action) => {
      state.loading = false;
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.total -= 1;
      if (state.selectedItem?.id === action.payload) {
        state.selectedItem = null;
      }
    });
    builder.addCase(deleteMenuItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});



interface CategoriesState {
  items: MenuCategory[];
  selectedItem: MenuCategory | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  search: string;
}

const categoriesInitialState: CategoriesState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  search: "",
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (params: Record<string, any>, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await get<PaginatedResponse<MenuCategory>>(`/menu/categories?${queryString}`);
      console.log(response);
      
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await get<MenuCategory>(`/categories/${id}`);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (item: Omit<MenuCategory, "id">, { rejectWithValue }) => {
    try {
      const response = await post<MenuCategory>("menu/categories", item);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, data }: { id: string; data: Partial<MenuCategory> }, { rejectWithValue }) => {
    try {
      const response = await put<MenuCategory>(`/categories/${id}`, data);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await del(`/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState: categoriesInitialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1;
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<PaginatedResponse<MenuCategory>>) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // fetchCategoryById
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action: PayloadAction<MenuCategory>) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // createCategory
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<MenuCategory>) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // updateCategory
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<MenuCategory>) => {
        state.loading = false;
        const index = state.items.findIndex((cat) => cat._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?._id === action.payload._id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // deleteCategory
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.items = state.items.filter((cat) => cat._id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearch,
  setPage,
  setLimit,
  clearSelectedItem,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;


// === MODIFIERS SLICE ===
interface ModifiersState {
  items: Modifier[];
  selectedItem: Modifier | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  search: string;
}

const modifiersInitialState: ModifiersState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  search: "",
};

export const fetchModifiers = createAsyncThunk(
  "modifiers/fetchAll",
  async (params: Record<string, any>, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await get<PaginatedResponse<Modifier>>(`/menu/modifiers?${queryString}`);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchModifierById = createAsyncThunk(
  "modifiers/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await get<Modifier>(`/modifiers/${id}`);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createModifier = createAsyncThunk(
  "modifiers/create",
  async (item: Omit<Modifier, "id">, { rejectWithValue }) => {
    try {
      const response = await post<Modifier>("/menu/modifiers", item);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateModifier = createAsyncThunk(
  "modifiers/update",
  async ({ id, data }: { id: string; data: Partial<Modifier> }, { rejectWithValue }) => {
    try {
      const response = await put<Modifier>(`/modifiers/${id}`, data);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteModifier = createAsyncThunk(
  "modifiers/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await del(`/modifiers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const modifiersSlice = createSlice({
  name: "modifiers",
  initialState: modifiersInitialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1;
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    // Add cases for fetchModifiers, etc. here
  },
});

// === ITEM MODIFIERS SLICE ===
interface ItemModifiersState {
  items: ItemModifier[];
  loading: boolean;
  error: string | null;
}

const itemModifiersInitialState: ItemModifiersState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchItemModifiersByMenuItem = createAsyncThunk(
  "itemModifiers/fetchByMenuItem",
  async (menuItemId: string, { rejectWithValue }) => {
    try {
      const response = await get<ItemModifier[]>(`/menu/items/${menuItemId}/modifiers`);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const addItemModifier = createAsyncThunk(
  "itemModifiers/add",
  async (item: Omit<ItemModifier, "id">, { rejectWithValue }) => {
    try {
      const response = await post<ItemModifier>("/item-modifiers", item);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteItemModifier = createAsyncThunk(
  "itemModifiers/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await del(`/item-modifiers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const itemModifiersSlice = createSlice({
  name: "itemModifiers",
  initialState: itemModifiersInitialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Add cases for fetchItemModifiersByMenuItem, etc. here
  },
});

// === EXPORTS ===

// Actions
export const {
  setSearch: setCategoriesSearch,
  setPage: setCategoriesPage,
  setLimit: setCategoriesLimit,
  clearSelectedItem: clearCategorySelectedItem,
} = categoriesSlice.actions;

export const {
  setSearch: setModifiersSearch,
  setPage: setModifiersPage,
  setLimit: setModifiersLimit,
  clearSelectedItem: clearModifierSelectedItem,
} = modifiersSlice.actions;

export const { clearError: clearItemModifiersError } = itemModifiersSlice.actions;

// Selectors
export const selectMenuItems = (state: RootState) => state.menu.menu.items;
export const selectMenuLoading = (state: RootState) => state.menu.menu.loading;
export const selectMenuError = (state: RootState) => state.menu.menu.error;
export const selectMenuPagination = (state: RootState) => ({
  page: state.menu.menu.page,
  limit: state.menu.menu.limit,
  total: state.menu.menu.total,
  totalPages: state.menu.menu.totalPages,
});
export const selectMenuFilters = (state: RootState) => state.menu.menu.filters;
export const selectMenuSearch = (state: RootState) => state.menu.menu.search;
export const selectMenuSort = (state: RootState) => state.menu.menu.sort;
export const selectSelectedMenuItem = (state: RootState) => state.menu.menu.selectedItem;

export const selectCategories = (state: RootState) => state.menu.categories.items;
export const selectCategoriesLoading = (state: RootState) => state.menu.categories.loading;
export const selectCategoriesError = (state: RootState) => state.menu.categories.error;
export const selectCategorySelectedItem = (state: RootState) => state.menu.categories.selectedItem;

export const selectModifiers = (state: RootState) => state.menu.modifiers.items;
export const selectModifiersLoading = (state: RootState) => state.menu.modifiers.loading;
export const selectModifiersError = (state: RootState) => state.menu.modifiers.error;
export const selectModifierSelectedItem = (state: RootState) => state.menu.modifiers.selectedItem;

export const selectItemModifiers = (state: RootState) => state.menu.itemModifiers.items;
export const selectItemModifiersLoading = (state: RootState) => state.menu.itemModifiers.loading;
export const selectItemModifiersError = (state: RootState) => state.menu.itemModifiers.error;

// Reducers
export const menuSliceReducer = menuSlice.reducer;
export const categoriesReducer = categoriesSlice.reducer;
export const modifiersReducer = modifiersSlice.reducer;
export const itemModifiersReducer = itemModifiersSlice.reducer;