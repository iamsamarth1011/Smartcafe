const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Table = require("./models/Table");

dotenv.config();

const seedTables = async () => {
  try {
    await connectDB();
    await Table.deleteMany();

    const tables = Array.from({ length: 10 }, (_, index) => ({
      tableNumber: index + 1
    }));

    await Table.insertMany(tables);
    console.log("Tables seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Table seeding error:", error.message);
    process.exit(1);
  }
};

seedTables();
