import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  receipts: [],
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null
};

export const fetchReceipts = createAsyncThunk(
  'receipts/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/receipts', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch receipts');
    }
  }
);

export const addReceipt = createAsyncThunk(
  'receipts/add',
  async (receiptData, { rejectWithValue }) => {
    try {
      const response = await api.post('/receipts', receiptData);
      return response.data.data.receipt;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate receipt');
    }
  }
);

const receiptSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    clearReceiptError: state => {
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      // Fetch Receipts
      .addCase(fetchReceipts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.loading = false;
        state.receipts = action.payload.data.receipts;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchReceipts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Receipt
      .addCase(addReceipt.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReceipt.fulfilled, (state, action) => {
        state.loading = false;
        state.receipts.unshift(action.payload);
      })
      .addCase(addReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearReceiptError } = receiptSlice.actions;
export default receiptSlice.reducer;
