import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  treatments: [],
  loading: false,
  error: null
};

export const fetchTreatmentsByPatient = createAsyncThunk(
  'treatments/fetchByPatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/treatments/patient/${patientId}`);
      return response.data.data.treatments;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch treatments');
    }
  }
);

export const addTreatment = createAsyncThunk(
  'treatments/add',
  async (treatmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/treatments', treatmentData);
      return response.data.data.treatment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add treatment');
    }
  }
);

export const editTreatment = createAsyncThunk(
  'treatments/edit',
  async ({ id, treatmentData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/treatments/${id}`, treatmentData);
      return response.data.data.treatment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update treatment');
    }
  }
);

export const removeTreatment = createAsyncThunk(
  'treatments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/treatments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete treatment');
    }
  }
);

const treatmentSlice = createSlice({
  name: 'treatments',
  initialState,
  reducers: {
    clearTreatments: state => {
      state.treatments = [];
    }
  },
  extraReducers: builder => {
    builder
      // Fetch treatments
      .addCase(fetchTreatmentsByPatient.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTreatmentsByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.treatments = action.payload;
      })
      .addCase(fetchTreatmentsByPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add treatment
      .addCase(addTreatment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTreatment.fulfilled, (state, action) => {
        state.loading = false;
        state.treatments.unshift(action.payload);
      })
      .addCase(addTreatment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Edit treatment
      .addCase(editTreatment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editTreatment.fulfilled, (state, action) => {
        state.loading = false;
        state.treatments = state.treatments.map(t =>
          t._id === action.payload._id ? action.payload : t
        );
      })
      .addCase(editTreatment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete treatment
      .addCase(removeTreatment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTreatment.fulfilled, (state, action) => {
        state.loading = false;
        state.treatments = state.treatments.filter(t => t._id !== action.payload);
      })
      .addCase(removeTreatment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearTreatments } = treatmentSlice.actions;
export default treatmentSlice.reducer;
