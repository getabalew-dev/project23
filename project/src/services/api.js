const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

    // Don't stringify FormData
    if (config.body && !(config.body instanceof FormData) && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      
      throw error;
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/api/health`);
      return await response.json();
    } catch (error) {
      throw new Error('Backend server is not responding');
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
    console.log('API login attempt:', credentials);
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
    try {
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

      const token = this.getAuthToken();
      const response = await fetch(`${this.baseURL}/clubs`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create club failed:', error);
      throw error;
    }
  }

  async deleteClub(clubId) {
    return this.request(`/clubs/${clubId}`, {
      method: 'DELETE',
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
    try {
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

      const token = this.getAuthToken();
      const response = await fetch(`${this.baseURL}/posts`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create post failed:', error);
      throw error;
    }
  }

  async deletePost(postId) {
    return this.request(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  // Election endpoints
  async getElections() {
    return this.request('/elections');
  }

  async createElection(electionData, files = []) {
    try {
      const formData = new FormData();
      
      // Add election data
      Object.keys(electionData).forEach(key => {
        if (key === 'candidates') {
          formData.append(key, JSON.stringify(electionData[key]));
        } else if (electionData[key] !== null && electionData[key] !== undefined) {
          formData.append(key, electionData[key]);
        }
      });
      
      // Add candidate images
      files.forEach((file, index) => {
        formData.append('candidateImages', file);
      });

      const token = this.getAuthToken();
      const response = await fetch(`${this.baseURL}/elections`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create election failed:', error);
      throw error;
    }
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

  // Stats endpoints
  async getStats() {
    return this.request('/stats');
  }
}

export const apiService = new ApiService();
export default apiService;