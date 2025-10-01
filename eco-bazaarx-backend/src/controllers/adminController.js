import pool from "../config/db.js";

// Dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    const [[totalUsers]] = await pool.query("SELECT COUNT(*) as totalUsers FROM users");
    const [[totalSellers]] = await pool.query("SELECT COUNT(*) as totalSellers FROM users WHERE role='seller'");
    const [[totalCustomers]] = await pool.query("SELECT COUNT(*) as totalCustomers FROM users WHERE role='customer'");
    const [[totalProducts]] = await pool.query("SELECT COUNT(*) as totalProducts FROM products");
    const [[totalOrders]] = await pool.query("SELECT COUNT(*) as totalOrders FROM orders"); // <-- Added

    res.json({ totalUsers: totalUsers.totalUsers, totalSellers: totalSellers.totalSellers, totalCustomers: totalCustomers.totalCustomers, totalProducts: totalProducts.totalProducts, totalOrders: totalOrders.totalOrders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, name, email, role, status FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get pending users
export const getPendingUsers = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, name, email, role, status FROM users WHERE status='Pending'");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve user
export const approveUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE users SET status='Approved' WHERE id=?", [id]);
    res.json({ message: "User approved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id=?", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Optional: Get all sellers
export const getAllSellers = (req, res) => {
  db.query('SELECT * FROM users WHERE role="seller"', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};




// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const [products] = await pool.query("SELECT * FROM products");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  const productId = req.params.id;
  try {
    const [results] = await pool.query("SELECT * FROM products WHERE id = ?", [productId]);
    if (results.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new product (Admin)
export const addProduct = async (req, res) => {
  const { name, category, price, carbon_score, eco_label, stock, seller_id } = req.body;

  if (!name || !category || !price || !carbon_score || !eco_label || stock == null || !seller_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO products (name, category, price, carbon_score, eco_label, stock, seller_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, category, price, carbon_score, eco_label, stock, seller_id]
    );

    const [productRows] = await pool.query("SELECT * FROM products WHERE id = ?", [result.insertId]);
    res.status(201).json(productRows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a product (Admin)
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, carbon_score, eco_label, stock, seller_id } = req.body;

  if (!name || !category || !price || !carbon_score || !eco_label || stock == null || !seller_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await pool.query(
      `UPDATE products
       SET name=?, category=?, price=?, carbon_score=?, eco_label=?, stock=?, seller_id=?
       WHERE id=?`,
      [name, category, price, carbon_score, eco_label, stock, seller_id, id]
    );

    const [updatedProduct] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    res.status(200).json(updatedProduct[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a product (Admin)
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getAllOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          o.id AS order_id,
          o.customer_id,
          o.total_amount,
          o.total_carbon,
          o.status,
          o.created_at,
          oi.id AS order_item_id,
          oi.product_id,
          oi.quantity,
          oi.price,
          p.name AS product_name
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       ORDER BY o.id DESC`
    );

    const orders = {};

    for (const row of rows) {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          order_id: row.order_id,
          customer_id: row.customer_id,
          total_amount: parseFloat(row.total_amount) || 0,
          total_carbon: parseFloat(row.total_carbon) || 0,
          status: row.status,
          created_at: row.created_at,
          items: []
        };
      }

      // Only push item if it exists, otherwise placeholder
      if (row.order_item_id) {
        orders[row.order_id].items.push({
          order_item_id: row.order_item_id,
          product_id: row.product_id,
          product_name: row.product_name || "Unknown Product",
          quantity: row.quantity,
          price: parseFloat(row.price) || 0
        });
      } else {
        orders[row.order_id].items.push({
          order_item_id: null,
          product_id: null,
          product_name: "No products",
          quantity: 0,
          price: 0
        });
      }
    }

    res.json(Object.values(orders));
  } catch (err) {
    console.error("Get Orders Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};




// Approve an order
export const approveOrder = async (req, res) => {
  const { id } = req.params; // order ID
  try {
    // Update the order status to "Approved"
    const [result] = await pool.query(
      "UPDATE orders SET status = 'Approved' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order approved successfully" });
  } catch (err) {
    console.error("Approve Order Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
