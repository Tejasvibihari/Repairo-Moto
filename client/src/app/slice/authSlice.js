import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    adminToken: null,
    userToken: null,
    employeeToken: null,
    vendorToken: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAdminToken: (state, action) => {
            state.adminToken = action.payload;
        },
        setUserToken: (state, action) => {
            state.userToken = action.payload;
        },
        setEmployeeToken: (state, action) => {
            state.employeeToken = action.payload;
        },
        setVendorToken: (state, action) => {
            state.vendorToken = action.payload;
        },
    },
});
export const { setAdminToken, setUserToken, setEmployeeToken, setVendorToken } = authSlice.actions;
export default authSlice.reducer;