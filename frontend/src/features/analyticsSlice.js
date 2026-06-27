import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  summary: {
    totalPatients: 0,
    activeCases: 0,
    newCases: 0
  },
  distributions: {
    cancerDistribution: [],
    stageDistribution: [],
    genderDistribution: [],
    ageDistribution: [],
    monthlyRegistrations: [],
    treatmentDistribution: [],
    treatmentStatusDistribution: []
  },
  loading: false,
  error: null
};

export const fetchDashboardStats = createAsyncThunk(
  'analytics/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/dashboard');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard metrics');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchDashboardStats.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.distributions = action.payload.distributions;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default analyticsSlice.reducer;
