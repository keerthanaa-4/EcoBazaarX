import React from "react";

export default function SellerTable({ sellers, onApprove, onDelete }) {
  return (
    <table className="table table-bordered mt-2">
      <thead className="table-light">
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sellers.map(s => (
          <tr key={s.id}>
            <td>{s.name}</td>
            <td>{s.email}</td>
            <td>{s.status}</td>
            <td>
              {onApprove && s.status !== "Approved" && (
                <button className="btn btn-sm btn-success me-2" onClick={() => onApprove(s.id)}>Approve</button>
              )}
              {onDelete && (
                <button className="btn btn-sm btn-danger" onClick={() => onDelete(s.id)}>Delete</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
