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
		const { email, password, adminRole } = req.body;

		// Handle admin login
		if (adminRole) {
			// Check for admin credentials
			const adminCredentials = {
				"AdminDBU": {
					password: "Admin123#",
					role: "admin",
					name: "System Administrator",
					email: "admin@dbu.edu.et"
				}
			};

			if (email === "AdminDBU" && password === "Admin123#") {
				const token = jwt.sign(
					{ userId: "admin_001", role: "admin" },
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
			} else {
				return res.status(401).json({ message: "Invalid admin credentials" });
			}
		}

		// Regular user login
		const user = await User.findOne({ 
			$or: [{ email }, { studentId: email }] 
		});
		
		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const token = jwt.sign(
			{ userId: user._id },
			process.env.JWT_SECRET || "fallback_secret",
			{ expiresIn: "7d" }
		);

		res.json({
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
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
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