/** @format */

import express from "express";
import Post from "../models/Post.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Create a new post (Admin only)
router.post("/", authenticateToken, upload.single('media'), async (req, res) => {
	try {
		// Allow both admin users and users with admin role
		if (req.user.role !== "admin" && req.user.role !== "president" && req.user.role !== "student_din" && !req.user.isAdmin) {
			return res.status(403).json({ message: "Admin access required" });
		}

		const {
			type,
			title,
			content,
			date,
			category,
			location,
			time,
			important,
		} = req.body;

		// Handle uploaded media
		const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;

		const post = new Post({
			type,
			title,
			content,
			date,
			category,
			image: mediaUrl,
			location,
			time,
			important,
		});

		const savedPost = await post.save();
		res.status(201).json(savedPost);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// Get all posts
router.get("/", async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });
		res.status(200).json(posts);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Get post by ID
router.get("/:id", async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}
		res.status(200).json(post);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Update post (Admin only)
router.put("/:id", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "admin" && !req.user.isAdmin) {
			return res.status(403).json({ message: "Admin access required" });
		}

		const updatedPost = await Post.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		
		if (!updatedPost) {
			return res.status(404).json({ message: "Post not found" });
		}
		
		res.status(200).json(updatedPost);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Delete post (Admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "admin" && !req.user.isAdmin) {
			return res.status(403).json({ message: "Admin access required" });
		}

		const deletedPost = await Post.findByIdAndDelete(req.params.id);
		
		if (!deletedPost) {
			return res.status(404).json({ message: "Post not found" });
		}
		
		res.status(200).json({ message: "Post deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;