import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    brands: {},
    loading: false,
    error: null,
}

export const brandSlice = createSlice({
    name: "brand",
    initialState,
    reducers: {
        setBrands: (state, action) => {
            state.brands = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    }
})

export const { setBrands, setLoading, setError } = brandSlice.actions
export default brandSlice.reducer;