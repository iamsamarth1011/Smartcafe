const Menu = require("../models/Menu");

const getAllMenuItems = async (_req, res) => {
  try {
    const items = await Menu.find().sort({ category: 1, name: 1 });

    const itemsByCategory = items.reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    res.json({
      categories: Object.keys(itemsByCategory),
      itemsByCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMenuByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const items = await Menu.find({ category }).sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const { category, name, description, price, image, isAvailable, isVeg } =
      req.body;

    const item = await Menu.create({
      category,
      name,
      description,
      price,
      image,
      isAvailable,
      isVeg
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await Menu.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Menu.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMenuItems,
  getMenuByCategory,
  createMenuItem,
  updateMenuItem,
  toggleAvailability
};
