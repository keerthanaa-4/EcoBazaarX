import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function UserTable({ users, onApprove, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered align-middle shadow-sm">
        <thead style={{ background: "linear-gradient(90deg, #a8e6cf, #dcedc1)", color: "#2e7d32" }}>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            {(onApprove || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ backgroundColor: "#f1f8e9" }}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span 
                  className={`badge ${user.status === "Pending" ? "bg-warning text-dark" : "bg-success"}`}
                >
                  {user.status}
                </span>
              </td>
              {(onApprove || onDelete) && (
                <td>
                  {onApprove && user.status === "Pending" && (
                    <button
                      className="btn btn-success btn-sm me-2"
                      style={{ borderRadius: "12px" }}
                      onClick={() => onApprove(user.id)}
                    >
                      Approve
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ borderRadius: "12px" }}
                      onClick={() => onDelete(user.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
