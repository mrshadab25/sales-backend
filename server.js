const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= DB =================
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ================= SCHEMAS =================

// USERS (Manager + Salesperson)
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  organisation: String,
  password: String,
  role: String   // manager | salesperson
}));

// PRODUCTS (Inventory)
const Product = mongoose.model("Product", new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  createdBy: String   // managerId
}));

// SALES
const Sale = mongoose.model("Sale", new mongoose.Schema({
  product_name: String,
  qty: Number,
  rate: Number,
  total: Number,
  userId: String,
  createdAt: { type: Date, default: Date.now }
}));

// =================================================
// ================= AUTH ===========================
// =================================================

// REGISTER
app.post("/register", async (req, res) => {
  const { phone, email } = req.body;

  const exists = await User.findOne({
    $or: [{ phone }, { email }]
  });

  if (exists) {
    return res.json({
      success: false,
      message: "User already exists"
    });
  }

  await User.create(req.body);

  res.json({
    success: true,
    message: "Registered successfully"
  });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email, password, role });

  if (!user) {
    return res.json({
      success: false,
      message: "Invalid credentials"
    });
  }

  res.json({
    success: true,
    message: "Login successful",
    user
  });
});

// =================================================
// ================= PROFILE ========================
// =================================================

// GET PROFILE (self or manager)
const mongoose = require("mongoose");

app.get("/profile/:id", async (req, res) => {
  const { id } = req.params;

  // ✅ check valid Mongo ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id"
    });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.json(user); // 👈 direct user object (IMPORTANT)
});


// UPDATE PROFILE
app.post("/update-profile", async (req, res) => {
  const { userId, name, phone, email, organisation } = req.body;

  await User.findByIdAndUpdate(userId, {
    name,
    phone,
    email,
    organisation
  });

  res.json({
    success: true,
    message: "Profile updated"
  });
});

// CHANGE PASSWORD
app.post("/change-password", async (req, res) => {
  const { userId, password } = req.body;

  await User.findByIdAndUpdate(userId, { password });

  res.json({
    success: true,
    message: "Password changed"
  });
});

// =================================================
// ================= USERS (Manager only) ===========
// =================================================

// GET ALL SALESPERSONS (Manager)
app.get("/users", async (req, res) => {
  const { role } = req.query;

  if (role !== "manager") {
    return res.json({
      success: false,
      message: "Access denied"
    });
  }

  const users = await User.find({ role: "salesperson" });
  res.json({ success: true, data: users });
});

// =================================================
// ================= PRODUCTS =======================
// =================================================

// ADD PRODUCT (Manager only)
app.post("/add-product", async (req, res) => {
  const { role } = req.body;

  if (role !== "manager") {
    return res.json({
      success: false,
      message: "Only manager can add products"
    });
  }

  await Product.create(req.body);

  res.json({
    success: true,
    message: "Product added"
  });
});

// GET PRODUCTS (All)
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products); // 🔥 DIRECT ARRAY
});

// DELETE PRODUCT (Manager only)
app.post("/delete-product", async (req, res) => {
  const { role, id } = req.body;

  if (role !== "manager") {
    return res.json({
      success: false,
      message: "Only manager can delete"
    });
  }

  await Product.findByIdAndDelete(id);
  res.json({ success: true, message: "Product deleted" });
});

// =================================================
// ================= SALES ==========================
// =================================================

// SAVE SALE
app.post("/save-sale", async (req, res) => {
  const { product_name, quantity, price, userId } = req.body;

  await Sale.create({
    product_name,
    qty: quantity,
    rate: price,
    total: quantity * price,
    userId
  });

  res.json({
    success: true,
    message: "Sale saved"
  });
});

// GET SALES
app.get("/sales", async (req, res) => {
  const sales = await Sale.find().sort({ _id: -1 });
  res.json(sales); // 🔥 DIRECT ARRAY
});

// DELETE SALE
app.post("/delete-sale", async (req, res) => {
  await Sale.findByIdAndDelete(req.body.id);
  res.json({ success: true, message: "Sale deleted" });
});

// UPDATE SALE
app.post("/update-sale", async (req, res) => {
  const { id, product_name, qty, rate } = req.body;

  await Sale.findByIdAndUpdate(id, {
    product_name,
    qty,
    rate,
    total: qty * rate
  });

  res.json({
    success: true,
    message: "Sale updated"
  });
});

// =================================================
// =============== FORGOT PASSWORD =================
// =================================================

// STEP 1: Check user exists
app.post("/forgot-password", async (req, res) => {
  const { email, role } = req.body;

  const user = await User.findOne({ email, role });

  if (!user) {
    return res.json({
      success: false,
      message: "User not found"
    });
  }

  res.json({
    success: true,
    message: "User verified",
    userId: user._id
  });
});

// STEP 2: Reset password
app.post("/reset-password", async (req, res) => {
  const { userId, newPassword } = req.body;

  await User.findByIdAndUpdate(userId, {
    password: newPassword
  });

  res.json({
    success: true,
    message: "Password reset successful"
  });
});


// ================= SERVER =================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log("Server started on port", PORT)
);
