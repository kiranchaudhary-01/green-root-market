import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty-state container">
      <h2>Page not found</h2>
      <p>This path hasn't been planted yet.</p>
      <Link to="/" className="btn btn-gold" style={{ marginTop: 16 }}>Back home</Link>
    </div>
  );
}
