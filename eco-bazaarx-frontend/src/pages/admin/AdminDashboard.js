import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardCards from "../../components/DashboardCards";
import UserTable from "../../components/UserTable";
import ProductTable from "../../components/ProductTable";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); // Edit modal

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: statsData } = await axios.get(
        "http://localhost:5000/api/admin/stats",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(statsData);

      const { data: usersData } = await axios.get(
        "http://localhost:5000/api/admin/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(usersData);
      setPendingUsers(usersData.filter(u => u.status === "Pending"));

      const { data: productsData } = await axios.get(
        "http://localhost:5000/api/admin/products",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(productsData);

      const { data: ordersData } = await axios.get(
        "http://localhost:5000/api/admin/orders",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------- USER HANDLERS --------------------
  const handleApproveUser = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingUsers(prev => prev.filter(u => u.id !== id));
      setUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, status: "Approved" } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(u => u.id !== id));
      setPendingUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------- PRODUCT HANDLERS --------------------
  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product); // Open modal
  };

  const handleSaveProduct = async () => {
    try {
      const { id, name, category, price, carbon_score, eco_label, stock, seller_id } = editingProduct;
      await axios.put(
        `http://localhost:5000/api/admin/products/${id}`,
        { name, category, price, carbon_score, eco_label, stock, seller_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts(prev =>
        prev.map(p => (p.id === id ? editingProduct : p))
      );

      setEditingProduct(null);
      alert("Product updated successfully!");
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product");
    }
  };

  // -------------------- ORDER HANDLERS --------------------
  const handleApproveOrder = async (orderId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/orders/${orderId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(prev =>
        prev.map(o => (o.order_id === orderId ? { ...o, status: "Approved" } : o))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------- RENDER --------------------
  return (
    <div className="container mt-4">
      <h2 className="text-success mb-4">🌱 Admin Dashboard</h2>

      {/* Dashboard Cards */}
      <div className="mb-4">
        <DashboardCards stats={stats} />
      </div>

      {/* Users */}
      <div className="mt-4 p-3 bg-light border rounded shadow-sm">
        <h4 className="text-success mb-3">All Users</h4>
        <UserTable users={users} onDelete={handleDeleteUser} />
      </div>

      <div className="mt-4 p-3 bg-light border rounded shadow-sm">
        <h4 className="text-success mb-3">Pending Users</h4>
        <UserTable
          users={pendingUsers}
          onApprove={handleApproveUser}
          onDelete={handleDeleteUser}
        />
      </div>

      {/* Products */}
      <div className="mt-4 p-3 bg-light border rounded shadow-sm">
        <h4 className="text-success mb-3">Products</h4>
        <ProductTable
          products={products}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      </div>

      {/* Orders */}
      <div className="mt-4 p-3 bg-light border rounded shadow-sm">
        <h4 className="text-success mb-3">Orders</h4>
        {orders.length === 0 ? (
          <p className="text-center">No orders found.</p>
        ) : (
          <div className="table-responsive mt-3">
            <table className="table table-striped table-bordered align-middle">
              <thead className="table-success">
                <tr>
                  <th>Order ID</th>
                  <th>Customer ID</th>
                  <th>Products</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const orderTotal = order.items.reduce(
                    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
                    0
                  );

                  return (
                    <React.Fragment key={order.order_id}>
                      {order.items.map((item, index) => (
                        <tr key={item.order_item_id || index}>
                          {index === 0 && (
                            <>
                              <td rowSpan={order.items.length}>{order.order_id}</td>
                              <td rowSpan={order.items.length}>{order.customer_id}</td>
                            </>
                          )}
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>${item.price.toFixed(2)}</td>
                          {index === 0 && <td rowSpan={order.items.length}>${orderTotal.toFixed(2)}</td>}
                          {index === 0 && (
                            <td rowSpan={order.items.length}>
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
                            </td>
                          )}
                          {index === 0 && (
                            <td rowSpan={order.items.length}>
                              {order.status === "Pending" && (
                                <button
                                  onClick={() => handleApproveOrder(order.order_id)}
                                  className="btn btn-success btn-sm"
                                >
                                  Approve
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* -------------------- EDIT PRODUCT MODAL -------------------- */}
      {editingProduct && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-success">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Edit Product</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setEditingProduct(null)}
                ></button>
              </div>
              <div className="modal-body">
                {["name", "category", "price", "carbon_score", "eco_label", "stock", "seller_id"].map(field => (
                  <input
                    key={field}
                    type={field.includes("price") || field.includes("stock") || field.includes("carbon_score") ? "number" : "text"}
                    className="form-control mb-2 border-success"
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")}
                    value={editingProduct[field]}
                    onChange={e =>
                      setEditingProduct({ ...editingProduct, [field]: e.target.value })
                    }
                  />
                ))}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditingProduct(null)}>Cancel</button>
                <button className="btn btn-success" onClick={handleSaveProduct}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
