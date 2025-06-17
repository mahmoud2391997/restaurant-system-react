import { Action, combineReducers, configureStore, ThunkAction } from "@reduxjs/toolkit"
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux"

// Import reducers
import { categoriesReducer, modifiersReducer, itemModifiersReducer , menuSliceReducer} from "./slices/menuSlice"
import orderReducer from "./slices/orderSlice"
import inventoryReducer from "./slices/inventorySlice"
import customerReducer from "./slices/customerSlice"
import employeeReducer from "./slices/employeeSlice"
import branchReducer from "./slices/branchSlice"
import posReducer from "./slices/pos"
import kitchenReducer from "./slices/kitchenSlice"

// import supplierReducer from "./slices/supplierSlice"
// import aggregatorReducer from "./slices/aggregatorSlice"
// import financeReducer from "./slices/financeSlice"
const menuReducer = combineReducers({
menu:menuSliceReducer,
  categories: categoriesReducer,
  modifiers: modifiersReducer,
  itemModifiers: itemModifiersReducer,
});

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    orders: orderReducer,
    inventory: inventoryReducer,
    customers: customerReducer,
    employees: employeeReducer,
    branches:branchReducer,
        pos: posReducer,
kitchen:kitchenReducer
    // suppliers: supplierReducer,
    // aggregators: aggregatorReducer,
    // finance: financeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload.timestamp", "meta.arg.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: [
          "orders.entities.*.created_at",
          "orders.entities.*.updated_at",
          "customers.entities.*.created_at",
        ],
      },
    }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;