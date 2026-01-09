import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";


import Home from "./pages/Home";
import Delivery from "./pages/Delivery";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrderForm from "./pages/OrderForm";
import Success from "./pages/Success";
import TrackOrder from "./pages/TrackOrder";
import ForgotPassword from "./pages/ForgotPassword";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import FindOrder from "./pages/FindOrder";
import PaymentPage from "./pages/PaymentPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PrinterDashboard from "./pages/PrinterDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import Cart from "./pages/Cart";
import PrintOrder from "./pages/PrintOrder";
import Notifications from "./pages/Notifications";
import VerifyEmailOtp from "./pages/VerifyEmailOtp";
import Services from "./pages/Services";
import TshirtPrint from "./pages/TshirtPrint";
import MugPrint from "./pages/MugPrint";
import PhotoFrame from "./pages/PhotoFrame";
import ContactSupport from "./pages/ContactSupport";
import AdminComplaints from "./pages/AdminComplaints";
import AdminPromotions from "./pages/AdminPromotions";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import OrderDetails from "./pages/OrderDetails";


import PrinterLogin from "./pages/PrinterLogin";
import DeliveryLogin from "./pages/DeliveryLogin";


import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import StaffRoute from "./components/StaffRoute";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmailOtp />} />
        <Route path="/services" element={<Services />} />
        <Route path="/tshirt-print" element={<TshirtPrint />} />
        <Route path="/mug-print" element={<MugPrint />} />
        <Route path="/photo-frame" element={<PhotoFrame />} />
        <Route path="/contact-support" element={<ContactSupport />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/find-order" element={<FindOrder />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
        <Route path="/order/:orderId" element={<OrderDetails />} />

        
        <Route
          path="/order"
          element={
            <ProtectedRoute>
              <OrderForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/success/:orderId"
          element={
            <ProtectedRoute>
              <Success />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/delivery"
          element={
            <ProtectedRoute>
              <Delivery />
            </ProtectedRoute>
          }
        />

        <Route
          path="/print"
          element={
            <ProtectedRoute>
              <PrintOrder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        
        <Route path="/admin-login" element={<AdminLogin />} />

        
        <Route path="/printer-login" element={<PrinterLogin />} />
        <Route path="/delivery-login" element={<DeliveryLogin />} />

        
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin-complaints"
          element={
            <AdminRoute>
              <AdminComplaints />
            </AdminRoute>
          }
        />

        <Route
          path="/admin-promotions"
          element={
            <AdminRoute>
              <AdminPromotions />
            </AdminRoute>
          }
        />

        
        <Route
          path="/printer-dashboard"
          element={
            <StaffRoute allowedRoles={["printer"]}>
              <PrinterDashboard />
            </StaffRoute>
          }
        />

        <Route
          path="/delivery-dashboard"
          element={
            <StaffRoute allowedRoles={["delivery"]}>
              <DeliveryDashboard />
            </StaffRoute>
          }
        />
      </Routes>
    </>
  );
}
