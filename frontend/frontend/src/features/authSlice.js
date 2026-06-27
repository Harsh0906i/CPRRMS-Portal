import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Check local storage for pre-existing session
const savedUser = JSON.parse(localStorage.getItem('cprrms_user') || 'null');

const initialState = {
  user: savedUser,
  token: null,
  isAuthenticated: !!savedUser,
  loading: false,
  error: null
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, data } = response.data;
      
      // Save user to local storage for persistence
      localStorage.setItem('cprrms_user', JSON.stringify(data.user));
      
      return { token, user: data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Proceed with local logout anyway
    } finally {
      localStorage.removeItem('cprrms_user');
    }
  }
);

export const checkCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data.user;
    } catch (error) {
      localStorage.removeItem('cprrms_user');
      const message = error.response?.data?.message || 'Session expired';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    logout: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('cprrms_user');
    },
    clearError: state => {
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      // Login User
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout User
      .addCase(logoutUser.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // Check Current User
      .addCase(checkCurrentUser.pending, state => {
        state.loading = true;
      })
      .addCase(checkCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(checkCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      });
  }
});

export const { setToken, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
