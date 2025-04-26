import axios from "axios";
import { store } from "../app/store.js";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    timeout: 10000,
});

// 🔐 Add token to headers before each request
axiosClient.interceptors.request.use((config) => {
    const state = store.getState();
    const token =
        state.auth.adminToken ||
        state.auth.employeeToken ||
        state.auth.vendorToken ||
        state.auth.userToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// 🔁 Handle 401 error and redirect to sign-in
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optional: clear localStorage or redux tokens here
            // localStorage.removeItem("token");
            // store.dispatch(logoutAction()); // optional

            window.location.href = "/signin"; // Redirect to sign-in
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
