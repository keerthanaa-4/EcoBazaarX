import React from "react";

export default function CustomerTable({ customers, onApprove, onDelete }) {
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
        {customers.map(c => (
          <tr key={c.id}>
            <td>{c.name}</td>
            <td>{c.email}</td>
            <td>{c.status}</td>
            <td>
              {onApprove && c.status !== "Approved" && (
                <button className="btn btn-sm btn-success me-2" onClick={() => onApprove(c.id)}>Approve</button>
              )}
              {onDelete && (
                <button className="btn btn-sm btn-danger" onClick={() => onDelete(c.id)}>Delete</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
