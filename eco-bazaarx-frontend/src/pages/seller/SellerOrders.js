import React, { useEffect, useState } from "react";
import axios from "../../api/axiosConfig";
import { Button } from "react-bootstrap";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/seller/orders", { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await axios.put(`/seller/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(orders.map(o => (o.id === orderId ? { ...o, status } : o)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">My Orders</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Order ID</th>
            <th className="border p-2">Customer</th>
            <th className="border p-2">Products</th>
            <th className="border p-2">Total Amount</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td className="border p-2">{order.id}</td>
              <td className="border p-2">{order.customerName}</td>
              <td className="border p-2">
                {order.products.map(p => `${p.name} (${p.quantity})`).join(", ")}
              </td>
              <td className="border p-2">₹{order.totalAmount}</td>
              <td className="border p-2">{order.status}</td>
              <td className="border p-2 flex gap-2">
                {order.status !== "Shipped" && (
                  <Button size="sm" variant="success" onClick={() => handleUpdateStatus(order.id, "Shipped")}>
                    Mark Shipped
                  </Button>
                )}
                {order.status !== "Cancelled" && (
                  <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(order.id, "Cancelled")}>
                    Cancel
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyOrders;
