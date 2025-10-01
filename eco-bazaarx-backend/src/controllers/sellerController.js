import pool from '../config/db.js';

// ================== PRODUCTS ==================

// Get all products for logged-in seller
export const getMyProducts = async (req, res) => {
  const sellerId = req.user.id;
  try {
    const [products] = await pool.query(
      "SELECT * FROM products WHERE seller_id = ?",
      [sellerId]
    );
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new product
export const addProduct = async (req, res) => {
  const { name, category, price, carbon_score, eco_label, stock } = req.body;
  const sellerId = req.user.id;

  if (!name || !category || !price || !carbon_score || !eco_label || stock == null) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO products (name, category, price, carbon_score, eco_label, stock, seller_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, category, price, carbon_score, eco_label, stock, sellerId]
    );

    const [rows] = await pool.query(
      "SELECT * FROM products WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, carbon_score, eco_label, stock } = req.body;
  const sellerId = req.user.id;

  try {
    const [result] = await pool.query(
      `UPDATE products
       SET name=?, category=?, price=?, carbon_score=?, eco_label=?, stock=?
       WHERE id=? AND seller_id=?`,
      [name, category, price, carbon_score, eco_label, stock, id, sellerId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found or not yours" });

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  const sellerId = req.user.id;
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM products WHERE id=? AND seller_id=?",
      [id, sellerId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found or not yours" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== ORDERS ==================
// Get all orders that include the seller's products
export const getMyOrders = async (req, res) => {
  const sellerId = req.user.id;

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
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE p.seller_id = ?
       ORDER BY o.id DESC`,
      [sellerId]
    );

    // Group items by order
    const orders = {};
    for (const row of rows) {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          order_id: row.order_id,
          customer_id: row.customer_id,
          total_amount: parseFloat(row.total_amount) ?? 0,
          total_carbon: parseFloat(row.total_carbon) ?? 0,
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
        price: parseFloat(row.price)
      });
    }

    res.json(Object.values(orders));
  } catch (err) {
    console.error("Seller Orders Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  const sellerId = req.user.id;
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       SET o.status=?
       WHERE o.id=? AND p.seller_id=?`,
      [status, orderId, sellerId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Order not found or not yours" });

    res.json({ message: "Order status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== REVIEWS ==================

// Get all reviews of seller's products
export const getMyReviews = async (req, res) => {
  const sellerId = req.user.id;
  try {
    const [reviews] = await pool.query(
      `SELECT r.id AS review_id, r.customer_id, r.product_id, r.rating, r.comment, r.reply,
              p.name AS product_name
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       WHERE p.seller_id = ?`,
      [sellerId]
    );

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ================== STATS ==================

// Get seller stats
export const getSellerStats = async (req, res) => {
  const sellerId = req.user.id;
  try {
    const [[totalProducts]] = await pool.query(
      "SELECT COUNT(*) AS totalProducts FROM products WHERE seller_id=?",
      [sellerId]
    );

    const [[totalOrders]] = await pool.query(
      `SELECT COUNT(DISTINCT o.id) AS totalOrders
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE p.seller_id=?`,
      [sellerId]
    );

    const [[totalReviews]] = await pool.query(
      `SELECT COUNT(*) AS totalReviews
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       WHERE p.seller_id=?`,
      [sellerId]
    );

    res.json({
      totalProducts: totalProducts.totalProducts,
      totalOrders: totalOrders.totalOrders,
      totalReviews: totalReviews.totalReviews
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
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
// Reply to a review
export const replyToReview = async (req, res) => {
  const sellerId = req.user.id;
  const { reviewId } = req.params;
  const { reply } = req.body;

  if (!reply) return res.status(400).json({ message: "Reply cannot be empty" });

  try {
    const [result] = await pool.query(
      `UPDATE reviews r
       JOIN products p ON r.product_id = p.id
       SET r.reply=?
       WHERE r.id=? AND p.seller_id=?`,
      [reply, reviewId, sellerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Review not found or not yours" });
    }

    res.json({ message: "Reply added successfully" });
  } catch (err) {
    console.error("Reply Review Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
