import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Branch } from '../../types/entities'
import { get, post, put, del } from '../../services/api' // adjust the path as needed
import { RootState } from '..'

interface BranchState {
  branches: Branch[]
  branch?: Branch
  loading: boolean
  error?: string
}

const initialState: BranchState = {
  branches: [],
  branch: undefined,
  loading: false,
  error: undefined
}

// Async thunks
export const fetchBranches = createAsyncThunk<Branch[]>(
  'branches/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await get<Branch[]>('/branches')
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchBranchById = createAsyncThunk<Branch, string>(
  'branches/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await get<Branch>(`/branches/${id}`)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const createBranch = createAsyncThunk<Branch, Partial<Branch>>(
  'branches/create',
  async (data, { rejectWithValue }) => {
    try {
      return await post<Branch>('/branches', data)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateBranch = createAsyncThunk<Branch, { id: string; data: Partial<Branch> }>(
  'branches/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await put<Branch>(`/branches/${id}`, data)
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteBranch = createAsyncThunk<string, string>(
  'branches/delete',
  async (id, { rejectWithValue }) => {
    try {
      await del(`/branches/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// Slice
const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    clearBranchState: (state) => {
      state.branch = undefined
      state.error = undefined
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchBranches.fulfilled, (state, action: PayloadAction<Branch[]>) => {
        state.loading = false
        state.branches = action.payload
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch by ID
      .addCase(fetchBranchById.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchBranchById.fulfilled, (state, action: PayloadAction<Branch>) => {
        state.loading = false
        state.branch = action.payload
      })
      .addCase(fetchBranchById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Create
      .addCase(createBranch.fulfilled, (state, action: PayloadAction<Branch>) => {
        state.branches.push(action.payload)
      })

      // Update
      .addCase(updateBranch.fulfilled, (state, action: PayloadAction<Branch>) => {
        const index = state.branches.findIndex((b) => b.id === action.payload.id)
        if (index !== -1) state.branches[index] = action.payload
      })

      // Delete
      .addCase(deleteBranch.fulfilled, (state, action: PayloadAction<string>) => {
        state.branches = state.branches.filter((b) => b.id !== action.payload)
      })
  }
})

export const { clearBranchState } = branchSlice.actions
export default branchSlice.reducer
export const selectBranches = (state: RootState) => state.branches.branches
export const selectBranch = (state: RootState) => state.branches.branch
export const selectLoading = (state: RootState) => state.branches.loading
export const selectError = (state: RootState) => state.branches.error