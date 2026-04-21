const express = require("express");
const {
  placeOrder,
  getOrderById,
  getOrdersByTable,
  updateOrderStatus,
  getActiveOrders,
  getBillByTable,
  markTablePaid,
  getBillingHistory
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", placeOrder);
router.get("/active", getActiveOrders);
router.get("/history", getBillingHistory);
router.get("/bill/:tableNumber", getBillByTable);
router.patch("/bill/:tableNumber/pay", markTablePaid);
router.get("/table/:tableNumber", getOrdersByTable);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
