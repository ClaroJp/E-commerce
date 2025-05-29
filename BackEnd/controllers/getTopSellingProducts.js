const db = require("../DB/db-config");

async function getTopSellingProducts(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT p.product_id, p.name, p.description, p.price, p.stock_quantity, p.category_id, p.image_url,
             c.name AS category_name,
             p.sold_count AS total_sold
      FROM products p
      LEFT JOIN category c ON p.category_id = c.category_id
      ORDER BY p.sold_count DESC
      LIMIT 4
    `);

    const products = rows.map(product => ({
      ...product,
      price: Number(product.price),
      stock_quantity: Number(product.stock_quantity),
      category_id: product.category_id !== null ? Number(product.category_id) : null,
      category_name: product.category_name || "N/A",
      total_sold: Number(product.total_sold),
    }));

    res.json(products);
  } catch (err) {
    console.error("Error fetching top selling products:", err);
    res.status(500).json({ error: "Failed to fetch top-selling products" });
  }
}

module.exports = getTopSellingProducts;
