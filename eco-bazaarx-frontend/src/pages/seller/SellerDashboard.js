import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import DashboardCards from "../../components/DashboardCards";
import ProductTable from "../../components/ProductTable";
import OrderTable from "../../components/OrderTable";
import ReviewsTable from "../../components/ReviewsTable";

const BASE_URL = "http://localhost:5000/api/seller";

export default function SellerDashboard() {
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const token = useRef(localStorage.getItem("token"));

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, productsData, ordersData, reviewsData] = await Promise.all([
          axios.get(`${BASE_URL}/stats`, { headers: { Authorization: `Bearer ${token.current}` } }).then(res => res.data).catch(() => ({})),
          axios.get(`${BASE_URL}/products`, { headers: { Authorization: `Bearer ${token.current}` } }).then(res => res.data).catch(() => []),
          axios.get(`${BASE_URL}/orders`, { headers: { Authorization: `Bearer ${token.current}` } }).then(res => res.data).catch(() => []),
          axios.get(`${BASE_URL}/reviews`, { headers: { Authorization: `Bearer ${token.current}` } }).then(res => res.data).catch(() => []),
        ]);

        setStats(statsData);
        setProducts(productsData);
        setOrders(ordersData);
        setReviews(reviewsData);
      } catch (err) {
        console.error("API fetch failed:", err);
      }
    };

    fetchData();
  }, []);

  // Open Add/Edit modal
  const handleEditProduct = (product = {}) => {
    setCurrentProduct(product);
    setShowModal(true);
  };

  // Save product
  const handleSaveProduct = async () => {
    const { id, name, category, price, carbon_score, eco_label, stock } = currentProduct;

    if (!name || !category || !price || !carbon_score || !eco_label || stock == null) {
      alert("All fields are required.");
      return;
    }

    const payload = { name, category, price: Number(price), carbon_score: Number(carbon_score), eco_label, stock: Number(stock) };
    setSaving(true);

    try {
      let savedProduct;

      if (id) {
        await axios.put(`${BASE_URL}/products/${id}`, payload, { headers: { Authorization: `Bearer ${token.current}` } });
        savedProduct = { ...currentProduct, ...payload };
        setProducts(prev => prev.map(p => (p.id === id ? savedProduct : p)));
      } else {
        const { data } = await axios.post(`${BASE_URL}/products`, payload, { headers: { Authorization: `Bearer ${token.current}` } });
        savedProduct = data;
        setProducts(prev => [...prev, savedProduct]);
      }

      setShowModal(false);
      setCurrentProduct({});
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save product. Check console.");
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${BASE_URL}/products/${id}`, { headers: { Authorization: `Bearer ${token.current}` } });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product.");
    }
  };

  // Update order status
  const handleUpdateOrder = async (orderId, status) => {
    try {
      await axios.put(`${BASE_URL}/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token.current}` } });
      setOrders(prev => prev.map(o => (o.order_id === orderId ? { ...o, status } : o)));
    } catch (err) {
      console.error("Order update failed:", err);
      alert("Failed to update order.");
    }
  };

  // Reply to review
  const handleReplyReview = async (reviewId, reply) => {
    try {
      await axios.put(`${BASE_URL}/reviews/${reviewId}/reply`, { reply }, { headers: { Authorization: `Bearer ${token.current}` } });
      setReviews(prev => prev.map(r => (r.id === reviewId ? { ...r, reply } : r)));
    } catch (err) {
      console.error("Reply failed:", err);
      alert("Failed to send reply.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-success">🌱 Seller Dashboard</h2>
      </div>

      {/* Dashboard Cards */}
      <DashboardCards stats={stats} products={products} />

      {/* Products */}
      <div className="mt-4 p-3 bg-light border rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4 className="text-success">Products</h4>
          <Button variant="success" onClick={() => handleEditProduct({})}>Add Product</Button>
        </div>
        <ProductTable products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
      </div>

      {/* Orders */}
      <div className="mt-4 p-3 bg-light border rounded shadow-sm">
        <h4 className="text-success mb-3">Orders</h4>
        <OrderTable orders={orders} onUpdateStatus={handleUpdateOrder} />
      </div>

      {/* Reviews */}
      <div className="mt-4 p-3 bg-light border rounded shadow-sm">
        <h4 className="text-success mb-3">Customer Reviews</h4>
        <ReviewsTable reviews={reviews} onReply={handleReplyReview} />
      </div>

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>{currentProduct?.id ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {["name","category","price","carbon_score","eco_label","stock"].map(field => (
              <Form.Group key={field} className="mb-2">
                <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1).replace("_"," ")}</Form.Label>
                <Form.Control
                  type={["price","carbon_score","stock"].includes(field) ? "number" : "text"}
                  value={currentProduct[field] ?? ""}
                  onChange={e => setCurrentProduct(prev => ({ ...prev, [field]: e.target.value }))}
                  step={field==="carbon_score"?"0.1":"0.01"}
                />
                {field==="stock" && Number(currentProduct.stock)<=5 && <small className="text-danger">Low stock!</small>}
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleSaveProduct} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
