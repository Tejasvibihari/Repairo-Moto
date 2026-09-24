import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"


import Home from './pages/landing/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Sidebar from './components/ui/Sidebar';
import BikeModel from './pages/dashboard/BikeModel';
import ManageEmployee from './pages/dashboard/ManageEmployee';

import AddBlog from './pages/dashboard/AddBlog';
import ManageBlog from './pages/dashboard/ManageBlog';
import ManageVendor from './pages/dashboard/ManageVendor';
import AdminSignIn from './pages/auth/AdminSignIn';
import PrivateRoute from './components/routes/PrivateRoute';
import ManageQr from './pages/dashboard/ManageQr';

import ManageOrder from './pages/dashboard/ManageOrder';
import ManualInvoice from './pages/dashboard/ManualInvoice';
import CreateManualInvoice from './pages/dashboard/CreateManualInvoice';
import ManualInvoiceDetail from './pages/dashboard/ManualInvoiceDetail';
import AppVersion from './pages/dashboard/AppVersion';
import ContactUs from './pages/landing/ContactUs';
import Profile from './pages/dashboard/Profile';
import EmployeeSignIn from './pages/auth/EmployeeSignIn';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeePrivateRoute from './components/routes/EmployeeRoute';
import EmployeeBooking from './pages/employee/EmployeeBooking';
import EmployeeReferral from './pages/employee/EmployeeReferral';
import EmpolyeeProfile from './pages/employee/EmpolyeeProfile';
import VendorPrivateRoute from './components/routes/VenodrRoutes';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorOrder from './pages/vendor/VendorOrder';
import VendorProfile from './pages/vendor/VendorProfile';
import VendorReferral from './pages/vendor/VendorReferral';
import VendorSignIn from './pages/auth/VendorSignIn';
import EmployeeSidebar from './components/ui/EmployeeSidebar';
import VendorSidebar from './components/ui/VendorSidebar';
import EmployeeBikeModel from './pages/employee/EmployeeBikeModel';
import EmployeeManageOrder from './pages/employee/EmployeeManageOrder';
import EmployeeManageVendor from './pages/employee/EmployeeManageVendor';
import EmployeeAddBlog from './pages/employee/EmployeeAddBlog';
import EmployeeManageBlog from './pages/employee/EmployeeManageBlog';
import EmployeeManageQr from './pages/employee/EmployeeManageQr';
import EmployeeInvoice from './pages/employee/EmployeeInvoice';
import AboutUs from './pages/landing/AboutUs';
import Blog from './pages/landing/Blog';
import BlogDetail from './pages/landing/BlogDetail';
import Gallery from './pages/landing/Gallery';
import Services from './pages/landing/Service';
import GenerateInvoiceForm from './components/GenerateInvoiceForm';
import InvoiceTemplate from './components/InvoiceTemplate';
import Terms from './pages/landing/Terms';
import ReferralEarning from './pages/landing/ReferralEarning';
import PrivacyPolicy from './pages/landing/PrivacyPolicy';
import RefundPolicy from './pages/landing/RefundPolicy';
import WarrantyPolicy from './pages/landing/WarrantyPolicy';
import ServiceFulfillmentPolicy from './pages/landing/ServiceFulfillmentPolicy';
import ReferralRewardsPolicy from './pages/landing/ReferralRewardsPolicy';
import OTPVerificationPolicy from './pages/landing/OTPVerificationPolicy';
import VehicleImageCapturePolicy from './pages/landing/VehicleImageCapturePolicy';
import LiabilityDamageClaimsPolicy from './pages/landing/LiabilityDamageClaimsPolicy';
import DataDeletionPolicy from './pages/landing/DataDeletionPolicy';
import CookiePolicy from './pages/landing/CookiePolicy';
import AccountDeletion from './pages/landing/AccountDeletion';
import AllUser from './pages/dashboard/AllUser';
import EmployeeAllUser from './pages/employee/EmployeeAllUser';
import EmployeeEditBlog from './pages/employee/EmployeeEditBlog';
import EmployeeDetail from './pages/dashboard/EmployeeDetail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Referral from './pages/dashboard/Referral';
import DetailReferral from './pages/dashboard/DetailReferral';
import ManageServiceArea from './pages/dashboard/ManageServiceArea';
import AppUi from './pages/dashboard/AppUi'


