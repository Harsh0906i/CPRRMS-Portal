import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import patientReducer from './features/patientSlice';
import treatmentReducer from './features/treatmentSlice';
import reportReducer from './features/reportSlice';
import receiptReducer from './features/receiptSlice';
import analyticsReducer from './features/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientReducer,
    treatments: treatmentReducer,
    reports: reportReducer,
    receipts: receiptReducer,
    analytics: analyticsReducer
  }
});
