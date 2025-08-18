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

		// Handle admin token
		if (token.startsWith('admin_')) {
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

		try {
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET || "fallback_secret"
			);
			
			// Handle demo/offline tokens
			if (decoded.userId && decoded.userId.startsWith('demo_')) {
				req.user = {
					_id: decoded.userId,
					id: decoded.userId,
					name: decoded.name || "Demo Student",
					email: decoded.email,
					role: decoded.role || "student",
					isAdmin: decoded.role === "admin",
				};
				return next();
			}

			const user = await User.findById(decoded.userId);

			if (!user) {
				return res.status(401).json({ message: "Invalid token" });
			}

			req.user = {
				...user.toObject(),
				isAdmin: user.role === "admin",
			};
		} catch (jwtError) {
			// Try to parse as base64 encoded token for offline mode
			try {
				const decodedOffline = JSON.parse(atob(token));
				req.user = {
					_id: decodedOffline.userId,
					id: decodedOffline.userId,
					name: decodedOffline.name || "Demo User",
					email: decodedOffline.email,
					role: decodedOffline.role || "student",
					isAdmin: decodedOffline.role === "admin",
				};
			} catch (parseError) {
				return res.status(403).json({ message: "Invalid token" });
			}
		}

		next();
	} catch (error) {
		return res.status(403).json({ message: "Invalid token" });
	}
};

export const requireAdmin = (req, res, next) => {
	if (req.user.role !== "admin" && !req.user.isAdmin) {
		return res.status(403).json({ message: "Admin access required" });
	}
	next();
};
