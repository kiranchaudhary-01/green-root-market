import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';

export default function Cart() {
  const { cart, loading, refreshCart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  if (loading && !cart) return <Loader />;

  const items = cart?.items || [];

  return (
    <div className="section container">
      <h2>Your cart</h2>

      {items.length === 0 ? (
        <div className="empty-state">
          <h3>Your cart is empty.</h3>
          <p>Nothing potted up yet — go find something green.</p>
          <Link to="/products" className="btn btn-gold" style={{ marginTop: 16 }}>Browse plants</Link>
        </div>
      ) : (
        <div className="two-col">
          <div>
            {items.map((item) => (
              <div className="cart-row" key={item.id}>
                <div className="cart-thumb">
                  {item.product_detail.image ? (
                    <img src={item.product_detail.image} alt={item.product_detail.name} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.6rem' }}>🌿</div>
                  )}
                </div>
                <div>
                  <strong>{item.product_detail.name}</strong>
                  <div className="section-sub">₹{Number(item.product_detail.price).toFixed(2)} each</div>
                </div>
                <div className="qty-control">
                  <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}>−</button>
                  <span style={{ fontFamily: 'var(--font-mono)', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateItem(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product_detail.stock}
                  >
                    +
                  </button>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tag-price" style={{ fontSize: '1rem' }}>₹{Number(item.subtotal).toFixed(2)}</div>
                  <button
                    className="btn btn-sm btn-outline"
                    style={{ marginTop: 8, borderColor: '#A6402E', color: '#A6402E' }}
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order summary</h3>
            <div className="summary-row">
              <span>Items</span>
              <span>{cart.total_items}</span>
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{Number(cart.total_price).toFixed(2)}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{Number(cart.total_price).toFixed(2)}</span>
            </div>
            <button className="btn btn-gold btn-block" style={{ marginTop: 14 }} onClick={() => navigate('/checkout')}>
              Proceed to checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
