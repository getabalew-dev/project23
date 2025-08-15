/** @format */

import React from "react";
import {
	Users,
	Vote,
	MessageSquare,
	Award,
	Activity,
	Calendar,
	Bell,
	Clock,
	TrendingUp,
	CheckCircle,
	AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import "../../app.css";

const stats = [
	{
		title: "Active Students",
		value: "12,547",
		change: "+12%",
		icon: Users,
		color: "bg-blue-500",
	},
	{
		title: "Ongoing Elections",
		value: "3",
		change: "2 ending soon",
		icon: Vote,
		color: "bg-green-500",
	},
	{
		title: "Active Clubs",
		value: "47",
		change: "+5 this month",
		icon: Award,
		color: "bg-purple-500",
	},
	{
		title: "Pending Complaints",
		value: "23",
		change: "-8 resolved",
		icon: MessageSquare,
		color: "bg-orange-500",
	},
];

const recentActivities = [
	{
		id: 1,
		title: "New election started: Student Union President",
		time: "2 hours ago",
		type: "election",
		icon: Vote,
		color: "text-green-600",
	},
	{
		id: 2,
		title: "Drama Club submitted monthly report",
		time: "4 hours ago",
		type: "club",
		icon: Award,
		color: "text-purple-600",
	},
	{
		id: 3,
		title: "Complaint resolved: Library access issue",
		time: "1 day ago",
		type: "complaint",
		icon: CheckCircle,
		color: "text-blue-600",
	},
	{
		id: 4,
		title: "New club registration: Photography Club",
		time: "2 days ago",
		type: "club",
		icon: Award,
		color: "text-purple-600",
	},
];

const upcomingEvents = [
	{
		id: 1,
		title: "Annual Cultural Festival",
		date: "2024-02-15",
		time: "09:00 AM",
		location: "Main Campus",
		priority: "high",
	},
	{
		id: 2,
		title: "Student Council Meeting",
		date: "2024-02-10",
		time: "02:00 PM",
		location: "Conference Hall",
		priority: "medium",
	},
	{
		id: 3,
		title: "Club Leaders Workshop",
		date: "2024-02-12",
		time: "10:00 AM",
		location: "Student Union Building",
		priority: "medium",
	},
];

const quickActions = [
	{
		title: "Start New Election",
		description: "Create student election",
		icon: Vote,
		color: "bg-blue-100 text-blue-600",
		hoverColor: "hover:bg-blue-50",
		link: "/elections",
	},
	{
		title: "Manage Clubs",
		description: "Review club requests",
		icon: Users,
		color: "bg-purple-100 text-purple-600",
		hoverColor: "hover:bg-purple-50",
		link: "/clubs",
	},
	{
		title: "View Reports",
		description: "Analytics and insights",
		icon: Activity,
		color: "bg-orange-100 text-orange-600",
		hoverColor: "hover:bg-orange-50",
		link: "/complaints",
	},
];

export function Dashboard() {
	const { user } = useAuth();

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 17) return "Good afternoon";
		return "Good evening";
	};

	return (
		<div className="space-y-6">
			{/* Welcome Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white relative overflow-hidden">
				<div className="relative z-10">
					<h1 className="text-2xl font-bold mb-2">
						{getGreeting()}, {user?.name}!
					</h1>
					<p className="text-blue-100 mb-4">Welcome to your Student Union Portal</p>
					<div className="flex items-center space-x-4 text-sm">
						<div className="flex items-center space-x-1">
							<Users className="w-4 h-4" />
							<span>Role: {user?.role || 'Student'}</span>
						</div>
						<div className="flex items-center space-x-1">
							<Calendar className="w-4 h-4" />
							<span>{new Date().toLocaleDateString()}</span>
						</div>
					</div>
				</div>
				<div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
				<div className="absolute bottom-0 right-0 w-20 h-20 bg-white bg-opacity-5 rounded-full -mr-10 -mb-10"></div>
			</motion.div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{stats.map((stat, index) => (
					<motion.div
						key={stat.title}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									{stat.title}
								</p>
								<p className="text-2xl font-bold text-gray-900 mt-1">
									{stat.value}
								</p>
								<div className="flex items-center mt-1">
									<TrendingUp className="w-3 h-3 text-green-500 mr-1" />
									<p className="text-sm text-green-600">{stat.change}</p>
								</div>
							</div>
							<div
								className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
								<stat.icon className="w-6 h-6 text-white" />
							</div>
						</div>
					</motion.div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Recent Activity */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.4 }}
					className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900">
							Recent Activity
						</h3>
						<Bell className="w-5 h-5 text-gray-400" />
					</div>
					<div className="space-y-4">
						{recentActivities.map((activity) => (
							<div
								key={activity.id}
								className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
								<div className={`mt-1 ${activity.color}`}>
									<activity.icon className="w-4 h-4" />
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-900">
										{activity.title}
									</p>
									<p className="text-xs text-gray-500">{activity.time}</p>
								</div>
							</div>
						))}
					</div>
				</motion.div>

				{/* Upcoming Events */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.5 }}
					className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900">
							Upcoming Events
						</h3>
						<Calendar className="w-5 h-5 text-gray-400" />
					</div>
					<div className="space-y-4">
						{upcomingEvents.map((event) => (
							<div
								key={event.id}
								className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
								<div className="flex items-start justify-between mb-2">
									<h4 className="font-medium text-gray-900 text-sm">
										{event.title}
									</h4>
									{event.priority === 'high' && (
										<AlertTriangle className="w-4 h-4 text-orange-500" />
									)}
								</div>
								<div className="space-y-1 text-xs text-gray-600">
									<div className="flex items-center space-x-1">
										<Calendar className="w-3 h-3" />
										<span>{new Date(event.date).toLocaleDateString()}</span>
									</div>
									<div className="flex items-center space-x-1">
										<Clock className="w-3 h-3" />
										<span>{event.time}</span>
									</div>
									<div className="flex items-center space-x-1">
										<span>📍</span>
										<span>{event.location}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</motion.div>
			</div>

			{/* Quick Actions */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.6 }}
				className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Quick Actions
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{quickActions.map((action, index) => (
						<motion.a
							key={action.title}
							href={action.link}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className={`p-4 border border-gray-200 rounded-lg ${action.hoverColor} transition-colors text-left block`}>
							<div className="flex items-center space-x-3">
								<div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
									<action.icon className="w-5 h-5" />
								</div>
								<div>
									<p className="font-medium text-gray-900">
										{action.title}
									</p>
									<p className="text-sm text-gray-500">
										{action.description}
									</p>
								</div>
							</div>
						</motion.a>
					))}
				</div>
			</motion.div>

			{/* Performance Metrics */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.7 }}
				className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					System Performance
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="text-center">
						<div className="text-2xl font-bold text-green-600">98.5%</div>
						<div className="text-sm text-gray-600">System Uptime</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-blue-600">2.3s</div>
						<div className="text-sm text-gray-600">Avg Response Time</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-purple-600">1,247</div>
						<div className="text-sm text-gray-600">Active Sessions</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-orange-600">87%</div>
						<div className="text-sm text-gray-600">User Satisfaction</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
}