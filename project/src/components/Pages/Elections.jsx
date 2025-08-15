/** @format */

import React, { useState, useEffect } from "react";
import {
	Vote,
	Users,
	Clock,
	CheckCircle,
	Calendar,
	Eye,
	BarChart3,
	Plus,
	Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import toast from "react-hot-toast";

export function Elections() {
	const { user } = useAuth();
	const [selectedTab, setSelectedTab] = useState("all");
	const [selectedElection, setSelectedElection] = useState(null);
	const [elections, setElections] = useState([]);
	const [loading, setLoading] = useState(true);
	const [votedElections, setVotedElections] = useState(new Set());
	const [showNewElectionForm, setShowNewElectionForm] = useState(false);
	const [newElection, setNewElection] = useState({
		title: "",
		description: "",
		startDate: "",
		endDate: "",
		candidates: [],
	});
	const [newCandidate, setNewCandidate] = useState({
		name: "",
		department: "",
		profileImage: null,
	});

	useEffect(() => {
		fetchElections();
	}, []);

	const fetchElections = async () => {
		try {
			setLoading(true);
			const data = await apiService.getElections();
			setElections(data);
		} catch (error) {
			console.error("Failed to fetch elections:", error);
			toast.error("Failed to load elections");
			setElections([]);
		} finally {
			setLoading(false);
		}
	};

	const handleAddCandidate = (e) => {
		e.preventDefault();
		if (
			!newCandidate.name ||
			!newCandidate.department ||
			!newCandidate.profileImage
		) {
			toast.error("Candidate name, department, and image are required");
			return;
		}
		setNewElection((prev) => ({
			...prev,
			candidates: [...prev.candidates, { ...newCandidate, votes: 0 }],
		}));
		setNewCandidate({ name: "", department: "", profileImage: null });
	};

	const handleProfileImageChange = (e) => {
		setNewCandidate({ ...newCandidate, profileImage: e.target.files[0] });
	};

	const handleCreateElection = async (e) => {
		e.preventDefault();
		if (newElection.candidates.length < 2) {
			toast.error("At least two candidates are required");
			return;
		}
		if (!user?.isAdmin) {
			toast.error("Only admins can create elections");
			return;
		}

		try {
			const electionData = {
				...newElection,
				status: "Pending",
				totalVotes: 0,
				eligibleVoters: 12547,
			};

			await apiService.createElection(electionData);
			await fetchElections();
			toast.success("Election created successfully!");
		} catch (error) {
			toast.error("Failed to create election");
		}

		setNewElection({
			title: "",
			description: "",
			startDate: "",
			endDate: "",
			candidates: [],
		});
		setShowNewElectionForm(false);
	};

	const handleVote = async (electionId, candidateId) => {
		if (!user) {
			toast.error("Please login to vote");
			return;
		}

		if (votedElections.has(electionId)) {
			toast.error("You have already voted in this election");
			return;
		}

		try {
			await apiService.voteInElection(electionId, candidateId);
			setVotedElections(new Set([...votedElections, electionId]));
			await fetchElections();
			toast.success("Vote cast successfully!");
			setSelectedElection(null);
		} catch (error) {
			toast.error("Failed to cast vote");
		}
	};

	const handleDeleteElection = (electionId) => {
		if (!user?.isAdmin) {
			toast.error("Only admins can delete elections");
			return;
		}

		const deleteElection = async () => {
			try {
				await apiService.deleteElection(electionId);
				await fetchElections();
				toast.success("Election deleted successfully!");
			} catch (error) {
				toast.error("Failed to delete election");
			}
		};

		if (window.confirm("Are you sure you want to delete this election? This action cannot be undone.")) {
			deleteElection();
		}
	};

	const announceResults = async (electionId) => {
		if (!user?.isAdmin) {
			toast.error("Only admins can announce results");
			return;
		}

		try {
			await apiService.announceElectionResults(electionId);
			toast.success("Election results announced!");
			await fetchElections();
		} catch (error) {
			toast.error("Failed to announce results");
		}
	};

	const filteredElections =
		elections && Array.isArray(elections)
			? elections.filter(
					(election) => selectedTab === "all" || election.status === selectedTab
			  )
			: [];

	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800";
			case "upcoming":
				return "bg-blue-100 text-blue-800";
			case "completed":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "active":
				return <Vote className="w-4 h-4" />;
			case "upcoming":
				return <Clock className="w-4 h-4" />;
			case "completed":
				return <CheckCircle className="w-4 h-4" />;
			default:
				return <Calendar className="w-4 h-4" />;
		}
	};

	return (
		<div className="space-y-6">
			<div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-center">
						<h1 className="text-4xl md:text-6xl font-bold mb-6">
							Student Elections
						</h1>
						<p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto">
							Vote for your future student union leaders for Debre Berhan
							University
						</p>
					</motion.div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Admin Controls */}
				{user?.isAdmin && (
					<div className="mb-8 bg-white rounded-xl p-6 shadow-sm">
						<div className="flex justify-between items-center">
							<h2 className="text-xl font-semibold text-gray-900">
								Admin Controls
							</h2>
							<button
								onClick={() => setShowNewElectionForm(!showNewElectionForm)}
								className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
								<Plus className="w-4 h-4 mr-2" />
								Create New Election
							</button>
						</div>

						{showNewElectionForm && (
							<form onSubmit={handleCreateElection} className="mt-6 space-y-4">
								{/* Election Fields */}
								<input
									type="text"
									placeholder="Election Title"
									value={newElection.title}
									onChange={(e) =>
										setNewElection({ ...newElection, title: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									required
								/>
								<textarea
									placeholder="Election Description"
									value={newElection.description}
									onChange={(e) =>
										setNewElection({
											...newElection,
											description: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									rows="3"
									required
								/>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Start Date
										</label>
										<input
											type="date"
											value={newElection.startDate}
											onChange={(e) =>
												setNewElection({
													...newElection,
													startDate: e.target.value,
												})
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											End Date
										</label>
										<input
											type="date"
											value={newElection.endDate}
											onChange={(e) =>
												setNewElection({
													...newElection,
													endDate: e.target.value,
												})
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
											required
										/>
									</div>
								</div>

								{/* Candidates Form */}
								<div className="mt-4">
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Candidates
									</h3>
									<div className="flex gap-4">
										<input
											type="text"
											placeholder="Candidate Name"
											value={newCandidate.name}
											onChange={(e) =>
												setNewCandidate({
													...newCandidate,
													name: e.target.value,
												})
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg"
										/>
										<input
											type="text"
											placeholder="Department"
											value={newCandidate.department}
											onChange={(e) =>
												setNewCandidate({
													...newCandidate,
													department: e.target.value,
												})
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg"
										/>
										<input
											type="file"
											accept="image/*"
											onChange={handleProfileImageChange}
											className="border border-gray-300 rounded-lg"
										/>
										<button
											type="button"
											onClick={handleAddCandidate}
											className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
											Add Candidate
										</button>
									</div>
									<ul className="mt-2">
										{newElection.candidates.map((candidate, index) => (
											<li key={index} className="text-gray-700">
												{candidate.name} ({candidate.department}) -{" "}
												{candidate.votes} votes
											</li>
										))}
									</ul>
								</div>

								{/* Create Election Button */}
								<div className="flex gap-4">
									<button
										type="submit"
										className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
										Create Election
									</button>
									<button
										type="button"
										onClick={() => setShowNewElectionForm(false)}
										className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
										Cancel
									</button>
								</div>
							</form>
						)}
					</div>
				)}

				{/* Filter Tabs */}
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex space-x-8">
						{["all", "active", "upcoming", "completed"].map((tab) => (
							<button
								key={tab}
								onClick={() => setSelectedTab(tab)}
								className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
									selectedTab === tab
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}>
								{tab.charAt(0).toUpperCase() + tab.slice(1)}
							</button>
						))}
					</nav>
				</div>

				{/* Elections List */}
				{loading ? (
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">Loading elections...</p>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
						{filteredElections.map((election, index) => (
							<motion.div
								key={election.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center space-x-2">
										<span
											className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
												election.status
											)}`}>
											{getStatusIcon(election.status)}
											<span className="ml-1 capitalize">{election.status}</span>
										</span>
									</div>
									{user?.isAdmin && (
										<div className="flex items-center space-x-2">
											{election.status === "completed" && (
												<button
													onClick={() => announceResults(election.id)}
													className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
													Announce Results
												</button>
											)}
											<button
												onClick={() => handleDeleteElection(election.id)}
												className="text-red-600 hover:text-red-700 p-1">
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									)}
								</div>

								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{election.title}
								</h3>
								<p className="text-gray-600 mb-4">{election.description}</p>

								<div className="grid grid-cols-2 gap-4 mb-4">
									<div>
										<p className="text-sm text-gray-500">Start Date</p>
										<p className="font-medium">
											{new Date(election.startDate).toLocaleDateString()}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-500">End Date</p>
										<p className="font-medium">
											{new Date(election.endDate).toLocaleDateString()}
										</p>
									</div>
								</div>

								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center space-x-4">
										<div className="flex items-center space-x-1">
											<Users className="w-4 h-4 text-gray-500" />
											<span className="text-sm text-gray-600">
												{election.totalVotes || 0} votes
											</span>
										</div>
										<div className="flex items-center space-x-1">
											<BarChart3 className="w-4 h-4 text-gray-500" />
											<span className="text-sm text-gray-600">
												{election.eligibleVoters || 0} eligible
											</span>
										</div>
									</div>
									<div className="text-right">
										<p className="text-sm text-gray-500">Turnout</p>
										<p className="font-medium text-blue-600">
											{election.eligibleVoters
												? Math.round(
														((election.totalVotes || 0) /
															election.eligibleVoters) *
															100
												  )
												: 0}
											%
										</p>
									</div>
								</div>

								{/* Candidates Preview */}
								{(election.candidates || []).length > 0 && (
									<div className="mb-4">
										<h4 className="text-sm font-medium text-gray-900 mb-3">
											Candidates ({(election.candidates || []).length})
										</h4>
										<div className="flex -space-x-2">
											{election.candidates.slice(0, 3).map((candidate) => (
												<img
													key={candidate.id}
													src={candidate.profileImage}
													alt={candidate.name}
													className="w-8 h-8 rounded-full border-2 border-white object-cover"
												/>
											))}
											{election.candidates.length > 3 && (
												<div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
													+{election.candidates.length - 3}
												</div>
											)}
										</div>
									</div>
								)}

								<div className="flex items-center justify-between">
									<button
										onClick={() => setSelectedElection(election)}
										className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
										<Eye className="w-4 h-4" />
										<span>View Details</span>
									</button>
									{election.status === "active" && !votedElections.has(election.id) && (
										<button
											onClick={() => setSelectedElection(election)}
											className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
											Vote Now
										</button>
									)}
									{votedElections.has(election.id) && (
										<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
											✓ Voted
										</span>
									)}
								</div>
							</motion.div>
						))}
					</div>
				)}

				{/* No Elections Message */}
				{!loading && filteredElections.length === 0 && (
					<div className="text-center py-12">
						<Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							No elections found
						</h3>
						<p className="text-gray-600 mb-4">
							{selectedTab === "all"
								? "No elections have been created yet."
								: `No ${selectedTab} elections at this time.`}
						</p>
						{user?.isAdmin && (
							<button
								onClick={() => setShowNewElectionForm(true)}
								className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
								Create First Election
							</button>
						)}
					</div>
				)}

				{/* Voting Modal */}
				{selectedElection && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="p-6">
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-xl font-bold text-gray-900">
										{selectedElection.title}
									</h2>
									<button
										onClick={() => setSelectedElection(null)}
										className="text-gray-400 hover:text-gray-600">
										✕
									</button>
								</div>

								<div className="space-y-4">
									{selectedElection.candidates.map((candidate) => (
										<div
											key={candidate.id}
											className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
											<div className="flex items-start space-x-4">
												<img
													src={candidate.profileImage}
													alt={candidate.name}
													className="w-16 h-16 rounded-full object-cover"
												/>
												<div className="flex-1">
													<h3 className="text-lg font-semibold text-gray-900">
														{candidate.name} ({candidate.department})
													</h3>
													<p className="text-gray-600">{candidate.position}</p>
													<p className="text-sm font-medium text-gray-700 mb-1">
														Votes:{" "}
														{candidate.votes
															? candidate.votes.toLocaleString()
															: 0}
													</p>
													<div className="mt-2">
														<p className="text-sm font-medium text-gray-700 mb-1">
															Platform:
														</p>
														<div className="flex flex-wrap gap-1">
															{candidate.platform.map((item, index) => (
																<span
																	key={index}
																	className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
																	{item}
																</span>
															))}
														</div>
													</div>
												</div>
												<div className="text-right">
													<p className="text-2xl font-bold text-gray-900">
														{candidate.votes
															? candidate.votes.toLocaleString()
															: 0}
													</p>
													<p className="text-sm text-gray-500">votes</p>
												</div>
											</div>
											<motion.button
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
												onClick={() =>
													handleVote(selectedElection.id, candidate.id)
												}
												className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
												disabled={votedElections.has(selectedElection.id)}>
												{votedElections.has(selectedElection.id)
													? "Already Voted"
													: `Vote for ${candidate.name}`}
											</motion.button>
										</div>
									))}
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</div>
		</div>
	);
}
