

// export default CartProvider

import { createContext, useState, useEffect, useContext } from "react";

import { AuthContext } from "./AuthContext"; 


// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

// eslint-disable-next-line react/prop-types
export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Load cart data when user changes (login/logout)
  useEffect(() => {
    if (user) {
      // If user is logged in, load their cart from localStorage
      const savedCart = localStorage.getItem(`cart_${user.id}`);
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    } else {
      // If user is logged out, clear the cart
      setCartItems([]);
    }
  }, [user]);

  // Save cart to localStorage and update cart count whenever it changes
  useEffect(() => {
    if (user) {
      // Only save cart if user is logged in
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));
    }

    // Update cart count
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  }, [cartItems, user]);

  // This addToCart only updates the local state. API call is handled in Home.jsx
  const addToCart = (product, quantity = 1) => {
    // No user check or toast here, as Home.jsx will handle authentication and API call.
    // This function is purely for updating the local cart state.
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === product.id);

      if (existingItemIndex !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    // TODO: Consider adding API call to remove from server-side cart as well
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
    // TODO: Consider adding API call to update quantity on server-side cart as well
  };

  const clearCart = () => {
    setCartItems([]);
    
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + Number.parseFloat(item.prix) * item.quantity, 0);
  };

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
  );
};

export default CartProvider;

