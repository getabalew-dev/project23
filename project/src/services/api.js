const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthToken() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token || null;
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User endpoints
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: userData,
    });
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }
  // Complaint endpoints
  async getComplaints() {
    return this.request('/complaints');
  }

  async createComplaint(complaintData) {
    return this.request('/complaints', {
      method: 'POST',
      body: complaintData,
    });
  }

  async addComplaintResponse(complaintId, message) {
    return this.request(`/complaints/${complaintId}/response`, {
      method: 'POST',
      body: { message },
    });
  }

  async resolveComplaint(complaintId) {
    return this.request(`/complaints/${complaintId}/resolve`, {
      method: 'PATCH',
    });
  }

  async updateComplaintStatus(complaintId, status) {
    return this.request(`/complaints/${complaintId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  // Club endpoints
  async getClubs() {
    return this.request('/clubs');
  }

  async createClub(clubData, imageFile = null) {
    const formData = new FormData();
    
    // Add club data
    Object.keys(clubData).forEach(key => {
      if (clubData[key] !== null && clubData[key] !== undefined) {
        formData.append(key, clubData[key]);
      }
    });
    
    // Add image file if provided
    if (imageFile) {
      formData.append('clubImage', imageFile);
    }

    return this.request('/clubs', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });
  }

  async getClubMembers(clubId) {
    return this.request(`/clubs/${clubId}/members`);
  }

  async approveJoinRequest(clubId, requestId, status) {
    return this.request(`/clubs/${clubId}/join-requests/${requestId}`, {
      method: 'PATCH',
      body: { status },
    });
  }

  // Post endpoints
  async getPosts() {
    return this.request('/posts');
  }

  async createPost(postData, mediaFile = null) {
    const formData = new FormData();
    
    // Add post data
    Object.keys(postData).forEach(key => {
      if (postData[key] !== null && postData[key] !== undefined) {
        formData.append(key, postData[key]);
      }
    });
    
    // Add media file if provided
    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    return this.request('/posts', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });
  }

  // Election endpoints
  async getElections() {
    return this.request('/elections');
  }

  async createElection(electionData, files = []) {
    const formData = new FormData();
    
    // Add election data
    Object.keys(electionData).forEach(key => {
      if (key === 'candidates') {
        formData.append(key, JSON.stringify(electionData[key]));
      } else {
        formData.append(key, electionData[key]);
      }
    });
    
    // Add candidate images
    files.forEach((file, index) => {
      formData.append('candidateImages', file);
    });

    return this.request('/elections', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });
  }

  async voteInElection(electionId, candidateId) {
    return this.request(`/elections/${electionId}/vote`, {
      method: 'POST',
      body: { candidateId },
    });
  }

  async announceElectionResults(electionId) {
    return this.request(`/elections/${electionId}/announce`, {
      method: 'POST',
    });
  }

  async updateElectionStatus(electionId, status) {
    return this.request(`/elections/${electionId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async deleteElection(electionId) {
    return this.request(`/elections/${electionId}`, {
      method: 'DELETE',
    });
  }

  // Contact endpoints
  async submitContactMessage(contactData) {
    return this.request('/contact', {
      method: 'POST',
      body: contactData,
    });
  }
}

export const apiService = new ApiService();
export default apiService;