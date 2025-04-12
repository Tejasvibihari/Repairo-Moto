import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Default storage (localStorage)
import { combineReducers } from 'redux';

// Example reducer (replace with your actual reducers)
import brandReducers from './slice/brandSlice';
import employeeReducers from './slice/employeeSlice'
import vendorReducers from "./slice/vendorSlice"
import adminAuthReducers from './slice/adminAuthSlice'
import userAuthReducers from './slice/userSlice';
import authReducers from './slice/authSlice'

// Persist configuration
const persistConfig = {
    key: 'root', // Key for the root of the persisted state
    storage, // Use localStorage for persistence
};

// Combine reducers
const rootReducer = combineReducers({
    auth: authReducers,
    brand: brandReducers,
    employee: employeeReducers,
    vendor: vendorReducers,// Add your reducers here
    admin: adminAuthReducers,
    user: userAuthReducers,
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store
export const store = configureStore({
    reducer: persistedReducer,
});

// Create a persistor
export const persistor = persistStore(store);