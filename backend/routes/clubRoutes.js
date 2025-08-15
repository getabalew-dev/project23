/** @format */

import express from "express";
import Club from "../models/Club.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Create a new club (Admin only)
router.post("/", authenticateToken, upload.single('clubImage'), async (req, res) => {
	try {
		// Allow any authenticated user to create clubs for demo purposes
		// In production, uncomment the line below:
		// if (req.user.role !== "admin" && req.user.role !== "clubs_associations" && !req.user.isAdmin) {
		//   return res.status(403).json({ message: "Admin access required" });
		// }

		const { name, category, description, founded } = req.body;
		
		if (!name || !category) {
			return res.status(400).json({ message: "Name and category are required" });
		}

		// Handle uploaded image
		const imageUrl = req.file ? `/uploads/${req.file.filename}` : 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400';

		const club = new Club({
			name,
			category,
			description: description || `${name} - A ${category.toLowerCase()} club at DBU`,
			image: imageUrl,
			founded: founded ? new Date(founded) : new Date(),
			members: [],
			posts: [],
			joinRequests: [],
			events: []
		});

		const savedClub = await club.save();
		res.status(201).json(savedClub);
	} catch (err) {
		console.error("Error creating club:", err);
		res.status(400).json({ message: err.message });
	}
});

// Get all clubs
router.get("/", async (req, res) => {
	try {
		const clubs = await Club.find()
			.populate("members", "name email department year")
			.populate("posts.author", "name");
		res.status(200).json(clubs);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Get club by ID
router.get("/:id", async (req, res) => {
	try {
		const club = await Club.findById(req.params.id)
			.populate("members", "name email department year")
			.populate("posts.author", "name")
			.populate("joinRequests.user", "name email department year");
		
		if (!club) {
			return res.status(404).json({ message: "Club not found" });
		}
		
		res.status(200).json(club);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Request to join club
router.post("/:id/join", authenticateToken, async (req, res) => {
	try {
		const { department, year, reason } = req.body;
		const club = await Club.findById(req.params.id);
		
		if (!club) {
			return res.status(404).json({ message: "Club not found" });
		}

		// Check if user is already a member
		if (club.members.includes(req.user._id)) {
			return res.status(400).json({ message: "You are already a member of this club" });
		}

		// Check if user already has a pending request
		const existingRequest = club.joinRequests.find(
			request => request.user.toString() === req.user._id.toString() && request.status === "pending"
		);

		if (existingRequest) {
			return res.status(400).json({ message: "You already have a pending join request" });
		}

		club.joinRequests.push({
			user: req.user._id,
			department,
			year,
			reason,
		});

		await club.save();
		res.status(200).json({ message: "Join request submitted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Approve/Reject join request (Admin only)
router.patch("/:clubId/join-requests/:requestId", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "admin" && req.user.role !== "clubs_associations" && !req.user.isAdmin) {
			return res.status(403).json({ message: "Admin access required" });
		}

		const { status } = req.body; // "approved" or "rejected"
		const club = await Club.findById(req.params.clubId);
		
		if (!club) {
			return res.status(404).json({ message: "Club not found" });
		}

		const request = club.joinRequests.id(req.params.requestId);
		if (!request) {
			return res.status(404).json({ message: "Join request not found" });
		}

		request.status = status;

		if (status === "approved") {
			club.members.push(request.user);
		}

		await club.save();
		res.status(200).json({ message: `Join request ${status} successfully` });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Get club members with live count
router.get("/:id/members", async (req, res) => {
	try {
		const club = await Club.findById(req.params.id)
			.populate("members", "name email department year studentId")
			.select("members name");
		
		if (!club) {
			return res.status(404).json({ message: "Club not found" });
		}
		
		res.status(200).json({
			clubName: club.name,
			memberCount: club.members.length,
			members: club.members
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Add member directly (Admin only)
router.post("/:id/members", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "admin" && !req.user.isAdmin) {
			return res.status(403).json({ message: "Admin access required" });
		}

		const { userId } = req.body;
		const club = await Club.findById(req.params.id);
		
		if (!club) {
			return res.status(404).json({ message: "Club not found" });
		}

		if (club.members.includes(userId)) {
			return res.status(400).json({ message: "User is already a member" });
		}

		club.members.push(userId);
		await club.save();
		
		res.status(200).json({ message: "Member added successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Create club post
router.post("/:id/posts", authenticateToken, async (req, res) => {
	try {
		const { title, content, image } = req.body;
		const club = await Club.findById(req.params.id);
		
		if (!club) {
			return res.status(404).json({ message: "Club not found" });
		}

		// Check if user is a member or admin
		if (!club.members.includes(req.user._id) && req.user.role !== "admin") {
			return res.status(403).json({ message: "You must be a member to post" });
		}

		club.posts.push({
			title,
			content,
			image,
			author: req.user._id,
		});

		await club.save();
		await club.populate("posts.author", "name");
		
		res.status(201).json({ message: "Post created successfully", club });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;