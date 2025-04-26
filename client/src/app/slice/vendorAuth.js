import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    vendor: {},
    isAuthenticated: false,
    loading: false,
    error: null,
}

export const vendorAuthSlice = createSlice({
    name: "vendorAuth",
    initialState,
    reducers: {
        setVendorSignIn: (state, action) => {
            state.employee = action.payload;
            state.isAuthenticated = true;
        },
        setVendorLogout: (state) => {
            state.employee = null;
            state.isAuthenticated = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});
export const { setVendorSignIn, setVendorSignOut, setLoading, setError } = vendorAuthSlice.actions;

export default vendorAuthSlice.reducer;