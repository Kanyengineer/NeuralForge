// One-off script to verify the Atlas connection works before we build
// prediction history on top of it. Run: node testConnection.js
require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;

if (!uri) {
    console.error("MONGO_URI not found in .env — check the file exists in backend/ and is named exactly '.env'");
    process.exit(1);
}

mongoose
    .connect(uri)
    .then(() => {
        console.log("✅ Connected to MongoDB Atlas successfully!");
        return mongoose.connection.close();
    })
    .then(() => {
        console.log("Connection closed cleanly.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Connection failed:", err.message);
        process.exit(1);
    });