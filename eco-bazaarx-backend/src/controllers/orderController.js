import pool from "../config/db.js";

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new order
export const createOrder = async (req, res) => {
  const { user_id, product_id, quantity, total_price } = req.body;
  try {
    await pool.query(
      "INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)",
      [user_id, product_id, quantity, total_price]
    );
    res.json({ message: "Order created successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
