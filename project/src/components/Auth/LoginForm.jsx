/** @format */

import React, { useState } from "react";
import { Eye, EyeOff, Lock, User, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export function LoginForm() {
	const [accessType, setAccessType] = useState("student");
	const [showRegister, setShowRegister] = useState(false);
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const [registerData, setRegisterData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		department: "",
		year: "",
		studentId: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { login, loginWithGoogle, backendStatus } = useAuth();

	const departments = [
		"Computer Science",
		"Engineering",
		"Business Administration",
		"Medicine",
		"Law",
		"Agriculture",
		"Education",
		"Natural Sciences",
		"Social Sciences",
		"Arts and Humanities"
	];

	const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduate"];

	const validatePassword = (password) => {
		const lengthCheck = password.length >= 8;
		const upperCaseCheck = /[A-Z]/.test(password);
		return lengthCheck && upperCaseCheck;
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		// Validation
		if (registerData.password !== registerData.confirmPassword) {
			toast.error("Passwords do not match");
			setIsLoading(false);
			return;
		}

		if (!validatePassword(registerData.password)) {
			toast.error("Password must be at least 8 characters long and contain at least one uppercase letter.");
			setIsLoading(false);
			return;
		}

		try {
			// Register user
			const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: registerData.name,
					email: registerData.email,
					password: registerData.password,
					department: registerData.department,
					year: registerData.year,
					studentId: registerData.studentId,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Registration failed');
			}

			toast.success("Registration successful! You can now login.");
			setShowRegister(false);
			setRegisterData({
				name: "",
				email: "",
				password: "",
				confirmPassword: "",
				department: "",
				year: "",
				studentId: "",
			});
		} catch (error) {
			console.error('Registration error:', error);
			toast.error(error.message || "Registration failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		if (accessType === "admin") {
			if (formData.username !== "AdminDBU" || formData.password !== "Admin123#") {
				toast.error("Invalid admin credentials. Use AdminDBU / Admin123#");
				setIsLoading(false);
				return;
			}
		}

		try {
			if (accessType === "admin") {
				await login(formData.username, formData.password, null, "admin");
				toast.success("Login successful");
			} else if (accessType === "student") {
				if (!validatePassword(formData.password)) {
					toast.error("Password must be at least 8 characters long and contain at least one uppercase letter.");
					setIsLoading(false);
					return;
				}
				await login(formData.username, formData.password, null, null);
				toast.success("Login successful");
			}
		} catch (error) {
			console.error('Login error:', error);
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

	const handleRegisterInputChange = (e) => {
		const { name, value } = e.target;
		setRegisterData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleForgotPassword = () => {
		toast.info("Forgot password functionality not implemented yet.");
	};

	if (showRegister) {
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
							<h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
							<p className="text-gray-600">Register as a new student.</p>
						</div>
					</div>

					{/* Registration Form */}
					<motion.form
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="space-y-4"
						onSubmit={handleRegister}>
						
						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
								Full Name *
							</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								value={registerData.name}
								onChange={handleRegisterInputChange}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
								placeholder="Enter your full name"
							/>
						</div>

						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
								Email Address *
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								value={registerData.email}
								onChange={handleRegisterInputChange}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
								placeholder="your.email@dbu.edu.et"
							/>
						</div>

						<div>
							<label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
								Student ID (Username) *
							</label>
							<input
								id="studentId"
								name="studentId"
								type="text"
								required
								value={registerData.studentId}
								onChange={handleRegisterInputChange}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
								placeholder="DBU10102324"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
									Department *
								</label>
								<select
									id="department"
									name="department"
									required
									value={registerData.department}
									onChange={handleRegisterInputChange}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
									<option value="">Select Department</option>
									{departments.map((dept) => (
										<option key={dept} value={dept}>{dept}</option>
									))}
								</select>
							</div>

							<div>
								<label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
									Year *
								</label>
								<select
									id="year"
									name="year"
									required
									value={registerData.year}
									onChange={handleRegisterInputChange}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
									<option value="">Select Year</option>
									{years.map((year) => (
										<option key={year} value={year}>{year}</option>
									))}
								</select>
							</div>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
								Password *
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									required
									value={registerData.password}
									onChange={handleRegisterInputChange}
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
							<p className="text-xs text-gray-500 mt-1">
								Must be at least 8 characters with one uppercase letter
							</p>
						</div>

						<div>
							<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
								Confirm Password *
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									id="confirmPassword"
									name="confirmPassword"
									type={showPassword ? "text" : "password"}
									required
									value={registerData.confirmPassword}
									onChange={handleRegisterInputChange}
									className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
									placeholder="••••••••"
								/>
							</div>
						</div>

						{/* Submit Button */}
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							type="submit"
							disabled={isLoading}
							className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}>
							{isLoading ? "Creating Account..." : "Create Account"}
						</motion.button>

						{/* Back to Login */}
						<div className="text-center">
							<button
								type="button"
								onClick={() => setShowRegister(false)}
								className="text-sm text-blue-600 hover:underline">
								Already have an account? Login
							</button>
						</div>
					</motion.form>
				</motion.div>
			</div>
		);
	}

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

				{/* Backend Status */}
				{backendStatus === 'offline' && (
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
						<p className="text-yellow-800 text-sm text-center">
							⚠️ Running in demo mode - Backend server offline
						</p>
					</div>
				)}

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
						{accessType === "admin" && (
							<p className="text-xs text-gray-500 mt-1">
								Admin credentials: AdminDBU / Admin123#
							</p>
						)}
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

					{/* Register Link */}
					{accessType === "student" && (
						<div className="text-center">
							<button
								type="button"
								onClick={() => setShowRegister(true)}
								className="text-sm text-blue-600 hover:underline">
								Don't have an account? Register here
							</button>
						</div>
					)}

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
