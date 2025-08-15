/** @format */

import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS — cleaned up origins
const allowedOrigins = process.env.CORS_ORIGINS
	? process.env.CORS_ORIGINS.split(",").map(url => url.trim())
	: ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
	origin: allowedOrigins,
	credentials: true
}));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

console.log("MongoDB URI:", process.env.MONGODB_URI);

// Connect to MongoDB (no blocking middleware)
mongoose.connect(process.env.MONGODB_URI)
	.then(() => console.log("✅ MongoDB connected successfully!"))
	.catch(err => {
		console.error("❌ MongoDB connection error:", err);
		process.exit(1);
	});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/stats", statsRoutes);

// Health check
app.get("/", (req, res) => {
	res.json({ message: "DBU Student Union API is running!" });
});

app.get("/api/health", (req, res) => {
	res.json({
		status: "OK",
		timestamp: new Date().toISOString(),
		database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
	});
});

// Error handler
app.use((error, req, res, next) => {
	console.error("Server Error:", error);
	res.status(500).json({
		message: "Internal server error",
		error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
	});
});

// Start server
app.listen(port, () => {
	console.log(`🚀 Server is running on http://localhost:${port}`);
});
