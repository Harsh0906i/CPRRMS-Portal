import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  reports: [],
  history: [],
  loading: false,
  error: null
};

export const uploadReportFile = createAsyncThunk(
  'reports/upload',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data.report;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload report');
    }
  }
);

export const uploadNewVersion = createAsyncThunk(
  'reports/uploadVersion',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reports/${id}/new-version`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data.report;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload new version');
    }
  }
);

export const fetchReportHistory = createAsyncThunk(
  'reports/fetchHistory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reports/${id}/history`);
      return response.data.data.history;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch report history');
    }
  }
);

export const removeReport = createAsyncThunk(
  'reports/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/reports/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete report');
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearHistory: state => {
      state.history = [];
    }
  },
  extraReducers: builder => {
    builder
      // Upload Report
      .addCase(uploadReportFile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadReportFile.fulfilled, (state, action) => {
        state.loading = false;
        state.reports.unshift(action.payload);
      })
      .addCase(uploadReportFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload Version
      .addCase(uploadNewVersion.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadNewVersion.fulfilled, (state, action) => {
        state.loading = false;
        // Prepend to history if viewing it
        state.history.unshift(action.payload);
      })
      .addCase(uploadNewVersion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch History
      .addCase(fetchReportHistory.pending, state => {
        state.loading = true;
        state.error = null;
        state.history = [];
      })
      .addCase(fetchReportHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchReportHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Report
      .addCase(removeReport.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = state.reports.filter(r => r._id !== action.payload);
        state.history = state.history.filter(r => r._id !== action.payload);
      })
      .addCase(removeReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearHistory } = reportSlice.actions;
export default reportSlice.reducer;
