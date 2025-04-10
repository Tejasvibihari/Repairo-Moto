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
        <Sidebar>
          <Routes>
            {/* Landing Page Routes */}
            <Route path='/' element={<Home />} />

            {/* Dashboard Routes */}
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/model' element={<BikeModel />} />
            <Route path='/admin-order-form' element={<AdminBookingForm />} />
            <Route path='/manage-employee' element={<ManageEmployee />} />
            <Route path='/manage-vendor' element={<ManageVendor />} />

            {/* Auth Routes */}
            {/* Blog Routes */}
            <Route path='/add-blog' element={<AddBlog />} />
            <Route path='/manage-blog' element={<ManageBlog />} />
          </Routes>
        </Sidebar>
      </BrowserRouter>
    </>
  )
}
