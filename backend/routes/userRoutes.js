/** @format */

import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Create a new user
router.post("/", async (req, res) => {
	const { name, email, password, department, year, studentId } = req.body;

	// Validate required fields
	if (!name || !email || !password || !department || !year || !studentId) {
		return res.status(400).json({ message: "All fields are required" });
	}

	try {
		// Check for existing user with same username or email
		const existingUser = await User.findOne({
			$or: [{ email }, { studentId }],
		});
		if (existingUser) {
			return res
				.status(400)
				.json({ message: "Username or email already exists" });
		}

		const user = new User({
			name,
			email,
			password,
			department,
			year,
			studentId,
		});
		const savedUser = await user.save();
		res.status(201).json(savedUser);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// Get all users
router.get("/", async (req, res) => {
	try {
		const users = await User.find();
		res.status(200).json(users);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;
