const db = require("../DB/db-config");

async function getUserOrders(req, res) {
  const userId = req.user?.user_id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const [orders] = await db.query(
      `SELECT order_id, created_at AS order_date, orderStatus AS status 
       FROM orders 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    for (const order of orders) {
      const [items] = await db.query(
        `SELECT od.detail_id, od.quantity, od.price,
                p.product_id, p.name, p.image_url
         FROM order_details od
         JOIN products p ON od.product_id = p.product_id
         WHERE od.order_id = ?`,
        [order.order_id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}

module.exports = getUserOrders;
