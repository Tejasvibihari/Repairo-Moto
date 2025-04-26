import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"


import Home from './pages/landing/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Sidebar from './components/ui/Sidebar';
import BikeModel from './pages/dashboard/BikeModel';
import AdminBookingForm from './pages/dashboard/AdminBookingForm';
import ManageEmployee from './pages/dashboard/ManageEmployee';

import AddBlog from './pages/dashboard/AddBlog';
import ManageBlog from './pages/dashboard/ManageBlog';
import ManageVendor from './pages/dashboard/ManageVendor';
import AdminSignIn from './pages/auth/AdminSignIn';
import PrivateRoute from './components/routes/PrivateRoute';
import UserAuth from './pages/auth/UserSignUp';
import UserSignUp from './pages/auth/UserSignUp';
import UserSigin from './pages/auth/UserSignIn';
import ManageQr from './pages/dashboard/ManageQr';
import NavBar from './components/ui/NavBar';
import UserOrderBooking from './pages/landing/UserOrderBooking';
import ManageOrder from './pages/dashboard/ManageOrder';
import ContactUs from './pages/landing/ContactUs';
import Profile from './pages/dashboard/Profile';
import Invoice from './pages/dashboard/Invoice';
import EmployeeSignIn from './pages/auth/EmployeeSignIn';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeePrivateRoute from './components/routes/EmployeeRoute';
import EmployeeNavbar from './components/ui/EmployeeNavbar';
import EmployeeBooking from './pages/employee/EmployeeBooking';
import EmployeeReferral from './pages/employee/EmployeeReferral';
import EmpolyeeProfile from './pages/employee/EmpolyeeProfile';
import VendorPrivateRoute from './components/routes/VenodrRoutes';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorOrder from './pages/vendor/VendorOrder';
import VendorProfile from './pages/vendor/VendorProfile';
import VendorReferral from './pages/vendor/VendorReferral';



export default function App() {

  return (
    <>

      <BrowserRouter>
        <Routes>
          {/* Landing Route without Sidebar */}

          <Route path='/' element={<Home />} />
          <Route path='/contact' element={<ContactUs />} />

          {/* Auth Page (No Sidebar) */}
          <Route path='/admin-sign-in' element={<AdminSignIn />} />
          <Route path='/user-signup' element={<UserSignUp />} />
          <Route path="/user-signup/:referralType/:referralId" element={<UserSignUp />} />
          <Route path="/user-signin" element={<UserSigin />} />
          <Route path="/user-order-booking" element={<UserOrderBooking />} />


          {/* Employee Route */}
          <Route path="/employee/sign-in" element={<EmployeeSignIn />} />

          {/* Protected Route With Employee Navbar  */}
          <Route
            path='/employee/dashboard'
            element={
              <EmployeePrivateRoute>
                <EmployeeNavbar /><EmployeeDashboard />
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/all-booking'
            element={
              <EmployeePrivateRoute>
                <EmployeeNavbar /><EmployeeBooking />
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/profile'
            element={
              <EmployeePrivateRoute>
                <EmployeeNavbar /><EmpolyeeProfile />
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/referral'
            element={
              <EmployeePrivateRoute>
                <EmployeeNavbar /><EmployeeReferral />
              </EmployeePrivateRoute>
            }
          />

          {/* Vendor Page and Routes  */}
          <Route path="/vendor/sign-in" element={<EmployeeSignIn />} />
          {/* Protected Route With Vendor Navbar  */}
          <Route
            path='/vendor/dashboard'
            element={
              <VendorPrivateRoute>
                <EmployeeNavbar /><VendorDashboard />
              </VendorPrivateRoute>
            }
          />
          <Route
            path='/vendor/all-order'
            element={
              <VendorPrivateRoute>
                <EmployeeNavbar /><VendorOrder />
              </VendorPrivateRoute>
            }
          />
          <Route
            path='/vendor/profile'
            element={
              <VendorPrivateRoute>
                <EmployeeNavbar /><VendorProfile />
              </VendorPrivateRoute>
            }
          />
          <Route
            path='/vendor/referral'
            element={
              <VendorPrivateRoute>
                <EmployeeNavbar /><VendorReferral />
              </VendorPrivateRoute>
            }
          />



          {/* User Page  */}
          {/* <Route path='/user-dashboard' element={<NavBar />} /> */}


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
            path='/manage-order'
            element={
              <PrivateRoute>
                <Sidebar><ManageOrder /></Sidebar>
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
          <Route
            path='/manage-qr'
            element={
              <PrivateRoute>
                <Sidebar><ManageQr /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/invoice'
            element={
              <PrivateRoute>
                <Sidebar><Invoice /></Sidebar>
              </PrivateRoute>
            }
          />

          <Route
            path='/admin-profile'
            element={
              <PrivateRoute>
                <Sidebar><Profile /></Sidebar>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter >
    </>
  )
}
