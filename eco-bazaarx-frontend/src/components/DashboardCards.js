import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faStore, faBox, faShoppingCart } from "@fortawesome/free-solid-svg-icons";

export default function DashboardCards({ stats }) {
  const cards = [
    { title: "Users", value: stats.totalUsers, icon: <FontAwesomeIcon icon={faUser} size="2x" /> },
    { title: "Sellers", value: stats.totalSellers, icon: <FontAwesomeIcon icon={faStore} size="2x" /> },
    { title: "Products", value: stats.totalProducts, icon: <FontAwesomeIcon icon={faBox} size="2x" /> },
    { title: "Orders", value: stats.totalOrders, icon: <FontAwesomeIcon icon={faShoppingCart} size="2x" /> },
  ];

  return (
    <div className="row mb-4">
      {cards.map((c, i) => (
        <div className="col-md-3 mb-3" key={i}>
          <div
            className="card text-center text-white shadow-sm"
            style={{
              background: "linear-gradient(135deg, #a8e6cf, #4caf50)",
              borderRadius: "15px",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
          >
            <div className="card-body d-flex flex-column align-items-center">
              <div className="mb-2">{c.icon}</div>
              <h5 className="card-title">{c.title}</h5>
              <p className="card-text fs-4 fw-bold">{c.value || 0}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
