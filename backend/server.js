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

// CORS configuration - more permissive for development
app.use(cors({
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);
		
		const allowedOrigins = process.env.CORS_ORIGINS
			? process.env.CORS_ORIGINS.split(",").map(url => url.trim())
			: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:5174"];
		
		// Always allow in development
		if (process.env.NODE_ENV === 'development' || allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(null, true); // Allow all origins in development
		}
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB with better error handling
const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dbu_student_union", {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error("❌ MongoDB connection error:", error.message);
		console.log("⚠️ Running without database - using demo mode");
	}
};

// Try to connect to MongoDB
connectDB();

// Add request logging middleware for debugging
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
	next();
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

// 404 handler for API routes
app.use('/api/*', (req, res) => {
	res.status(404).json({
		message: `API endpoint ${req.originalUrl} not found`,
		availableEndpoints: [
			'/api/auth',
			'/api/users',
			'/api/complaints',
			'/api/clubs',
			'/api/posts',
			'/api/elections',
			'/api/contact',
			'/api/stats'
		]
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
	console.log(`📊 Health check available at http://localhost:${port}/api/health`);
	console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});
