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

  useEffect(() => {
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

  const verifyToken = async (token) => {
    try {
      await apiService.getProfile();
    } catch (error) {
      // Token is invalid, logout user
      logout();
    }
  };

  const login = async (email, password, otp = null, adminRole = null) => {
    try {
      setLoading(true);

      // Admin login
      if (email === "AdminDBU" && password === "Admin123#") {
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
      }

      // Real student login via API
      if (email && password) {
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
    login,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};