/** @format */

import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
	try {
		const { name, email, password, department, year, studentId } = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ 
			$or: [{ email }, { studentId }] 
		});
		
		if (existingUser) {
			return res.status(400).json({ 
				message: "User with this email or student ID already exists" 
			});
		}

		const user = new User({
			name,
			email,
			password,
			department,
			year,
			studentId,
		});

		await user.save();

		const token = jwt.sign(
			{ userId: user._id },
			process.env.JWT_SECRET || "fallback_secret",
			{ expiresIn: "7d" }
		);

		res.status(201).json({
			message: "User registered successfully",
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				department: user.department,
				year: user.year,
				studentId: user.studentId,
				role: user.role,
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Login
router.post("/login", async (req, res) => {
	try {
		const { email, password, username, adminRole } = req.body;

		console.log("Login attempt:", { email, username, adminRole });

		// Handle admin login
		if ((email === "AdminDBU" || username === "AdminDBU") && password === "Admin123#") {
			// Check for admin credentials
			const token = jwt.sign(
				{ userId: "admin_001", role: "admin", isAdmin: true },
				process.env.JWT_SECRET || "fallback_secret",
				{ expiresIn: "7d" }
			);

			return res.json({
				message: "Admin login successful",
				token,
				user: {
					id: "admin_001",
					name: "System Administrator",
					email: "admin@dbu.edu.et",
					role: "admin",
					isAdmin: true,
				},
			});
		}

		// Handle admin login failure
		if ((email === "AdminDBU" || username === "AdminDBU") && password !== "Admin123#") {
			return res.status(401).json({ message: "Invalid admin credentials" });
		}

		// Regular user login - try to find user first
		const loginField = email || username;
		const user = await User.findOne({ 
			$or: [{ email: loginField }, { studentId: loginField }] 
		});
		
		if (user) {
			// Existing user login
			const isPasswordValid = await user.comparePassword(password);
			if (!isPasswordValid) {
				return res.status(401).json({ message: "Invalid credentials" });
			}

			const token = jwt.sign(
				{ userId: user._id },
				process.env.JWT_SECRET || "fallback_secret",
				{ expiresIn: "7d" }
			);

			return res.json({
				message: "Login successful",
				token,
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					department: user.department,
					year: user.year,
					studentId: user.studentId,
					role: user.role,
					isAdmin: user.role === "admin",
				},
			});
		}

		// If no user found and password is valid, create demo user
		if (password.length >= 8) {
			const demoToken = jwt.sign(
				{ 
					userId: "demo_" + Date.now(),
					email: loginField,
					role: "student"
				},
				process.env.JWT_SECRET || "fallback_secret",
				{ expiresIn: "7d" }
			);

			return res.json({
				message: "Demo login successful",
				token: demoToken,
				user: {
					id: "demo_" + Date.now(),
					name: "Demo Student",
					email: loginField,
					department: "Computer Science",
					year: "3rd Year",
					studentId: loginField,
					role: "student",
					isAdmin: false,
				},
			});
		}

		return res.status(401).json({ message: "Invalid credentials" });
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ message: error.message });
	}
});

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
	try {
		// Handle admin user
		if (req.user.role === "admin") {
			return res.json({
				user: {
					id: req.user._id,
					name: req.user.name,
					email: req.user.email,
					role: req.user.role,
					isAdmin: true,
				},
			});
		}

		// Handle demo user
		if (req.user._id && req.user._id.startsWith('demo_')) {
			return res.json({
				user: {
					id: req.user._id,
					name: req.user.name,
					email: req.user.email,
					department: "Computer Science",
					year: "3rd Year",
					studentId: req.user.email,
					role: req.user.role,
					isAdmin: false,
				},
			});
		}

		const user = await User.findById(req.user._id || req.user.id).select("-password");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				department: user.department,
				year: user.year,
				studentId: user.studentId,
				role: user.role,
				isAdmin: user.role === "admin",
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

export default router;