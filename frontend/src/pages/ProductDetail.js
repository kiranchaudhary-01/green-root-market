import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CARE_LABEL = { easy: 'Easy', moderate: 'Moderate', expert: 'Expert' };

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('');
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}/`)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await addToCart(product.id, quantity);
    setStatus(`Added ${quantity} to your cart.`);
    setTimeout(() => setStatus(''), 2500);
  };

  if (loading) return <Loader />;
  if (!product) {
    return (
      <div className="empty-state container">
        <h3>We couldn't find that plant.</h3>
        <Link to="/products" className="btn btn-outline">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="section container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
        <div className="tag-visual" style={{ height: 380, borderRadius: 10 }}>
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <span style={{ fontSize: '5rem' }} aria-hidden="true">🌿</span>
          )}
        </div>
        <div>
          <span className="badge" style={{ background: '#EFEAD8', color: '#6B4A34' }}>
            {CARE_LABEL[product.care_level]} care
          </span>
          <h1 style={{ marginTop: 12 }}>{product.name}</h1>
          <div className="section-sub" style={{ marginBottom: 16 }}>{product.category_name}</div>
          <div className="tag-price" style={{ fontSize: '1.6rem', marginBottom: 16 }}>
            ₹{Number(product.price).toFixed(2)}
          </div>
          <p style={{ lineHeight: 1.6, color: '#23291F' }}>{product.description}</p>

          <div style={{ margin: '20px 0' }}>
            {product.in_stock ? (
              <span style={{ color: '#16301F', fontWeight: 600 }}>
                In stock — {product.stock} available
              </span>
            ) : (
              <span style={{ color: '#A6402E', fontWeight: 600 }}>Out of stock</span>
            )}
          </div>

          {product.in_stock && (
            <div className="qty-control" style={{ marginBottom: 18 }}>
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span style={{ fontFamily: 'var(--font-mono)', minWidth: 24, textAlign: 'center' }}>{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
            </div>
          )}

          <button className="btn btn-gold" disabled={!product.in_stock} onClick={handleAdd}>
            {product.in_stock ? 'Add to cart' : 'Out of stock'}
          </button>
          {status && <div style={{ marginTop: 12, color: '#16301F' }}>{status}</div>}
        </div>
      </div>
    </div>
  );
}
