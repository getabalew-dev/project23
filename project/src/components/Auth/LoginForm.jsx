/** @format */

import React, { useState } from "react";
import { Eye, EyeOff, Lock, User, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export function LoginForm() {
	const [accessType, setAccessType] = useState("student");
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { login, loginWithGoogle } = useAuth();

	const validatePassword = (password) => {
		const lengthCheck = password.length >= 8;
		const upperCaseCheck = /[A-Z]/.test(password);
		return lengthCheck && upperCaseCheck;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		if (accessType === "admin") {
			if (formData.password !== "Admin123#") {
				toast.error("Invalid admin password. Use Please try again.");
				setIsLoading(false);
				return;
			}
		} else if (!validatePassword(formData.password)) {
			toast.error(
				"Password must be at least 8 characters long and contain at least one uppercase letter."
			);
			setIsLoading(false);
			return;
		}

		try {
			if (accessType === "admin") {
				const adminUsername = "AdminDBU"; // Fixed admin username
				await login(adminUsername, formData.password);
				toast.success("Login successful");
			} else if (accessType === "student") {
				await login(formData.username, formData.password);
				toast.success("Login successful");
			}
		} catch (error) {
			toast.error(error.message || "Invalid credentials");
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleForgotPassword = () => {
		// Implement your forgot password logic here
		toast.info("Forgot password functionality not implemented yet.");
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 sm:px-6 lg:px-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="max-w-md w-full space-y-8">
				{/* Header */}
				<div className="text-center">
					<motion.div
						initial={{ scale: 0.8 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
						className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-6">
						<span className="text-white font-bold text-2xl">DBU</span>
					</motion.div>

					<div>
						<h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
						<p className="text-gray-600">Please enter your credentials.</p>
					</div>
				</div>

				{/* Access Type Toggle */}
				<div className="flex bg-gray-100 rounded-lg p-1">
					<button
						type="button"
						onClick={() => {
							setAccessType("student");
							setFormData({ username: "", password: "" });
						}}
						className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
							accessType === "student"
								? "bg-white text-blue-700 shadow-sm"
								: "text-gray-500 hover:text-gray-700"
						}`}>
						<User className="w-4 h-4" />
						<span>Student Login</span>
					</button>
					<button
						type="button"
						onClick={() => {
							setAccessType("admin");
							setFormData({ username: "", password: "" });
						}}
						className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
							accessType === "admin"
								? "bg-white text-blue-700 shadow-sm"
								: "text-gray-500 hover:text-gray-700"
						}`}>
						<Shield className="w-4 h-4" />
						<span>Admin Portal</span>
					</button>
				</div>

				{/* Form */}
				<motion.form
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="space-y-6"
					onSubmit={handleSubmit}>
					{/* Username */}
					<div>
						<label
							htmlFor="username"
							className="block text-sm font-medium text-gray-700 mb-2">
							{accessType === "admin"
								? "Admin Username"
								: "Username (e.g., DBU10102324)"}
						</label>
						<div className="relative">
							<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								id="username"
								name="username"
								type="text"
								required={accessType === "student"}
								value={accessType === "admin" ? "AdminDBU" : formData.username}
								readOnly={accessType === "admin"}
								onChange={handleInputChange}
								className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
								placeholder={
									accessType === "admin" ? "AdminDBU" : "DBU10102324"
								}
							/>
						</div>
					</div>

					{/* Password */}
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700 mb-2">
							Password
						</label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								required
								value={formData.password}
								onChange={handleInputChange}
								className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
								placeholder="••••••••"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
								{showPassword ? (
									<EyeOff className="w-5 h-5" />
								) : (
									<Eye className="w-5 h-5" />
								)}
							</button>
						</div>
					</div>

					{/* Submit Button */}
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						type="submit"
						disabled={isLoading}
						className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}>
						{isLoading ? "Loading..." : "Login"}
					</motion.button>

					{/* Forgot Password */}
					<div className="text-center">
						<button
							type="button"
							onClick={handleForgotPassword}
							className="text-sm text-blue-600 hover:underline">
							Forgot Password?
						</button>
					</div>
				</motion.form>
			</motion.div>
		</div>
	);
}
