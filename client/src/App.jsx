import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"


import Home from './pages/landing/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Sidebar from './components/ui/Sidebar';
import BikeModel from './pages/dashboard/BikeModel';
import AdminBookingForm from './pages/dashboard/AdminBookingForm';
import ManageEmployee from './pages/dashboard/ManageEmployee';
import axiosClient from './service/axiosClient';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setBrands } from './app/slice/brandSlice';
import AddBlog from './pages/dashboard/AddBlog';
import ManageBlog from './pages/dashboard/ManageBlog';
import ManageVendor from './pages/dashboard/ManageVendor';
import AdminSignIn from './pages/auth/AdminSignIn';
import PrivateRoute from './components/routes/PrivateRoute';
import UserAuth from './pages/auth/UserAuth';
export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchBrands = async () => {

      try {
        const response = await axiosClient.get('/api/admin/brands/getBrands');
        dispatch(setBrands(response.data))

      } catch (error) {
        console.error("Error fetching brands:", error);
      }

    }
    fetchBrands()
  }, [])
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Landing Route without Sidebar */}
          <Route path='/' element={<Home />} />

          {/* Auth Page (No Sidebar) */}
          <Route path='/admin-sign-in' element={<AdminSignIn />} />
          <Route path='/user-auth' element={<UserAuth />} />

          {/* Protected Routes with Sidebar */}
          <Route
            path='/dashboard'
            element={
              <PrivateRoute>
                <Sidebar><Dashboard /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/model'
            element={
              <PrivateRoute>
                <Sidebar><BikeModel /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/admin-order-form'
            element={
              <PrivateRoute>
                <Sidebar><AdminBookingForm /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/manage-employee'
            element={
              <PrivateRoute>
                <Sidebar><ManageEmployee /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/manage-vendor'
            element={
              <PrivateRoute>
                <Sidebar><ManageVendor /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/add-blog'
            element={
              <PrivateRoute>
                <Sidebar><AddBlog /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/manage-blog'
            element={
              <PrivateRoute>
                <Sidebar><ManageBlog /></Sidebar>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}
