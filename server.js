const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ================= MODELS =================
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  phone: String,
  password: String
}));

const Product = mongoose.model("Product", new mongoose.Schema({
  name: String,
  price: Number
}));

const Sale = mongoose.model("Sale", new mongoose.Schema({
  product_name: String,
  qty: Number,
  rate: Number,
  total: Number
}));

// ================= AUTH =================
app.post("/login", async (req, res) => {
  const user = await User.findOne(req.body);
  res.json(user
    ? { success: true, message: "Login successful" }
    : { success: false, message: "Invalid login" }
  );
});

app.post("/register", async (req, res) => {
  await User.create(req.body);
  res.json({ success: true, message: "Registered" });
});

// ================= PRODUCTS =================
app.post("/products", async (req, res) => {
  await Product.create(req.body);
  res.json({ success: true, message: "Product added" });
});

app.get("/products", async (req, res) => {
  res.json(await Product.find());
});

app.post("/products/delete/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Product deleted" });
});

// ================= SALES =================
app.post("/sales", async (req, res) => {
  const { product_name, quantity, price, total } = req.body;
  await Sale.create({
    product_name,
    qty: quantity,
    rate: price,
    total
  });
  res.json({ success: true, message: "Sale saved" });
});

app.get("/sales", async (req, res) => {
  res.json({ success: true, data: await Sale.find() });
});

app.post("/sales/delete/:id", async (req, res) => {
  await Sale.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Sale deleted" });
});

app.post("/sales/update/:id", async (req, res) => {
  const { product_name, qty, rate } = req.body;
  await Sale.findByIdAndUpdate(req.params.id, {
    product_name,
    qty,
    rate,
    total: qty * rate
  });
  res.json({ success: true, message: "Sale updated" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log("Server started on port", PORT)
);
