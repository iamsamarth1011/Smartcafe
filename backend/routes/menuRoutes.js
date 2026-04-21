const express = require("express");
const {
  getAllMenuItems,
  getMenuByCategory,
  createMenuItem,
  updateMenuItem,
  toggleAvailability
} = require("../controllers/menuController");

const router = express.Router();

router.get("/", (req, res) => {
  if (req.query.category) {
    return getMenuByCategory(req, res);
  }
  return getAllMenuItems(req, res);
});

router.post("/", createMenuItem);
router.patch("/:id", updateMenuItem);
router.patch("/:id/toggle", toggleAvailability);

module.exports = router;
