const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(
      "mongodb+srv://rahuldhandoreeas21b0094_db_user:rahul123@cluster0.cetaakq.mongodb.net/MINORDB?appName=Cluster0",
      {
        serverSelectionTimeoutMS: 10000,
      }
    );
    console.log("MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;
