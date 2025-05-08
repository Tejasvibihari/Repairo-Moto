import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    employee: {},
    isAuthenticated: false,
    loading: false,
    error: null,
}

export const employeeAuthSlice = createSlice({
    name: "employeeAuth",
    initialState,
    reducers: {
        setEmployeeSignIn: (state, action) => {
            state.employee = action.payload;
            state.isAuthenticated = true;
        },
        setEmployeeLogout: (state) => {
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
export const { setEmployeeSignIn, setEmployeeLogout, setLoading, setError } = employeeAuthSlice.actions;

export default employeeAuthSlice.reducer;