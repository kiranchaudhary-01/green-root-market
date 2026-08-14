import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const items = cart?.items || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/orders/checkout/', {
        shipping_address: address,
        contact_phone: phone,
      });
      await refreshCart();
      navigate('/orders');
    } catch (err) {
      const data = err.response?.data;
      setError(
        (Array.isArray(data) ? data[0] : data?.detail || data?.non_field_errors?.[0]) ||
        'Something went wrong placing your order. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="empty-state container">
        <h3>Your cart is empty.</h3>
        <p>Add a few plants before checking out.</p>
      </div>
    );
  }

  return (
    <div className="section container">
      <div className="two-col">
        <div className="form-card" style={{ margin: 0 }}>
          <h2>Delivery details</h2>
          <p className="form-sub">Where should we plant these roots?</p>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="address">Shipping address</label>
              <textarea
                id="address"
                rows={4}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House no., street, city, PIN code"
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Contact phone (optional)</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <button className="btn btn-gold btn-block" type="submit" disabled={submitting}>
              {submitting ? 'Placing order…' : 'Place order'}
            </button>
          </form>
        </div>

        <div className="cart-summary">
          <h3>Order summary</h3>
          {items.map((item) => (
            <div className="order-item-row" key={item.id}>
              <span>{item.quantity} × {item.product_detail.name}</span>
              <span>₹{Number(item.subtotal).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₹{Number(cart.total_price).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
