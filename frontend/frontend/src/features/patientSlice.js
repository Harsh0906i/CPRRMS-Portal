import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  patients: [],
  currentPatient: null,
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null
};

export const fetchPatients = createAsyncThunk(
  'patients/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/patients', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patients');
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  'patients/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data.data.patient;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient details');
    }
  }
);

export const addPatient = createAsyncThunk(
  'patients/add',
  async (patientData, { rejectWithValue }) => {
    try {
      const response = await api.post('/patients', patientData);
      return response.data.data.patient;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add patient');
    }
  }
);

export const editPatient = createAsyncThunk(
  'patients/edit',
  async ({ id, patientData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/patients/${id}`, patientData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update patient');
    }
  }
);

export const removePatient = createAsyncThunk(
  'patients/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/patients/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete patient');
    }
  }
);

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearCurrentPatient: state => {
      state.currentPatient = null;
    },
    clearPatientError: state => {
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      // Fetch All Patients
      .addCase(fetchPatients.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload.data.patients;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Patient
      .addCase(fetchPatientById.pending, state => {
        state.loading = true;
        state.error = null;
        state.currentPatient = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPatient = action.payload;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Patient
      .addCase(addPatient.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients.unshift(action.payload);
      })
      .addCase(addPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Edit Patient
      .addCase(editPatient.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPatient = action.payload.patient;
        // Also update list if populated
        state.patients = state.patients.map(p =>
          p._id === action.payload.patient._id ? action.payload.patient : p
        );
      })
      .addCase(editPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Patient
      .addCase(removePatient.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removePatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = state.patients.filter(p => p._id !== action.payload);
        if (state.currentPatient && state.currentPatient._id === action.payload) {
          state.currentPatient = null;
        }
      })
      .addCase(removePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentPatient, clearPatientError } = patientSlice.actions;
export default patientSlice.reducer;
