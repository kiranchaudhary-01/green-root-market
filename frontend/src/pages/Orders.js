import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/')
      .then((res) => setOrders(res.data.results ?? res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="section container">
      <h2>Your orders</h2>
      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet.</h3>
          <Link to="/products" className="btn btn-gold" style={{ marginTop: 16 }}>Start shopping</Link>
        </div>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-head">
              <div>
                <strong>Order #{order.id}</strong>
                <span className="section-sub" style={{ marginLeft: 10 }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
              <span className={`badge badge-status-${order.status}`}>{order.status}</span>
            </div>
            {order.items.map((item) => (
              <div className="order-item-row" key={item.id}>
                <span>{item.quantity} × {item.product_name}</span>
                <span>₹{Number(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{Number(order.total_price).toFixed(2)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
