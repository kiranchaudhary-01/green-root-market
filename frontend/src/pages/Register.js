import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/products');
    } catch (err) {
      const data = err.response?.data;
      const firstError = data && Object.values(data)[0];
      setError(Array.isArray(firstError) ? firstError[0] : 'Could not create your account. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Create your account</h2>
      <p className="form-sub">Join Green Root Market to shop and track orders.</p>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button className="btn btn-gold btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <div className="form-footnote">
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}
