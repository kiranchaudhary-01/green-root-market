import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const searchTerm = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchTerm);

  useEffect(() => {
    api.get('/categories/').then((res) => setCategories(res.data.results));
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (searchTerm) params.search = searchTerm;
    api
      .get('/products/', { params })
      .then((res) => setProducts(res.data.results))
      .finally(() => setLoading(false));
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (query) next.set('q', query);
    else next.delete('q');
    setSearchParams(next);
  };

  const selectCategory = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('category', slug);
    else next.delete('category');
    setSearchParams(next);
  };

  return (
    <div className="section container">
      <div className="section-head">
        <div>
          <h2>The full catalog</h2>
          <div className="section-sub">{products.length} plants growing right now</div>
        </div>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            className="field"
            style={{ padding: '10px 14px', borderRadius: 4, border: '1.5px solid #A9C2AB' }}
            placeholder="Search plants…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-sm" type="submit">Search</button>
        </form>
      </div>

      <div className="category-row">
        <button
          className={`category-pill ${!activeCategory ? 'active' : ''}`}
          onClick={() => selectCategory('')}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`category-pill ${activeCategory === c.slug ? 'active' : ''}`}
            onClick={() => selectCategory(c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>No plants matched your search.</h3>
          <p>Try a different category or search term.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
