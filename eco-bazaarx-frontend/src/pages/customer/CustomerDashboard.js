// src/pages/customer/CustomerDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const CustomerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewInput, setReviewInput] = useState({ product_id: "", rating: 5, comment: "" });

  const API_BASE = "http://localhost:5000/api/customer";

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchReviews();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/products`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/reviews`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.product_id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          carbon_score: product.carbon_score,
          eco_label: product.eco_label,
        },
      ]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const placeOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    try {
      await axios.post(
        `${API_BASE}/orders`,
        { products: cart },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Order placed successfully!");
      setCart([]);
      fetchOrders();
    } catch (err) {
      console.error("Error placing order:", err);
    }
  };

  const submitReview = async () => {
    if (!reviewInput.product_id || !reviewInput.comment) return alert("Fill all fields");
    try {
      await axios.post(`${API_BASE}/reviews`, reviewInput, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Review submitted!");
      setReviewInput({ product_id: "", rating: 5, comment: "" });
      fetchReviews();
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  // Carbon score badge
  const carbonBadge = (score) => {
    if (score <= 3) return <span className="badge bg-success">🌱 Low</span>;
    if (score <= 7) return <span className="badge bg-warning text-dark">⚠️ Medium</span>;
    return <span className="badge bg-danger">🔥 High</span>;
  };

  // Total carbon footprint
  const totalCarbon = cart.reduce((sum, item) => sum + item.carbon_score * item.quantity, 0);

  return (
    <div className="container-fluid min-vh-100 p-4" style={{ backgroundColor: "#e8f5e9" }}>
      <h2 className="text-success mb-4">🌍 EcoBazaar Customer Dashboard</h2>

      {/* PRODUCTS */}
      <h4 className="mt-4 mb-3">Products</h4>
      <div className="row">
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          products.map((p) => (
            <div key={p.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm border-success d-flex flex-column justify-content-between p-3" style={{ backgroundColor: "#f1f8e9" }}>
                <div>
                  <h5 className="card-title">
                    {p.name} {p.eco_label && <span className="badge bg-success ms-2">{p.eco_label}</span>}
                  </h5>
                  <p className="card-text mb-1">
                    Price: <strong>${p.price}</strong>
                  </p>
                  <p className="card-text mb-3">
                    Carbon Score: {carbonBadge(p.carbon_score)}
                  </p>
                </div>
                <button className="btn btn-outline-success mt-auto" onClick={() => addToCart(p)}>
                  ➕ Add to Cart
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CART */}
      <h4 className="mt-5 mb-3">🛒 Cart</h4>
      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <div className="table-responsive mb-3">
          <table className="table table-striped table-bordered">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Carbon Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.product_id}>
                  <td>
                    {item.name} {item.eco_label && <span className="badge bg-success">{item.eco_label}</span>}
                  </td>
                  <td>${item.price}</td>
                  <td>{item.quantity}</td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>{carbonBadge(item.carbon_score)}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.product_id)}>
                      ❌ Remove
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="4" className="text-end fw-bold">
                  🌱 Total Carbon Footprint:
                </td>
                <td className="fw-bold">{totalCarbon}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <button className="btn btn-success" onClick={placeOrder}>
            ✅ Place Order
          </button>
        </div>
      )}

      {/* ORDERS */}
      <h4 className="mt-5 mb-3">📦 Your Orders</h4>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.order_id} className="card mb-3 shadow-sm border-light" style={{ backgroundColor: "#f1f8e9" }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>
                Order ID: <strong>{order.order_id}</strong>
              </span>
              <span
                className={`badge ${
                  order.status === "Pending"
                    ? "bg-warning text-dark"
                    : order.status === "Approved"
                    ? "bg-success"
                    : "bg-secondary"
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="card-body table-responsive p-0">
              <table className="table mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Carbon Score</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.order_item_id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                      <td>{carbonBadge(item.carbon_score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* REVIEWS */}
      <h4 className="mt-5 mb-3">✍️ Submit a Review</h4>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <select
            className="form-select"
            value={reviewInput.product_id}
            onChange={(e) => setReviewInput({ ...reviewInput, product_id: e.target.value })}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <input
            type="number"
            min="1"
            max="5"
            className="form-control"
            placeholder="Rating"
            value={reviewInput.rating}
            onChange={(e) => setReviewInput({ ...reviewInput, rating: e.target.value })}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Comment (Was it eco-friendly?)"
            value={reviewInput.comment}
            onChange={(e) => setReviewInput({ ...reviewInput, comment: e.target.value })}
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" onClick={submitReview}>
            Submit
          </button>
        </div>
      </div>

      <h4 className="mt-4">📝 Your Reviews</h4>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul className="list-group mb-5">
          {reviews.map((r) => (
            <li key={r.id} className="list-group-item" style={{ backgroundColor: "#f1f8e9" }}>
              <strong>{r.product_name}</strong> - Rating: {r.rating} <br />
              Comment: {r.comment}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerDashboard;
