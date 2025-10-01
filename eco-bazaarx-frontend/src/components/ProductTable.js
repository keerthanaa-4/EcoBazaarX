import React from "react";
import { Button, Table } from "react-bootstrap";

export default function ProductTable({ products, onEdit, onDelete }) {
  if (!products || products.length === 0) {
    return <p className="text-center text-success">No products found.</p>;
  }

  return (
    <Table striped bordered hover responsive className="shadow-sm">
      <thead style={{ background: "linear-gradient(90deg, #a8e6cf, #dcedc1)", color: "#2e7d32" }}>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Carbon Score</th>
          <th>Eco Label</th>
          <th>Stock</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} style={{ backgroundColor: "#f1f8e9" }}>
            <td>{product.name}</td>
            <td>{product.category}</td>
            <td>${Number(product.price)?.toFixed(2) || "0.00"}</td>
            <td>{product.carbon_score}</td>
            <td>{product.eco_label}</td>
            <td>
              {product.stock}
              {product.stock <= 5 && <span className="text-danger ms-2">Low!</span>}
            </td>
            <td>
              <Button
                variant="success"
                size="sm"
                className="me-2"
                style={{ borderRadius: "12px" }}
                onClick={() => onEdit(product)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                style={{ borderRadius: "12px" }}
                onClick={() => onDelete(product.id)}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
