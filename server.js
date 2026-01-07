const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 MongoDB connection
mongoose
  .connect(
    "mongodb+srv://SalesApi:Shadab40@salesapp.7ogbyt3.mongodb.net/SaleAapp?appName=SalesApp"
  )
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("Mongo Error:", err);
  });

// 🔹 Sale schema
const SaleSchema = new mongoose.Schema({
  product_name: String,
  qty: Number,
  rate: Number,
  total: Number,
});

const Sale = mongoose.model("Sale", SaleSchema);

// 🔹 Save sale API
app.post("/save-sale", async (req, res) => {
  try {
    const sale = new Sale(req.body);
    await sale.save();
    res.json({ success: true, message: "Sale saved" });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// 🔹 Get sales API
app.get("/get-sales", async (req, res) => {
  const data = await Sale.find().sort({ _id: -1 });
  res.json({ success: true, data });
});

// 🔹 Start server (IMPORTANT FIX)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
