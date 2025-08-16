import React, { createContext, useContext, useState, useEffect } from "react";
import { adminCredentials } from "../data/adminCredentials";
import { apiService } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminCredential, setAdminCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    checkBackendConnection();
    // Check for existing session
    const savedUser = localStorage.getItem("user");
    const savedAdminCred = localStorage.getItem("adminCredential");
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      // Verify token is still valid
      if (userData.token) {
        verifyToken(userData.token);
      }
    }
    if (savedAdminCred) {
      setAdminCredential(JSON.parse(savedAdminCred));
    }
    
    setLoading(false);
  }, []);

  const checkBackendConnection = async () => {
    try {
      await apiService.healthCheck();
      setBackendStatus('connected');
    } catch (error) {
      console.warn('Backend not available:', error.message);
      setBackendStatus('offline');
      toast.error('Backend server is offline. Some features may not work.');
    }
  };

  const verifyToken = async (token) => {
    try {
      await apiService.getProfile();
    } catch (error) {
      // Token is invalid, logout user
      console.warn('Token verification failed:', error.message);
      // Don't auto-logout if backend is offline
      if (backendStatus === 'connected') {
        logout();
      }
    }
  };

  const login = async (email, password, otp = null, adminRole = null) => {
    try {
      setLoading(true);

      // Admin login
      if (email === "AdminDBU" && password === "Admin123#") {
        if (backendStatus === 'connected') {
          try {
            const response = await apiService.login({ 
              email, 
              password, 
              adminRole: "admin" 
            });
            
            const adminUser = {
              ...response.user,
              token: response.token,
              isAdmin: true,
            };

            // Find matching credential for permissions
            const credential = adminCredentials.find(cred => cred.role === "president");
            
            setUser(adminUser);
            setAdminCredential(credential);
            localStorage.setItem("user", JSON.stringify(adminUser));
            localStorage.setItem("adminCredential", JSON.stringify(credential));
            
            return adminUser;
          } catch (error) {
            throw new Error("Invalid admin credentials");
          }
        } else {
          // Offline admin login
          const response = await apiService.login({ 
            email, 
            password, 
            adminRole: "admin" 
          });
          
          const adminUser = {
            id: "admin_001",
            name: "System Administrator",
            email: "admin@dbu.edu.et",
            role: "admin",
            isAdmin: true,
            token: btoa(JSON.stringify({
              userId: "admin_001",
              role: "admin",
              exp: Date.now() + (7 * 24 * 60 * 60 * 1000)
            })),
          };

          // Find matching credential for permissions
          const credential = adminCredentials.find(cred => cred.role === "president");
          
          setUser(adminUser);
          setAdminCredential(credential);
          localStorage.setItem("user", JSON.stringify(adminUser));
          localStorage.setItem("adminCredential", JSON.stringify(credential));
          
          return adminUser;
        }
      }

      // Real student login via API
      if (email && password) {
        if (backendStatus === 'connected') {
          try {
            const response = await apiService.login({ email, password });
            const studentUser = {
              ...response.user,
              token: response.token,
              isAdmin: response.user.role === "admin",
            };

            setUser(studentUser);
            localStorage.setItem("user", JSON.stringify(studentUser));
            
            return studentUser;
          } catch (error) {
            throw error;
          }
        } else {
          // Offline mode - create demo user
          const response = await apiService.login({ email, password });
          const studentUser = {
            id: "demo_" + Date.now(),
            name: "Demo Student",
            email: email,
            role: "student",
            department: "Computer Science",
            year: "3rd Year",
            studentId: email,
            isAdmin: false,
            token: btoa(JSON.stringify({
              userId: "demo_" + Date.now(),
              email: email,
              role: "student",
              exp: Date.now() + (7 * 24 * 60 * 60 * 1000)
            })),
          };

          setUser(studentUser);
          localStorage.setItem("user", JSON.stringify(studentUser));
          
          return studentUser;
        }
      }

      throw new Error("Invalid credentials");
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Simulate Google login
      const googleUser = {
        id: "google_" + Date.now(),
        name: "Google User",
        email: "user@gmail.com",
        role: "student",
        department: "Computer Science",
        year: "2nd Year",
        studentId: "DBU" + Date.now().toString().slice(-8),
        isAdmin: false,
        token: btoa(JSON.stringify({
          userId: "google_" + Date.now(),
          email: "user@gmail.com",
          role: "student",
          exp: Date.now() + (7 * 24 * 60 * 60 * 1000)
        })),
      };

      setUser(googleUser);
      localStorage.setItem("user", JSON.stringify(googleUser));
      
      return googleUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAdminCredential(null);
    localStorage.removeItem("user");
    localStorage.removeItem("adminCredential");
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    adminCredential,
    loading,
    backendStatus,
    login,
    loginWithGoogle,
    logout,
    checkBackendConnection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};