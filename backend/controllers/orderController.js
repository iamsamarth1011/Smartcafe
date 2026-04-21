const { v4: uuidv4 } = require("uuid");
const Order = require("../models/Order");
const Table = require("../models/Table");

const placeOrder = async (req, res) => {
  try {
    const { tableNumber, items, note } = req.body;

    const parsedTableNumber = Number(tableNumber);

    if (
      !Number.isInteger(parsedTableNumber) ||
      parsedTableNumber <= 0 ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Table number and items are required" });
    }

    const sanitizedItems = items.map((item) => ({
      menuItemId: item.menuItemId || item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      isVeg: item.isVeg
    }));

    const totalAmount = sanitizedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const sessionId = uuidv4();

    const table = await Table.findOneAndUpdate(
      { tableNumber: parsedTableNumber },
      { isOccupied: true, currentSessionId: sessionId },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const order = await Order.create({
      tableNumber: parsedTableNumber,
      sessionId,
      items: sanitizedItems,
      totalAmount,
      note
    });

    const io = req.app.locals.io;
    if (io) {
      io.emit("new_order", order);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const io = req.app.locals.io;
    if (io) {
      io.emit("order_status_updated", {
        orderId: order._id,
        status: order.status,
        tableNumber: order.tableNumber
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrdersByTable = async (req, res) => {
  try {
    const { tableNumber } = req.params;
    const orders = await Order.find({
      tableNumber,
      status: { $ne: "paid" }
    }).sort({ createdAt: 1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "paid"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActiveOrders = async (_req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: "paid" } }).sort({
      createdAt: 1
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBillByTable = async (req, res) => {
  try {
    const parsedTableNumber = Number(req.params.tableNumber);

    if (!Number.isInteger(parsedTableNumber) || parsedTableNumber <= 0) {
      return res.status(400).json({ message: "Invalid table number" });
    }

    const orders = await Order.find({
      tableNumber: parsedTableNumber,
      status: { $ne: "paid" }
    })
      .sort({ createdAt: 1 })
      .lean();

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No active orders for this table" });
    }

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      items: order.items,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      note: order.note
    }));

    const totalAmount = formattedOrders.reduce(
      (total, order) => total + order.totalAmount,
      0
    );

    const itemCount = formattedOrders.reduce(
      (total, order) =>
        total + order.items.reduce((sum, item) => sum + item.quantity, 0),
      0
    );

    res.json({
      tableNumber: parsedTableNumber,
      orders: formattedOrders,
      totalAmount,
      itemCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markTablePaid = async (req, res) => {
  try {
    const parsedTableNumber = Number(req.params.tableNumber);

    if (!Number.isInteger(parsedTableNumber) || parsedTableNumber <= 0) {
      return res.status(400).json({ message: "Invalid table number" });
    }

    const table = await Table.findOneAndUpdate(
      { tableNumber: parsedTableNumber },
      { isOccupied: false, currentSessionId: null },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    await Order.updateMany(
      { tableNumber: parsedTableNumber, status: { $ne: "paid" } },
      { status: "paid" }
    );

    const io = req.app.locals.io;
    if (io) {
      io.emit("table_paid", { tableNumber: parsedTableNumber });
    }

    res.json({
      message: "Table settled successfully",
      tableNumber: parsedTableNumber
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  placeOrder,
  getOrderById,
  getOrdersByTable,
  updateOrderStatus,
  getActiveOrders,
  getBillByTable,
  markTablePaid
};
