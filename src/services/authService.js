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

const authService = {
  register,
  login,
  logout,
};

export default authService;
