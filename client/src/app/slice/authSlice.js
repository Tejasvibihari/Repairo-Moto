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
        setEmployeeSignOut: (state) => {
            state.employeeToken = null;
        },
        setLogOut: (state) => {
            state.adminToken = null
            state.userToken = null
            state.employeeToken = null
            state.vendorToken = null
            localStorage.removeItem("employee");
            localStorage.removeItem("userData");
            localStorage.removeItem("vendorData");
            localStorage.removeItem("adminData");
        }
    },
});
export const { setAdminToken, setUserToken, setEmployeeSignOut, setEmployeeToken, setVendorToken, setLogOut } = authSlice.actions;
export default authSlice.reducer;