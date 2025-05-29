const express = require("express");
const authMiddleware = require("../Middleware/authMiddleware.js");
const getUserOrders = require("../controllers/getUserOrders.js");

const router = express.Router();

// Get user's orders (protected)
router.get("/my-purchases", authMiddleware, getUserOrders);

module.exports = router;
