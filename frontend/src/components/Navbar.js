import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) refreshCart();
  }, [isAuthenticated, refreshCart]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="brand">
          <span className="brand-mark">✦</span> Green Root Market
        </Link>
        <nav className="nav-links">
          <Link to="/products">Shop</Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders">Orders</Link>
              <Link to="/cart">
                Cart
                {cart && cart.total_items > 0 && (
                  <span className="cart-badge">{cart.total_items}</span>
                )}
              </Link>
              <span style={{ opacity: 0.7 }}>Hi, {user?.username}</span>
              <button className="btn btn-outline btn-sm" style={{ color: '#F3EEDD', borderColor: '#F3EEDD' }} onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn btn-gold btn-sm">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
