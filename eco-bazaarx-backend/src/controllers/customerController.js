import pool from "../config/db.js";

// ================== PRODUCTS ==================

// Get all products for customers
export const getAllProducts = async (req, res) => {
  try {
    const [products] = await pool.query("SELECT * FROM products");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get product details by id
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const [products] = await pool.query("SELECT * FROM products WHERE id=?", [id]);
    if (products.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(products[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== ORDERS ==================

// Place a new order
export const placeOrder = async (req, res) => {
  const { products } = req.body; // [{ product_id, quantity }]
  const customerId = req.user.id;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "Products array is required" });
  }

  try {
    // Fetch product details from DB to ensure price & carbon_score are correct
    const productIds = products.map(p => p.product_id);
    const [dbProducts] = await pool.query(
      `SELECT id, price, carbon_score FROM products WHERE id IN (?)`,
      [productIds]
    );

    if (dbProducts.length !== products.length) {
      return res.status(400).json({ message: "Some products not found" });
    }

    // Merge db data with quantities
    const enrichedProducts = products.map(p => {
      const found = dbProducts.find(dbP => dbP.id === p.product_id);
      return {
        ...p,
        price: found.price,
        carbon_score: found.carbon_score || 0
      };
    });

    // Calculate totals
    const total = enrichedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const carbon_total = enrichedProducts.reduce(
      (sum, p) => sum + p.carbon_score * p.quantity,
      0
    );

    // Insert order
    const [orderResult] = await pool.query(
      "INSERT INTO orders (customer_id, total_amount, total_carbon, status) VALUES (?, ?, ?, 'Pending')",
      [customerId, total, carbon_total]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    const orderItems = enrichedProducts.map(p => [
      orderId,
      p.product_id,
      p.quantity,
      p.price
    ]);

    await pool.query(
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
      [orderItems]
    );

    res.status(201).json({
      message: "Order placed successfully",
      orderId,
      total,
      carbon_total
    });
  } catch (err) {
    console.error("Place Order Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get all orders of the customer (with items)
export const getCustomerOrders = async (req, res) => {
  const customerId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT 
          o.id AS order_id,
          o.total_amount AS total,
          o.total_carbon,
          o.status,
          o.created_at,
          oi.id AS order_item_id,
          oi.product_id,
          oi.quantity,
          oi.price,
          p.name AS product_name
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.customer_id = ?
       ORDER BY o.id DESC`,
      [customerId]
    );

    // Group items under their order
    const orders = {};
    for (const row of rows) {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          order_id: row.order_id,
          total: row.total,
          total_carbon: row.total_carbon,
          status: row.status,
          created_at: row.created_at,
          items: []
        };
      }
      orders[row.order_id].items.push({
        order_item_id: row.order_item_id,
        product_id: row.product_id,
        product_name: row.product_name,
        quantity: row.quantity,
        price: row.price
      });
    }

    res.json(Object.values(orders));
  } catch (err) {
    console.error("Get Orders Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};


// ================== REVIEWS ==================

// Add review for a product
export const addReview = async (req, res) => {
  const customerId = req.user.id;
  const { product_id, rating, comment } = req.body;

  if (!product_id || rating == null || !comment) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await pool.query(
      "INSERT INTO reviews (customer_id, product_id, rating, comment) VALUES (?, ?, ?, ?)",
      [customerId, product_id, rating, comment]
    );

    res.status(201).json({ message: "Review added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== CUSTOMER PROFILE ==================

// Get customer profile
export const getProfile = async (req, res) => {
  const customerId = req.user.id;
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email FROM users WHERE id=?",
      [customerId]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  const customerId = req.user.id;
  const { name, email } = req.body;

  try {
    await pool.query(
      "UPDATE users SET name=?, email=? WHERE id=?",
      [name, email, customerId]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// controllers/customerController.js or adminController.js (depending on who replies)
export const replyReview = async (req, res) => {
  const { id } = req.params; // review ID
  const { reply } = req.body;

  if (!reply) return res.status(400).json({ message: "Reply cannot be empty" });

  try {
    const [result] = await pool.query(
      "UPDATE reviews SET reply=? WHERE id=?",
      [reply, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Reply sent successfully" });
  } catch (err) {
    console.error("Reply Review Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ================== REVIEWS ==================

// Get all reviews of logged-in customer
export const getCustomerReviews = async (req, res) => {
  const customerId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.product_id, r.rating, r.comment, r.reply,
              p.name AS product_name
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       WHERE r.customer_id = ?
       ORDER BY r.id DESC`,
      [customerId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Get Reviews Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
