import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.username, form.password);
      navigate(location.state?.from?.pathname || '/products');
    } catch (err) {
      setError('Incorrect username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Welcome back</h2>
      <p className="form-sub">Log in to keep shopping and track your orders.</p>
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
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button className="btn btn-gold btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <div className="form-footnote">
        New here? <Link to="/register">Create an account</Link>
      </div>
    </div>
  );
}
