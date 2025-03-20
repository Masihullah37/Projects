

import { createContext, useState, useEffect, useContext } from "react"
import { AuthContext } from "../App"

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext)
  const [cartItems, setCartItems] = useState([])
  const [cartCount, setCartCount] = useState(0)

  // Load cart data when user changes (login/logout)
  useEffect(() => {
    if (user) {
      // If user is logged in, load their cart from localStorage
      const savedCart = localStorage.getItem(`cart_${user.id}`)
      setCartItems(savedCart ? JSON.parse(savedCart) : [])
    } else {
      // If user is logged out, clear the cart
      setCartItems([])
    }
  }, [user])

  // Save cart to localStorage and update cart count whenever it changes
  useEffect(() => {
    if (user) {
      // Only save cart if user is logged in
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems))
    }

    // Update cart count
    const count = cartItems.reduce((total, item) => total + item.quantity, 0)
    setCartCount(count)
  }, [cartItems, user])

  const addToCart = (product, quantity = 1) => {
    if (!user) return // Don't add to cart if user is not logged in

    setCartItems((prevItems) => {
      // Check if product already exists in cart
      const existingItemIndex = prevItems.findIndex((item) => item.id === product.id)

      if (existingItemIndex !== -1) {
        // Product exists, update quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        }
        return updatedItems
      } else {
        // Product doesn't exist, add new item
        return [...prevItems, { ...product, quantity }]
      }
    })
  }

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems((prevItems) => prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + Number.parseFloat(item.prix) * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartProvider



