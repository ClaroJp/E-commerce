const express = require("express");
const pool = require("../DB/db-config");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const isAdminMiddleware = require("../Middleware/isAdminMiddleware");


// Import controller functions
const { placeOrder, getAllOrders, updateOrderStatus } = require("../controllers/orderController");

router.put('/:orderId/status', updateOrderStatus);
// Route to place an order (authenticated users only)
router.post("/place", authMiddleware, placeOrder);

// Route to get all orders (admin only)
router.get("/", authMiddleware, isAdminMiddleware, getAllOrders);

module.exports = router;
