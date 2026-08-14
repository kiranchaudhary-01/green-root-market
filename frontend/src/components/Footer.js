import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        Green Root Market — grown with care. © {new Date().getFullYear()}
      </div>
    </footer>
  );
}
