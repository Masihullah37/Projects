

 
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Home from "./components/Home";
import ServicesSection from "./components/ServicesSection";
import Cart from "./components/Cart";
import Payment from "./components/Payment";
import PurchaseHistory from "./components/PurchaseHistory";
import CGV from "./components/CGV";
import PrivacyPolicy from "./components/PrivacyPolicy";
import LegalNotice from "./components/LegalNotice";
import ContactSection from "./components/ContactSection";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./styles/App.css";

function App() {
  return (
    // Wrap the entire application in AuthProvider
    <AuthProvider>
      <CartProvider>
        <div className="app">
          <Navbar />
          <ToastContainer />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/services" element={<ServicesSection />} />
              <Route path="/contact" element={<ContactSection />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/purchase-history" element={<PurchaseHistory />} />
              <Route path="/conditions-generales-de-vente" element={<CGV />} />
              <Route
                path="/politique-de-confidentialite"
                element={<PrivacyPolicy />}
              />
              <Route path="/mentions-legales" element={<LegalNotice />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
