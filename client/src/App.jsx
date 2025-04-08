import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"


import Home from './pages/landing/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Sidebar from './components/ui/Sidebar';
import BikeModel from './pages/dashboard/BikeModel';
import AdminBookingForm from './pages/dashboard/AdminBookingForm';


export default function App() {
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
            {/* Auth Routes */}
            {/* Blog Routes */}
            <Route path='/blog' element={<Blog />} />
            <Route path='/blogeditor'element={<BlogEditor/>} />
          </Routes>
        </Sidebar>
      </BrowserRouter>
    </>
  )
}
