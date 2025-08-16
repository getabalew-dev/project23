import React, { useState, useEffect } from 'react';
import { Vote, Users, Calendar, Clock, Trophy, Plus, Trash2 } from 'lucide-react';
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import toast from "react-hot-toast";

export function Elections() {
  const { user, backendStatus } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [votingFor, setVotingFor] = useState(null);

  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    eligibleVoters: 12547,
    candidates: []
  });

  const [newCandidate, setNewCandidate] = useState({
    name: '',
    position: 'President',
    department: '',
    year: '',
    studentId: '',
    bio: '',
    platform: [''],
    profileImage: null
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      if (backendStatus === 'connected') {
        const data = await apiService.getElections();
        setElections(data);
      } else {
        // Use mock data when backend is offline
        setElections([
          {
            _id: "1",
            title: "Student Union President Election 2024",
            description: "Vote for the next Student Union President who will represent all students",
            status: "Ongoing",
            startDate: "2024-02-01",
            endDate: "2024-02-07",
            totalVotes: 8547,
            eligibleVoters: 12547,
            candidates: [
              {
                _id: "1",
                name: "Hewan Tadesse",
                position: "President",
                department: "Computer Science",
                year: "4th Year",
                studentId: "DBU10102324",
                votes: 4523,
                profileImage: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400",
                platform: ["Student Welfare", "Academic Excellence", "Campus Infrastructure"],
                bio: "Dedicated to improving student life and academic experience."
              },
              {
                _id: "2",
                name: "Dawit Mekonnen",
                position: "President",
                department: "Engineering",
                year: "4th Year",
                studentId: "DBU10102325",
                votes: 4024,
                profileImage: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400",
                platform: ["Innovation Hub", "Student Rights", "Environmental Sustainability"],
                bio: "Passionate about innovation and sustainable campus development."
              },
            ],
            voters: []
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch elections:', error);
      toast.error('Failed to load elections');
      setElections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (electionId, candidateId) => {
    if (!user) {
      toast.error("Please login to vote");
      return;
    }

    try {
      setVotingFor(candidateId);
      
      if (backendStatus === 'connected') {
        await apiService.voteInElection(electionId, candidateId);
      }
      
      // Update local state
      setElections(elections.map(election => {
        if (election._id === electionId) {
          return {
            ...election,
            candidates: election.candidates.map(candidate => 
              candidate._id === candidateId 
                ? { ...candidate, votes: candidate.votes + 1 }
                : candidate
            ),
            totalVotes: election.totalVotes + 1,
            voters: [...election.voters, user._id || user.id]
          };
        }
        return election;
      }));

      toast.success("Vote cast successfully!");
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error(`Failed to cast vote: ${error.message}`);
    } finally {
      setVotingFor(null);
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    
    if (!user?.isAdmin) {
      toast.error("Only admins can create elections");
      return;
    }

    try {
      const electionData = {
        ...newElection,
        candidates: newElection.candidates
      };

      if (backendStatus === 'connected') {
        await apiService.createElection(electionData);
      }
      
      await fetchElections();
      toast.success("Election created successfully!");
      setShowCreateForm(false);
      setNewElection({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        eligibleVoters: 12547,
        candidates: []
      });
    } catch (error) {
      console.error('Failed to create election:', error);
      toast.error(`Failed to create election: ${error.message}`);
    }
  };

  const addCandidate = () => {
    if (!newCandidate.name || !newCandidate.department || !newCandidate.year || !newCandidate.studentId) {
      toast.error("Please fill all candidate fields");
      return;
    }

    const candidate = {
      ...newCandidate,
      _id: Date.now().toString(),
      votes: 0,
      platform: newCandidate.platform.filter(p => p.trim() !== ''),
      profileImage: newCandidate.profileImage || "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400"
    };

    setNewElection({
      ...newElection,
      candidates: [...newElection.candidates, candidate]
    });

    setNewCandidate({
      name: '',
      position: 'President',
      department: '',
      year: '',
      studentId: '',
      bio: '',
      platform: [''],
      profileImage: null
    });

    toast.success("Candidate added!");
  };

  const removeCandidate = (candidateId) => {
    setNewElection({
      ...newElection,
      candidates: newElection.candidates.filter(c => c._id !== candidateId)
    });
  };

  const addPlatformItem = () => {
    setNewCandidate({
      ...newCandidate,
      platform: [...newCandidate.platform, '']
    });
  };

  const updatePlatformItem = (index, value) => {
    const newPlatform = [...newCandidate.platform];
    newPlatform[index] = value;
    setNewCandidate({
      ...newCandidate,
      platform: newPlatform
    });
  };

  const removePlatformItem = (index) => {
    setNewCandidate({
      ...newCandidate,
      platform: newCandidate.platform.filter((_, i) => i !== index)
    });
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (now < start) return 'Upcoming';
    if (now > end) return 'Completed';
    return 'Ongoing';
  };

  const hasUserVoted = (election) => {
    return election.voters && election.voters.includes(user?._id || user?.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Elections</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto">
              Participate in democratic elections and make your voice heard in shaping the future of our university
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Controls */}
        {user?.isAdmin && (
          <div className="mb-8 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Election Management</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Election
              </button>
            </div>

            {showCreateForm && (
              <form onSubmit={handleCreateElection} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Election Title"
                    value={newElection.title}
                    onChange={(e) => setNewElection({...newElection, title: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Eligible Voters"
                    value={newElection.eligibleVoters}
                    onChange={(e) => setNewElection({...newElection, eligibleVoters: parseInt(e.target.value)})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <textarea
                  placeholder="Election Description"
                  value={newElection.description}
                  onChange={(e) => setNewElection({...newElection, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={newElection.startDate}
                      onChange={(e) => setNewElection({...newElection, startDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={newElection.endDate}
                      onChange={(e) => setNewElection({...newElection, endDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Candidate Form */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Candidates</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Candidate Name"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={newCandidate.position}
                      onChange={(e) => setNewCandidate({...newCandidate, position: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="President">President</option>
                      <option value="Vice President">Vice President</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Treasurer">Treasurer</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Department"
                      value={newCandidate.department}
                      onChange={(e) => setNewCandidate({...newCandidate, department: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Year (e.g., 4th Year)"
                      value={newCandidate.year}
                      onChange={(e) => setNewCandidate({...newCandidate, year: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Student ID"
                      value={newCandidate.studentId}
                      onChange={(e) => setNewCandidate({...newCandidate, studentId: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <textarea
                    placeholder="Candidate Bio"
                    value={newCandidate.bio}
                    onChange={(e) => setNewCandidate({...newCandidate, bio: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
                    rows="2"
                  />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform Points</label>
                    {newCandidate.platform.map((point, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Platform point"
                          value={point}
                          onChange={(e) => updatePlatformItem(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removePlatformItem(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addPlatformItem}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Add Platform Point
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={addCandidate}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Candidate
                  </button>
                </div>

                {/* Added Candidates */}
                {newElection.candidates.length > 0 && (
                  <div className="border-t pt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Added Candidates ({newElection.candidates.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {newElection.candidates.map((candidate) => (
                        <div key={candidate._id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold">{candidate.name}</h5>
                              <p className="text-sm text-gray-600">{candidate.position}</p>
                              <p className="text-sm text-gray-600">{candidate.department} - {candidate.year}</p>
                            </div>
                            <button
                              onClick={() => removeCandidate(candidate._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Election
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Elections List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading elections...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {elections.map((election) => (
              <motion.div
                key={election._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{election.title}</h2>
                    <p className="text-gray-600 mb-4">{election.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{election.totalVotes} / {election.eligibleVoters} votes</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getElectionStatus(election) === 'Ongoing' ? 'bg-green-100 text-green-800' :
                          getElectionStatus(election) === 'Upcoming' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getElectionStatus(election)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {hasUserVoted(election) && (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Voted
                    </div>
                  )}
                </div>

                {/* Candidates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {election.candidates.map((candidate) => (
                    <div key={candidate._id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={candidate.profileImage}
                          alt={candidate.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                          <p className="text-blue-600 font-medium">{candidate.position}</p>
                          <p className="text-sm text-gray-600">{candidate.department} - {candidate.year}</p>
                          <p className="text-sm text-gray-600">ID: {candidate.studentId}</p>
                          
                          {candidate.bio && (
                            <p className="text-sm text-gray-700 mt-2">{candidate.bio}</p>
                          )}
                          
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-900 mb-1">Platform:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {candidate.platform.map((point, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Trophy className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium">{candidate.votes} votes</span>
                            </div>
                            
                            {getElectionStatus(election) === 'Ongoing' && !hasUserVoted(election) && user && (
                              <button
                                onClick={() => handleVote(election._id, candidate._id)}
                                disabled={votingFor === candidate._id}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                              >
                                <Vote className="w-4 h-4 mr-2" />
                                {votingFor === candidate._id ? 'Voting...' : 'Vote'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Election Results */}
                {getElectionStatus(election) === 'Completed' && (
                  <div className="mt-6 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Final Results</h4>
                    <div className="space-y-2">
                      {election.candidates
                        .sort((a, b) => b.votes - a.votes)
                        .map((candidate, index) => (
                          <div key={candidate._id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                              <span className={index === 0 ? "font-semibold text-blue-900" : "text-blue-700"}>
                                {candidate.name}
                              </span>
                            </div>
                            <span className="text-blue-700">
                              {candidate.votes} votes ({((candidate.votes / election.totalVotes) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {elections.length === 0 && (
              <div className="text-center py-12">
                <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No elections available</h3>
                <p className="text-gray-600">Check back later for upcoming elections</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}