import pool from "../config/db.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get all products for a seller
export const getProductsBySeller = async (req, res) => {
  try {
    const sellerId = req.user.id; // from JWT
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE seller_id = ?",
      [sellerId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  const { name, price, carbon_score, category } = req.body;
  try {
    await pool.query(
      "INSERT INTO products (name, price, carbon_score, category) VALUES (?, ?, ?, ?)",
      [name, price, carbon_score, category]
    );
    res.json({ message: "Product created successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, carbon_score, category } = req.body;
  try {
    await pool.query(
      "UPDATE products SET name=?, price=?, carbon_score=?, category=? WHERE id=?",
      [name, price, carbon_score, category, id]
    );
    res.json({ message: "Product updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM products WHERE id=?", [id]);
    res.json({ message: "Product deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
