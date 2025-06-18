// frontend/src/services/authService.js
import axios from "axios";
import API_URL from "../config";

const register = async (userData) => {
  const response = await axios.post(`${API_URL}/api/auth/register-company-user`, userData);
  if (response.data.token) {
    // Store user data (including token) in localStorage upon successful registration
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, userData);
  if (response.data.token) {
    // Store user data (including token) in localStorage upon successful login
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  // Remove user data from localStorage
  localStorage.removeItem("user");
};

// --- NEW FUNCTION TO REQUEST PASSWORD RESET ---
const forgotPassword = async (emailData) => {
  // This is a public route, no auth token needed
  const response = await axios.post(`${API_URL}/api/auth/forgot-password`, emailData);
  return response.data;
};

// --- NEW FUNCTION TO SUBMIT THE NEW PASSWORD ---
const resetPassword = async (token, passwordData) => {
  // This is a public route, no auth token needed
  const response = await axios.put(`${API_URL}/api/auth/reset-password/${token}`, passwordData);
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
};

export default authService;
