import { createSlice, createAsyncThunk, PayloadAction, AnyAction } from '@reduxjs/toolkit';
import { ActionReducerMapBuilder } from '@reduxjs/toolkit';

import { get, post, put, del, handleApiError } from '../../services/api';
import { RootState } from '..';
import { KitchenOrder, KitchenOrderItem, KitchenStation } from '@/types/entities';

// Types
// interface Order {
//   id: string;
//   orderNumber: string;
//   tableNumber?: number;
//   customerName?: string;
//   orderType: 'dine-in' | 'delivery' | 'takeaway';
//   items: OrderItem[];
//   status: 'new' | 'preparing' | 'ready' | 'served' | 'delayed';
//   orderTime: string;
//   totalEstimatedTime: number;
//   isRushed: boolean;
// }

// interface OrderItem {
//   id: string;
//   name: string;
//   quantity: number;
//   status: 'pending' | 'preparing' | 'ready' | 'served';
//   station: string;
//   estimatedTime?: number;
// }

// interface Station {
//   id: string;
//   name: string;
//   type: string;
//   status: 'active' | 'busy' | 'offline';
// }

interface KitchenState {
  orders: KitchenOrder[];
  stations: KitchenStation[];
  items: KitchenOrderItem[];
  selectedItem: KitchenOrderItem | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: KitchenState = {
  orders: [],
  stations: [],
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
};

// Thunks

// Orders
export const fetchAllOrders = createAsyncThunk(
  'kitchen/fetchAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await get<KitchenOrder[]>('/orders');
    } catch (error) {
      return rejectWithValue(handleApiError(error).message);
    }
  }
);

export const createNewOrder = createAsyncThunk(
  'kitchen/createNewOrder',
  async (orderData: Omit<KitchenOrder, 'id'>, { rejectWithValue }) => {
    try {
      return await post<KitchenOrder>('/orders', orderData);
    } catch (error) {
      return rejectWithValue(handleApiError(error).message);
    }
  }
);

// Stations
export const fetchAllStations = createAsyncThunk(
  'kitchen/fetchAllStations',
  async (_, { rejectWithValue }) => {
    try {
      return await get<KitchenStation[]>('/stations');
    } catch (error) {
      return rejectWithValue(handleApiError(error).message);
    }
  }
);

export const createNewStation = createAsyncThunk(
  'kitchen/createNewStation',
  async (stationData: Omit<KitchenStation, 'id'>, { rejectWithValue }) => {
    try {
      return await post<KitchenStation>('/stations', stationData);
    } catch (error) {
      return rejectWithValue(handleApiError(error).message);
    }
  }
);

// Items
export const fetchAllItems = createAsyncThunk(
  'kitchen/fetchAllItems',
  async (_, { rejectWithValue }) => {
    try {
      return await get<KitchenOrderItem[]>('/item');
    } catch (error) {
      return rejectWithValue(handleApiError(error).message);
    }
  }
);

export const createNewItem = createAsyncThunk(
  'kitchen/createNewItem',
  async (itemData: Omit<KitchenOrderItem, 'id'>, { rejectWithValue }) => {
    try {
      return await post<KitchenOrderItem>('/item', itemData);
    } catch (error) {
      return rejectWithValue(handleApiError(error).message);
    }
  }
);

export const fetchItemById = createAsyncThunk(
  'kitchen/fetchItemById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await get<KitchenOrderItem>(`/item/${id}`);
    } catch (error) {
      return rejectWithValue(handleApiError(error).message);
    }
  }
);

export const updateExistingItem = createAsyncThunk(
  'kitchen/updateExistingItem',
  async ({ id, data }: { id: string; data: Partial<KitchenOrderItem> }, { rejectWithValue }) => {
    try {
      return await put<KitchenOrderItem>(`/item/${id}`, data);
    } catch (error) {
      return rejectWithValue(handleApiError(error).message);
    }
  }
);

export const deleteItem = createAsyncThunk(
  'kitchen/deleteItem',
  async (id: string, { rejectWithValue }) => {
    try {
      await del(`/item/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error).message);
    }
  }
);

// Slice
const kitchenSlice = createSlice({
  name: 'kitchen',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    selectItem: (state, action: PayloadAction<KitchenOrderItem | null>) => {
      state.selectedItem = action.payload;
    },
  },
extraReducers: (builder: ActionReducerMapBuilder<KitchenState>) => {
  builder
    .addCase(fetchAllOrders.fulfilled, (state, action: PayloadAction<KitchenOrder[]>) => {
      state.loading = false;
      state.orders = action.payload;
    })


      // Loading state
     
      // Error handling
     
      .addCase(createNewOrder.fulfilled, (state, action: PayloadAction<KitchenOrder>) => {
        state.loading = false;
        state.orders.push(action.payload);
      })

      // Stations
      .addCase(fetchAllStations.fulfilled, (state, action: PayloadAction<KitchenStation[]>) => {
        state.loading = false;
        state.stations = action.payload;
      })
      .addCase(createNewStation.fulfilled, (state, action: PayloadAction<KitchenStation>) => {
        state.loading = false;
        state.stations.push(action.payload);
      })

      // Items
      .addCase(fetchAllItems.fulfilled, (state, action: PayloadAction<KitchenOrderItem[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(createNewItem.fulfilled, (state, action: PayloadAction<KitchenOrderItem>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(fetchItemById.fulfilled, (state, action: PayloadAction<KitchenOrderItem>) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(updateExistingItem.fulfilled, (state, action: PayloadAction<KitchenOrderItem>) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(deleteItem.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      });
  },
});

// Actions
export const { clearError, selectItem } = kitchenSlice.actions;

// Selectors
export const selectAllOrders = (state: RootState) => state.kitchen.orders;
export const selectAllStations = (state: RootState) => state.kitchen.stations;
export const selectAllItems = (state: RootState) => state.kitchen.items;
export const selectSelectedItem = (state: RootState) => state.kitchen.selectedItem;
export const selectKitchenLoading = (state: RootState) => state.kitchen.loading;
export const selectKitchenError = (state: RootState) => state.kitchen.error;

// Reducer
export default kitchenSlice.reducer;
