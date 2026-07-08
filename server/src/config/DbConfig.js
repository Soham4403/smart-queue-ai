const mongoose = require("mongoose");

const ConnDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    console.error(error);

    throw error; // <-- THIS IS IMPORTANT
  }
};

module.exports = ConnDb;