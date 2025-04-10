import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    vendors: [],
    loading: false,
    error: null,
};

export const vendorSlice = createSlice({
    name: "vendor",
    initialState,
    reducers: {
        setVendor: (state, action) => {
            state.vendors = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setVendor, setLoading, setError } = vendorSlice.actions;
export default vendorSlice.reducer; // Corrected export