import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import adminFirewall from "./middlewares/adminFirewall.js";
import backupRoutes from "./routes/backupRoutes.js";

import ipLimiter from "./middlewares/ipLimiter.js";
import autoBan from "./middlewares/autoBan.js";
import auditLogger from "./middlewares/auditLogger.js";

import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";

const app = express();

// BASIC
app.use(cors());
app.use(express.json());

// SECURITY
app.use(ipLimiter);
app.use(autoBan);
app.use(auditLogger);

// ROUTES
app.use("/api/product", productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/backup", adminFirewall, backupRoutes);

// ROOT
app.get("/", (req, res) => {
  res.send("🛡️ SafeBite Secure Backend Online");
});

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 MongoDB Connected"))
  .catch(err => console.error("Mongo Error:", err));

// START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SafeBite Secure Server Running on ${PORT}`);
});
