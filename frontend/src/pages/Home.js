import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products/?ordering=-created_at'),
      api.get('/categories/'),
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data.results.slice(0, 8));
        setCategories(catRes.data.results);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="eyebrow">Potted &amp; Ready to Ship</span>
            <h1>Bring living green into every room.</h1>
            <p>
              Hand-picked houseplants, succulents, and kitchen herbs — grown by
              small nurseries, packed with care, and delivered to your door.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-gold">Shop the catalog</Link>
              <Link to="/products?category=indoor-plants" className="btn btn-outline" style={{ color: '#F3EEDD', borderColor: '#F3EEDD' }}>
                Indoor plants
              </Link>
            </div>
          </div>
          <div className="hero-tag">
            <h3>🌱 Care Tag — Golden Pothos</h3>
            <div className="hero-tag-row"><span>Light</span><span>Low–Bright, indirect</span></div>
            <div className="hero-tag-row"><span>Water</span><span>Every 7–10 days</span></div>
            <div className="hero-tag-row"><span>Difficulty</span><span>Easy</span></div>
            <div className="hero-tag-row"><span>Pet safe</span><span>No</span></div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <h2>Shop by category</h2>
            <div className="section-sub">Find the right plant for your space.</div>
          </div>
        </div>
        <div className="category-row">
          {categories.map((c) => (
            <Link key={c.id} to={`/products?category=${c.slug}`} className="category-pill">
              {c.name} · {c.product_count}
            </Link>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <h2>Newly potted</h2>
            <div className="section-sub">Fresh arrivals from our growers.</div>
          </div>
          <Link to="/products" className="btn btn-outline btn-sm">View all</Link>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="product-grid">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
