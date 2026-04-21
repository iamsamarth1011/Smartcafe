const Table = require("../models/Table");

const getAllTables = async (_req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTables = async (req, res) => {
  try {
    const count = Number(req.body.count);

    if (!Number.isInteger(count) || count <= 0) {
      return res
        .status(400)
        .json({ message: "Count must be a positive integer" });
    }

    const existingTables = await Table.find({
      tableNumber: { $gte: 1, $lte: count }
    }).select("tableNumber");

    const existingNumbers = new Set(
      existingTables.map((table) => table.tableNumber)
    );

    const tablesToCreate = Array.from({ length: count }, (_, index) => ({
      tableNumber: index + 1
    })).filter((table) => !existingNumbers.has(table.tableNumber));

    if (tablesToCreate.length > 0) {
      await Table.insertMany(tablesToCreate);
    }

    const tables = await Table.find().sort({ tableNumber: 1 });

    res.status(201).json({
      created: tablesToCreate.length,
      total: tables.length,
      tables
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllTables,
  createTables
};
