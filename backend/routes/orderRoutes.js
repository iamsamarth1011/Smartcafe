const express = require("express");
const {
  placeOrder,
  getOrderById,
  getOrdersByTable,
  updateOrderStatus,
  getActiveOrders
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", placeOrder);
router.get("/active", getActiveOrders);
router.get("/table/:tableNumber", getOrdersByTable);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
