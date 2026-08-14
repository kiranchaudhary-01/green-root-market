import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/cart/');
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/', { product: productId, quantity });
    setCart(data);
    return data;
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await api.patch(`/cart/items/${itemId}/`, { quantity });
    setCart(data);
    return data;
  };

  const removeItem = async (itemId) => {
    const { data } = await api.delete(`/cart/items/${itemId}/`);
    setCart(data);
    return data;
  };

  return (
    <CartContext.Provider
      value={{ cart, loading, refreshCart, addToCart, updateItem, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
