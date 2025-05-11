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
    },
});

export const { setEmployee, setLoading, addEmployee, setError } = employeeSlice.actions;
export default employeeSlice.reducer; // Corrected export