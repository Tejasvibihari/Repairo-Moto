import axios from "axios";
import { store } from "../app/store.js"

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    // withCredentials: true,
    timeout: 10000,
});




axiosClient.interceptors.request.use((config) => {
    const state = store.getState();
    // Choose one based on your app logic — here we prioritize admin > employee > vendor > user
    const token =
        state.auth.adminToken ||
        state.auth.employeeToken ||
        state.auth.vendorToken ||
        state.auth.userToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
export default axiosClient;

