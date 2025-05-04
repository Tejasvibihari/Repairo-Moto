import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    admin: {},
    isAuthenticated: false,
    loading: false,
    error: null,
}

export const adminAuthSlice = createSlice({
    name: "adminAuth",
    initialState,
    reducers: {
        setAdminSignIn: (state, action) => {
            state.admin = action.payload;
            state.isAuthenticated = true;
        },
        setAdminLogout: (state) => {
            state.admin = null;
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
export const { setAdminSignIn, setAdminLogout, setAdminSignOut, setLoading, setError } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;