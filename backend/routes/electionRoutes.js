/** @format */

import express from "express";
import Election from "../models/Election.js";
import User from "../models/User.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Create a new election (Admin only)
router.post("/", authenticateToken, upload.array('candidateImages', 10), async (req, res) => {
	try {
		if (req.user.role !== "admin" && req.user.role !== "president" && !req.user.isAdmin) {
			return res.status(403).json({ message: "Admin access required" });
		}

		const { title, description, startDate, endDate, eligibleVoters } = req.body;
		let { candidates } = req.body;
		
		// Parse candidates if it's a string
		if (typeof candidates === 'string') {
			candidates = JSON.parse(candidates);
		}
		
		// Validate required fields
		if (!title || !description || !startDate || !endDate || !candidates || candidates.length < 2) {
			return res.status(400).json({ message: "All fields are required and at least 2 candidates needed" });
		}

		// Process uploaded images
		const processedCandidates = candidates.map((candidate, index) => {
			const imageFile = req.files && req.files[index];
			return {
				...candidate,
				votes: 0,
				profileImage: imageFile ? `/uploads/${imageFile.filename}` : candidate.profileImage || 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400'
			};
		});

		const election = new Election({
			title,
			description,
			startDate: new Date(startDate),
			endDate: new Date(endDate),
			candidates: processedCandidates,
			eligibleVoters: eligibleVoters || 12547,
			createdBy: req.user._id,
			status: new Date(startDate) <= new Date() ? "Ongoing" : "Pending"
		});

		const savedElection = await election.save();
		res.status(201).json(savedElection);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// Get all elections
router.get("/", async (req, res) => {
	try {
		const elections = await Election.find()
			.populate("createdBy", "name email")
			.sort({ createdAt: -1 });
		res.status(200).json(elections);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Get election by ID
router.get("/:id", async (req, res) => {
	try {
		const election = await Election.findById(req.params.id)
			.populate("createdBy", "name email")
			.populate("voters", "name email");

		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		res.status(200).json(election);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Vote in election
router.post("/:id/vote", authenticateToken, async (req, res) => {
	try {
		const { candidateId } = req.body;
		const election = await Election.findById(req.params.id);

		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		// Check if election is active
		const now = new Date();
		if (now < election.startDate || now > election.endDate) {
			return res.status(400).json({ message: "Election is not currently active" });
		}

		// Check if user has already voted
		if (election.voters.includes(req.user._id)) {
			return res.status(400).json({ message: "You have already voted in this election" });
		}

		// Find candidate and increment votes
		const candidate = election.candidates.id(candidateId);
		if (!candidate) {
			return res.status(404).json({ message: "Candidate not found" });
		}

		candidate.votes += 1;
		election.totalVotes += 1;
		election.voters.push(req.user._id);

		await election.save();

		// Update user's voted elections
		await User.findByIdAndUpdate(req.user._id, {
			$push: { votedElections: election._id }
		});

		res.status(200).json({ message: "Vote cast successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Update election status (Admin only)
router.patch("/:id/status", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "admin" && !req.user.isAdmin) {
			return res.status(403).json({ message: "Admin access required" });
		}

		const { status } = req.body;
		const election = await Election.findById(req.params.id);

		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		election.status = status;
		await election.save();

		res.status(200).json({ message: "Election status updated successfully", election });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Announce election results (Admin only)
router.post("/:id/announce", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "admin" && !req.user.isAdmin) {
			return res.status(403).json({ message: "Admin access required" });
		}

		const election = await Election.findById(req.params.id);

		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		if (election.status !== "Completed") {
			return res.status(400).json({ message: "Election must be completed before announcing results" });
		}

		// Sort candidates by votes to determine winner
		const sortedCandidates = election.candidates.sort((a, b) => b.votes - a.votes);
		const winner = sortedCandidates[0];

		res.status(200).json({
			message: "Election results announced successfully",
			winner: winner,
			results: sortedCandidates,
			totalVotes: election.totalVotes
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Delete election (Admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== "admin" && !req.user.isAdmin) {
			return res.status(403).json({ message: "Admin access required" });
		}

		const election = await Election.findById(req.params.id);

		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		// Don't allow deletion of ongoing elections with votes
		if (election.status === "Ongoing" && election.totalVotes > 0) {
			return res.status(400).json({ message: "Cannot delete ongoing election with votes" });
		}

		await Election.findByIdAndDelete(req.params.id);
		res.status(200).json({ message: "Election deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;