const express = require("express");
const { getAllTables, createTables } = require("../controllers/tableController");

const router = express.Router();

router.get("/", getAllTables);
router.post("/", createTables);

module.exports = router;
