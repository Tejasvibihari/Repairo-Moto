import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    employee: [],
    loading: false,
    error: null,
};

export const employeeSlice = createSlice({
    name: "employee",
    initialState,
    reducers: {
        setEmployee: (state, action) => {
            state.employee = action.payload;
        },
        addEmployee: (state, action) => {
            state.employee.push(action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setEmployeeSignOut: (state, action) => {
            state.loading = action.payload;
            state.error = null; // Reset error when loading state changes
            state.employee = []; // Clear employee data on sign out
            localStorage.removeItem("employee"); // Clear employee data from localStorage

        }
    },
});

export const { setEmployee, setLoading, addEmployee, setError, setEmployeeSignOut } = employeeSlice.actions;
export default employeeSlice.reducer; // Corrected export