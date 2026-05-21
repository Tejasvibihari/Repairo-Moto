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

import UserOrderBooking from './pages/landing/UserOrderBooking';
import ManageOrder from './pages/dashboard/ManageOrder';
import ContactUs from './pages/landing/ContactUs';
import Profile from './pages/dashboard/Profile';
import Invoice from './pages/dashboard/Invoice';
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
import EmployeeAdminBookingForm from './pages/employee/EmployeeAdminBookingForm';
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
import UserDashboard from './pages/user/UserDashboard';
import UserPrivateRoute from './components/routes/UserPrivateRoute';
import UserQrCode from './pages/user/UserQrCode';
import UserAllBooking from './pages/user/UserAllBooking';
import UserBookingDetail from './pages/user/UserBookingDetail';
import MyReferral from './pages/user/MyReferral';
import UserProfile from './pages/user/UserProfile';
import AllUser from './pages/dashboard/AllUser';
import EmployeeAllUser from './pages/employee/EmployeeAllUser';
import EmployeeEditBlog from './pages/employee/EmployeeEditBlog';
import EmployeeDetail from './pages/dashboard/EmployeeDetail';
import AddBikeProfile from './pages/user/AddBikeProfile';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Referral from './pages/dashboard/Referral';
import DetailReferral from './pages/dashboard/DetailReferral';
import OrderBooking from './pages/landing/OrderBooking';
import ManageServiceArea from './pages/dashboard/ManageServiceArea';



export default function App() {

  return (
    <>

      <BrowserRouter>
        <Routes>
          {/* Landing Route without Sidebar */}

          <Route path='/booking/:cpn' element={<OrderBooking />} />
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
          <Route path='/referral' element={<ReferralEarning />} />

          {/* Auth Page (No Sidebar) */}
          <Route path='/admin-sign-in' element={<AdminSignIn />} />
          <Route path='/user-signup' element={<UserSignUp />} />
          <Route path="/user-signup/:referralType/:referralId" element={<UserSignUp />} />
          {/* <Route path="/user-signin" element={<UserSigin />} /> */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:userType/:token" element={<ResetPassword />} />

          <Route path="/order/invoice/:id" element={<InvoiceTemplate />} />


          {/* User Private Routes Started  */}
          {/* <Route path="/user/dashboard" element={
            <UserPrivateRoute>
              <UserDashboard />
            </UserPrivateRoute>
          }
          />
          <Route path="/user-order-booking" element={<UserPrivateRoute>
            <UserOrderBooking />
          </UserPrivateRoute>} />

          <Route path="/user-qrcode" element={<UserPrivateRoute>
            <UserQrCode />
          </UserPrivateRoute>} />
          <Route path="/user-allbooking" element={
            <UserPrivateRoute>
              <UserAllBooking />
            </UserPrivateRoute>} />
          <Route path="/user-booking/:id" element={<UserPrivateRoute>
            <UserBookingDetail />
          </UserPrivateRoute>} />
          <Route path="/user-referral" element={<UserPrivateRoute>
            <MyReferral />
          </UserPrivateRoute>} />
          <Route path="/user/profile" element={<UserPrivateRoute>
            <UserProfile />
          </UserPrivateRoute>} />
          <Route path="/user/add-bike-profile" element={<UserPrivateRoute>
            <AddBikeProfile />
          </UserPrivateRoute>} /> */}





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
            path='/employee/admin-order-form'
            element={
              <EmployeePrivateRoute>
                <EmployeeSidebar><EmployeeAdminBookingForm /></EmployeeSidebar>
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
            path='/detail-manage-referral/:userId'
            element={
              <PrivateRoute>
                <Sidebar><DetailReferral /></Sidebar>
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
        </Routes>
      </BrowserRouter >
    </>
  )
}
