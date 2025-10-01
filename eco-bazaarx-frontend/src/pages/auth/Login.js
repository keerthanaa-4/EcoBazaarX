import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../../assets/ecobazaarx logo.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);
      navigate(`/${data.role}`);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const leaves = [
    { top: "-50px", left: "-50px", width: 80, height: 80, delay: "0s" },
    { bottom: "10%", left: "20%", width: 60, height: 60, delay: "2s" },
    { top: "30%", right: "10%", width: 50, height: 50, delay: "1s" },
    { bottom: "-40px", right: "15%", width: 70, height: 70, delay: "3s" },
  ];

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 position-relative" style={{ background: "linear-gradient(135deg, #a8e6cf, #dcedc1)", overflow: "hidden" }}>
      {leaves.map((leaf, i) => (
        <div key={i} className="leaf" style={{ ...leaf, position: "absolute", animationDelay: leaf.delay }} />
      ))}

      <div className="position-absolute text-center w-100" style={{ top: "6%", color: "#2e7d32" }}>
        <h1 className="fw-bold d-flex justify-content-center align-items-center gap-2">
          <img src={logo} alt="EcoBazaarX Logo" style={{ width: 60, height: 60 }} />
          <span style={{ fontSize: "2rem", color: "#2e7d32" }}>ECOBAZAARX</span>
        </h1>
      </div>

      <div className="card shadow p-4 text-center" style={{ minWidth: 350, borderRadius: 20, borderLeft: "6px solid #4caf50", backgroundColor: "rgba(255,255,255,0.95)", zIndex: 1 }}>
        <img src={logo} alt="EcoBazaarX Logo" style={{ width: 70, margin: "0 auto 15px", display: "block" }} />
        <h3 className="text-success mb-4 fw-semibold">Welcome Back!</h3>

        <form onSubmit={handleSubmit}>
          <input className="form-control mb-3 rounded-3" type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input className="form-control mb-3 rounded-3" type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <button className="btn w-100 text-white fw-semibold" type="submit" style={{ backgroundColor: "#4caf50" }}>Login</button>
        </form>

        <p className="mt-3" style={{ color: "#2e7d32" }}>
          Don't have an account? <Link to="/register" style={{ color: "#4caf50", fontWeight: 600 }}>Register here</Link>
        </p>
      </div>

      <style>{`
        .leaf {
          background: url('https://cdn-icons-png.flaticon.com/512/415/415733.png') no-repeat center/contain;
          opacity: 0.1;
          animation: floatLeaf 10s linear infinite;
        }
        @keyframes floatLeaf {
          0% { transform: translateY(0px) rotate(0deg); } 
          50% { transform: translateY(-20px) rotate(15deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}