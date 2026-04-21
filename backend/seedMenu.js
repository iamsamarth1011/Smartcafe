const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Menu = require("./models/Menu");

dotenv.config();

const menuItems = [
  {
    category: "Starters",
    name: "Crispy Corn Bites",
    description: "Golden fried corn kernels with herbs and a tangy dip.",
    price: 6.5,
    image: "https://placehold.co/400x300",
    isVeg: true,
    isAvailable: true
  },
  {
    category: "Starters",
    name: "Spiced Chicken Skewers",
    description: "Char-grilled chicken skewers with paprika and lemon.",
    price: 8.5,
    image: "https://placehold.co/400x300",
    isVeg: false,
    isAvailable: true
  },
  {
    category: "Starters",
    name: "Paneer Tikka",
    description: "Smoky cottage cheese cubes with mint chutney.",
    price: 7.25,
    image: "https://placehold.co/400x300",
    isVeg: true,
    isAvailable: true
  },
  {
    category: "Starters",
    name: "Stuffed Mushroom Caps",
    description: "Baked mushrooms with garlic, cheese, and breadcrumbs.",
    price: 7.75,
    image: "https://placehold.co/400x300",
    isVeg: true,
    isAvailable: false
  },
  {
    category: "Mains",
    name: "Golden Fork Burger",
    description: "Juicy beef patty, cheddar, caramelized onions, brioche.",
    price: 12.5,
    image: "https://placehold.co/400x300",
    isVeg: false,
    isAvailable: true
  },
  {
    category: "Mains",
    name: "Truffle Mushroom Pasta",
    description: "Creamy linguine with truffle oil and wild mushrooms.",
    price: 13.75,
    image: "https://placehold.co/400x300",
    isVeg: true,
    isAvailable: true
  },
  {
    category: "Mains",
    name: "Herb Roasted Chicken",
    description: "Slow roasted chicken with rosemary jus and veggies.",
    price: 14.25,
    image: "https://placehold.co/400x300",
    isVeg: false,
    isAvailable: true
  },
  {
    category: "Mains",
    name: "Mediterranean Bowl",
    description: "Quinoa, hummus, roasted veggies, and tahini drizzle.",
    price: 11.5,
    image: "https://placehold.co/400x300",
    isVeg: true,
    isAvailable: true
  },
  {
    category: "Drinks",
    name: "Citrus Sparkler",
    description: "Orange, lime, and soda with a hint of mint.",
    price: 4.5,
    image: "https://placehold.co/400x300",
    isVeg: true,
    isAvailable: true
  },
  {
    category: "Drinks",
    name: "Cold Brew Latte",
    description: "Smooth cold brew with milk and vanilla.",
    price: 4.75,
    image: "https://placehold.co/400x300",
    isVeg: true,
    isAvailable: true
  },
  {
    category: "Drinks",
    name: "Berry Iced Tea",
    description: "Black tea infused with berries and citrus.",
    price: 4.25,
    image: "https://placehold.co/400x300",
    isVeg: true,
    isAvailable: false
  },
  {
    category: "Drinks",
    name: "Classic Mojito",
    description: "Mint, lime, and soda served chilled.",
    price: 5.5,
    image: "https://placehold.co/400x300",
    isVeg: true,
    isAvailable: true
  },
  {
    category: "Desserts",
    name: "Warm Chocolate Fondant",
    description: "Molten chocolate cake with vanilla gelato.",
    price: 6.75,
    image: "https://placehold.co/400x300",
    isVeg: true,
    isAvailable: true
  },
  {
    category: "Desserts",
    name: "Salted Caramel Tart",
    description: "Buttery tart with salted caramel and whipped cream.",
    price: 6.25,
    image: "https://placehold.co/400x300",
    isVeg: true,
    isAvailable: true
  },
  {
    category: "Desserts",
    name: "Mango Cheesecake",
    description: "Creamy cheesecake topped with fresh mango.",
    price: 6.5,
    image: "https://placehold.co/400x300",
    isVeg: true,
    isAvailable: true
  },
  {
    category: "Desserts",
    name: "Classic Tiramisu",
    description: "Coffee-soaked layers with mascarpone cream.",
    price: 6.75,
    image: "https://placehold.co/400x300",
    isVeg: true,
    isAvailable: true
  }
];

const seedMenu = async () => {
  try {
    await connectDB();
    await Menu.deleteMany();
    await Menu.insertMany(menuItems);
    console.log("Menu seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Menu seeding error:", error.message);
    process.exit(1);
  }
};

seedMenu();
