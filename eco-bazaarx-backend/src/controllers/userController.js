import pool from "../config/db.js"; // your MySQL connection

// Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email, role FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new user (admin only)
export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const [existing] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
    if (existing.length > 0) return res.status(400).json({ message: "User already exists" });

    // You should hash password here if required
    await pool.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [
      name,
      email,
      password, // in production, use hashed password
      role,
    ]);

    res.json({ message: "User created successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
