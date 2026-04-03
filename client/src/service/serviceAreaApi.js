import axiosClient from "./axiosClient"; // adjust path as needed

export const createServiceArea = (data) =>
    axiosClient.post("/api/service-areas/create", data);

export const getAllServiceAreas = () =>
    axiosClient.get("/api/service-areas/all");

export const toggleServiceArea = (id) =>
    axiosClient.patch(`/api/service-areas/toggle/${id}`);

// For update, you'll need to add a PUT route in your backend:
// router.put("/update/:id", updateServiceArea);
export const updateServiceArea = (id, data) =>
    axiosClient.put(`/api/service-areas/update/${id}`, data);