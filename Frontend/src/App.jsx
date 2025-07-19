

import { Routes, Route } from "react-router-dom";
import { useState, createContext, useEffect } from "react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Home from "./components/Home";
import ServicesSection from "./components/ServicesSection";
import Cart from "./components/Cart";
import Payment from "./components/Payment";
import { CartProvider } from "./context/CartContext";
import PurchaseHistory from "./components/PurchaseHistory";
import "./styles/App.css";
import CGV from "./components/CGV";
import PrivacyPolicy from "./components/PrivacyPolicy";
import LegalNotice from "./components/LegalNotice";
// import ContactPage from "./components/ContactPage";
import ContactSection from "./components/ContactSection";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Création du contexte
const AuthContext = createContext(null);

function App() {
  // const [user, setUser] = useState(() => {
  //   const savedUser = localStorage.getItem("user");
  //   return savedUser ? JSON.parse(savedUser) : null;
  // });

  const [user, setUser] = useState(() => {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    console.error("Invalid JSON in localStorage for user:", e);
    localStorage.removeItem("user");
    return null;
  }
});


  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <CartProvider>
        <div className="app">
          <Navbar />
          <ToastContainer /> {/* ✅ Add here once */}
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
              <Route path="/politique-de-confidentialite" element={<PrivacyPolicy />} />
              <Route path="/mentions-legales" element={<LegalNotice />} />
              {/* <Route path="/contact" element={<ContactPage />} /> */}
          </Routes>
          </main>
        </div>
      </CartProvider>
    </AuthContext.Provider>
  );
}

// Exportez le contexte et le composant App séparément
export { AuthContext };
export default App;