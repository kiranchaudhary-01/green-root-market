import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CARE_LABEL = { easy: 'Easy Care', moderate: 'Moderate', expert: 'Expert' };

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link to={`/products/${product.slug}`} className="plant-tag">
      <span className="tag-hole" />
      <span className="tag-stamp">{CARE_LABEL[product.care_level] || 'Easy'}</span>
      <div className="tag-visual">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <span style={{ fontSize: '2.2rem' }} aria-hidden="true">🌿</span>
        )}
      </div>
      <h3>{product.name}</h3>
      <div className="tag-meta">{product.category_name}</div>
      <div className="tag-price">₹{Number(product.price).toFixed(2)}</div>
      <div className="tag-actions">
        <button
          className="btn btn-block btn-sm"
          onClick={handleAdd}
          disabled={!product.in_stock || adding}
        >
          {!product.in_stock ? 'Out of stock' : adding ? 'Adding…' : 'Add to cart'}
        </button>
      </div>
    </Link>
  );
}
