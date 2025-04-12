import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {},
    isAuthenticated: false,
    loading: false,
    error: null,
}

export const userAuthSlice = createSlice({
    name: "userAuth",
    initialState,
    reducers: {
        setUserSignIn: (state, action) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.token = action.payload.token;
        },
        setUserLogout: (state) => {
            state.user = null;
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
export const { setUserSignIn, setUserSignOut, setLoading, setError } = userAuthSlice.actions;

export default userAuthSlice.reducer;