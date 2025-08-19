/** @format */

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateToken = async (req, res, next) => {
	try {
		const authHeader = req.headers["authorization"];
		const token = authHeader && authHeader.split(" ")[1];

		if (!token) {
			return res.status(401).json({ message: "Access token required" });
		}

		try {
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET || "fallback_secret"
			);
			
			// Handle admin token
			if (decoded.role === "admin" || decoded.isAdmin) {
				req.user = {
					_id: "admin_001",
					id: "admin_001",
					name: "System Administrator",
					email: "admin@dbu.edu.et",
					role: "admin",
					isAdmin: true,
				};
				return next();
			}
			
			// Handle demo/offline tokens
			if (decoded.userId && decoded.userId.startsWith('demo_')) {
				req.user = {
					_id: decoded.userId,
					id: decoded.userId,
					name: "Demo Student",
					email: decoded.email,
					role: decoded.role || "student",
					department: "Computer Science",
					year: "3rd Year",
					studentId: decoded.email,
					isAdmin: decoded.role === "admin",
				};
				return next();
			}

			// Handle real user tokens
			const user = await User.findById(decoded.userId);
			if (!user) {
				return res.status(401).json({ message: "Invalid token" });
			}

			req.user = {
				...user.toObject(),
				isAdmin: user.role === "admin",
			};
			
			next();
		} catch (jwtError) {
			console.error("JWT verification failed:", jwtError);
			return res.status(403).json({ message: "Invalid token" });
		}
	} catch (error) {
		console.error("Auth middleware error:", error);
		return res.status(403).json({ message: "Invalid token" });
	}
};

export const requireAdmin = (req, res, next) => {
	if (req.user.role !== "admin" && !req.user.isAdmin) {
		return res.status(403).json({ message: "Admin access required" });
	}
	next();
};
