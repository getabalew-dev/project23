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

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || "fallback_secret"
		);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(401).json({ message: "Invalid token" });
		}

		req.user = {
			...user.toObject(),
			isAdmin: user.role === "admin",
		};
		next();
	} catch (error) {
		return res.status(403).json({ message: "Invalid token" });
	}
};

export const requireAdmin = (req, res, next) => {
	if (req.user.role !== "admin") {
		return res.status(403).json({ message: "Admin access required" });
	}
	next();
};
