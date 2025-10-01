import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />; // not logged in

  if (!allowedRoles.includes(role)) return <Navigate to="/login" />; // role mismatch

  return children;
}