export default function App() {

  return (
    <>

      <BrowserRouter>
        <Routes>
          {/* Landing Route without Sidebar */}

          <Route path='/' element={<Home />} />
          <Route path='/contact' element={<ContactUs />} />
          <Route path='/about' element={<AboutUs />} />
          <Route path='/blog' element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path='/gallery' element={<Gallery />} />
          <Route path='/services' element={<Services />} />
          <Route path='/terms' element={<Terms />} />
          <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          <Route path='/refund-policy' element={<RefundPolicy />} />
          <Route path='/warranty-policy' element={<WarrantyPolicy />} />
          <Route path='/service-fulfillment-policy' element={<ServiceFulfillmentPolicy />} />
          <Route path='/referral-rewards-policy' element={<ReferralRewardsPolicy />} />
          <Route path='/otp-verification-policy' element={<OTPVerificationPolicy />} />
          <Route path='/vehicle-image-capture-policy' element={<VehicleImageCapturePolicy />} />
          <Route path='/liability-damage-claims-policy' element={<LiabilityDamageClaimsPolicy />} />
          <Route path='/data-deletion-policy' element={<DataDeletionPolicy />} />
          <Route path='/cookie-policy' element={<CookiePolicy />} />
          <Route path='/account-delete' element={<AccountDeletion />} />
          <Route path='/referral' element={<ReferralEarning />} />

          {/* Auth Page (No Sidebar) */}
          <Route path='/admin-sign-in' element={<AdminSignIn />} />
          {/* Users book and sign in from the mobile app now. The only user-facing
              web flow left is updating a password via the emailed reset link. */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:userType/:token" element={<ResetPassword />} />

          <Route path="/order/invoice/:id" element={<InvoiceTemplate />} />


          {/* Employee Route */}
          <Route path="/employee/sign-in" element={<EmployeeSignIn />} />

          {/* Protected Route With Employee Navbar  */}
          <Route
            path='/employee/dashboard'
            element={
              <EmployeePrivateRoute>
                <EmployeeSidebar>
                  <EmployeeDashboard />
                </EmployeeSidebar>
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/all-booking'
            element={
              <EmployeePrivateRoute>
                <EmployeeSidebar>
                  <EmployeeBooking />
                </EmployeeSidebar>
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/profile'
            element={
              <EmployeePrivateRoute>
                <EmployeeSidebar>
                  <EmpolyeeProfile />
                </EmployeeSidebar>
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/referral'
            element={
              <EmployeePrivateRoute>
                <EmployeeSidebar>
                  <EmployeeReferral />
                </EmployeeSidebar>
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/model'
            element={
              <EmployeePrivateRoute>
                <EmployeeSidebar><EmployeeBikeModel /></EmployeeSidebar>
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/manage-order'
            element={
              <EmployeePrivateRoute>
                <EmployeeSidebar><EmployeeManageOrder /></EmployeeSidebar>
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/manage-vendor'
            element={
              <EmployeePrivateRoute>
                <EmployeeSidebar><EmployeeManageVendor /></EmployeeSidebar>
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/add-blog'
            element={
              <EmployeePrivateRoute>
                <EmployeeSidebar><EmployeeAddBlog /></EmployeeSidebar>
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/edit-blog/:id'
            element={
              <EmployeePrivateRoute>
                <EmployeeSidebar><EmployeeEditBlog /></EmployeeSidebar>
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/manage-blog'
            element={
              <EmployeePrivateRoute>
                <EmployeeSidebar><EmployeeManageBlog /></EmployeeSidebar>
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/manage-qr'
            element={
              <EmployeePrivateRoute>
                <EmployeeSidebar><EmployeeManageQr /></EmployeeSidebar>
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/all-user'
            element={
              <EmployeePrivateRoute>
                <EmployeeSidebar><EmployeeAllUser /></EmployeeSidebar>
              </EmployeePrivateRoute>
            }
          />
          <Route
            path='/employee/invoice'
            element={
              <EmployeePrivateRoute>
                <EmployeeSidebar><EmployeeInvoice /></EmployeeSidebar>
              </EmployeePrivateRoute>
            }
          />


          {/* Vendor Page and Routes  */}
          <Route path="/vendor/sign-in" element={<VendorSignIn />} />
          {/* Protected Route With Vendor Navbar  */}
          <Route
            path='/vendor/dashboard'
            element={
              <VendorPrivateRoute>
                <VendorSidebar>
                  <VendorDashboard />
                </VendorSidebar >
              </VendorPrivateRoute>
            }
          />
          <Route
            path='/vendor/all-order'
            element={
              <VendorPrivateRoute>
                <VendorSidebar>
                  <VendorOrder />
                </VendorSidebar>
              </VendorPrivateRoute>
            }
          />
          <Route
            path='/vendor/profile'
            element={
              <VendorPrivateRoute>
                <VendorSidebar>
                  <VendorProfile />
                </VendorSidebar>
              </VendorPrivateRoute>
            }
          />
          <Route
            path='/vendor/referral'
            element={
              <VendorPrivateRoute>
                <VendorSidebar>
                  <VendorReferral />
                </VendorSidebar>
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
            path='/manage-service-area'
            element={
              <PrivateRoute>
                <Sidebar><ManageServiceArea /></Sidebar>
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
            path='/all-user'
            element={
              <PrivateRoute>
                <Sidebar><AllUser /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/manage-referral'
            element={
              <PrivateRoute>
                <Sidebar><Referral /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/admin-app-ui'
            element={
              <PrivateRoute>
                <Sidebar><AppUi /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/detail-manage-referral/:userId'
            element={
              <PrivateRoute>
                <Sidebar><DetailReferral /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/app-version'
            element={
              <PrivateRoute>
                <Sidebar><AppVersion /></Sidebar>
              </PrivateRoute>
            }
          />

          {/* Manual invoicing — replaces the old manual order booking flow */}
          <Route
            path='/manual-invoice'
            element={
              <PrivateRoute>
                <Sidebar><ManualInvoice /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/manual-invoice/create'
            element={
              <PrivateRoute>
                <Sidebar><CreateManualInvoice /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/manual-invoice/:id'
            element={
              <PrivateRoute>
                <Sidebar><ManualInvoiceDetail /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/manual-invoice/:id/edit'
            element={
              <PrivateRoute>
                <Sidebar><CreateManualInvoice /></Sidebar>
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
          <Route
            path='/generate-invoice-form/:id'
            element={
              <PrivateRoute>
                <Sidebar><GenerateInvoiceForm /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/employee-detail/:id'
            element={
              <PrivateRoute>
                <Sidebar><EmployeeDetail /></Sidebar>
              </PrivateRoute>
            }
          />
          <Route
            path='/admin-app-ui'
            element={
              <PrivateRoute>
                <Sidebar><AppUi /></Sidebar>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter >
    </>
  )
}
