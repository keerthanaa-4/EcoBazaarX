import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const OrderTable = ({ orders, onUpdateStatus }) => {
  if (!orders || orders.length === 0) {
    return <p className="text-center mt-3 text-success">No orders found.</p>;
  }

  return (
    <div className="table-responsive mt-3">
      <table className="table table-striped table-bordered align-middle shadow-sm">
        <thead style={{ background: "linear-gradient(90deg, #a8e6cf, #dcedc1)", color: "#2e7d32" }}>
          <tr>
            <th>Order ID</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            const items = order.items || [];
            const orderTotal = items.reduce(
              (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
              0
            );

            return (
              <React.Fragment key={order.order_id}>
                {items.map((item, index) => (
                  <tr key={item.order_item_id || index} style={{ backgroundColor: "#f1f8e9" }}>
                    {index === 0 && <td rowSpan={items.length}>{order.order_id}</td>}
                    <td>{item.product_name ?? "No Product"}</td>
                    <td>{item.quantity ?? 0}</td>
                    <td>${(Number(item.price) || 0).toFixed(2)}</td>
                    {index === 0 && <td rowSpan={items.length}>${orderTotal.toFixed(2)}</td>}
                    {index === 0 && (
                      <td rowSpan={items.length}>
                        <span
                          className={`badge ${
                            order.status === "Pending"
                              ? "bg-warning text-dark"
                              : "bg-success"
                          }`}
                        >
                          {order.status ?? "Unknown"}
                        </span>
                      </td>
                    )}
                    {index === 0 && (
                      <td rowSpan={items.length}>
                        {order.status === "Pending" && (
                          <button
                            className="btn btn-success btn-sm"
                            style={{ borderRadius: "12px" }}
                            onClick={() => onUpdateStatus(order.order_id, "Approved")}
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
  );
};

export default OrderTable;
