

import { Routes, Route } from "react-router-dom";
import { useState, createContext, useEffect } from "react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Home from "./components/Home";
import Services from "./components/ServicesSection";
import Cart from "./components/Cart";
import Payment from "./components/Payment";
import { CartProvider } from "./context/CartContext";
import PurchaseHistory from "./components/PurchaseHistory";
import "./styles/App.css";

// Création du contexte
const AuthContext = createContext(null);

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
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
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/purchase-history" element={<PurchaseHistory />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
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






