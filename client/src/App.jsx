import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"


import Home from './pages/landing/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Sidebar from './components/ui/Sidebar';
import BikeModel from './pages/dashboard/BikeModel';


export default function App() {
  return (
    <>
      <BrowserRouter>
        <Sidebar>
          <Routes>
            {/* Landing Page Routes */}
            <Route path='/' element={<Home />} />
            <Route path='/model' element={<BikeModel />} />
            {/* Dashboard Routes */}
            <Route path='/dashboard' element={<Dashboard />} />
            {/* Auth Routes */}
            {/* Blog Routes */}
          </Routes>
        </Sidebar>
      </BrowserRouter>
    </>
  )
}
