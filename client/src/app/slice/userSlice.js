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
            const user = action.payload.user;
            // Transform _id to id
            const formattedUser = {
                ...user,
                id: user._id,
            };

            state.user = formattedUser;
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
export const { setUserSignIn, setUserLogout, setLoading, setError } = userAuthSlice.actions;

export default userAuthSlice.reducer;