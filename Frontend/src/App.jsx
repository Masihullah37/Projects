



import { Routes, Route } from "react-router-dom"
import { useState, createContext, useEffect } from "react"
import Navbar from "./components/Navbar"
import Login from "./components/Login"
import Signup from "./components/Signup"
import ForgotPassword from "./components/ForgotPassword"
import ResetPassword from "./components/ResetPassword"
import Home from "./components/Home"
import Services from "./components/ServicesSection"
import Cart from "./components/Cart"
import { CartProvider } from "./context/CartContext"
import "./styles/App.css"

export const AuthContext = createContext(null)

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user")
    return savedUser ? JSON.parse(savedUser) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  }, [user])

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
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </AuthContext.Provider>
  )
}

export default App






