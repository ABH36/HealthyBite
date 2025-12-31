require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ========================
// SECURITY ARMOR MIDDLEWARES
// ========================
const adminFirewall = require("./middlewares/adminFirewall");
const backupRoutes = require("./routes/backupRoutes");

const ipLimiter = require("./middlewares/ipLimiter");
const autoBan = require("./middlewares/autoBan");
const auditLogger = require("./middlewares/auditLogger");

// ========================
// BASIC SETUP
// ========================
app.use(cors());
app.use(express.json());

// ========================
// GLOBAL FIREWALL
// ========================
app.use(ipLimiter);
app.use(autoBan);
app.use(auditLogger);

// ========================
// ROUTES
// ========================
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contentRoutes = require("./routes/contentRoutes");
const alertRoutes = require("./routes/alertRoutes");

// ========================
// ROUTE MOUNTING
// ========================
app.use("/api/products", productRoutes);   // 🔥 CRITICAL FIX
app.use("/api/user", userRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/backup", adminFirewall, backupRoutes);

// ========================
// ROOT CHECK
// ========================
app.get("/", (req, res) => {
  res.send("🛡️ SafeBite Secure Backend Online");
});

// ========================
// DATABASE CONNECT
// ========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 MongoDB Connected"))
  .catch(err => console.error("Mongo Error:", err));

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SafeBite Secure Server Running on ${PORT}`);
});
