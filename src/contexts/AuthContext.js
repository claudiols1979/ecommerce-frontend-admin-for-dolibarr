// frontend/src/contexts/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from "react";
import authService from "../services/authService"; // Correct import path for authService
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Keep toast imported for other uses (login/register)
import PropTypes from "prop-types";

// 1. Create the Context object
export const AuthContext = createContext();

// 2. Create the Provider component that will manage the state
export const AuthProvider = ({ children }) => {
  // user state will hold the authenticated user's data (token, name, email, role, etc.)
  const [user, setUser] = useState(null);
  // loading state helps manage initial load (checking localStorage)
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // useEffect to check for a stored user in localStorage when the app loads
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.role) {
          setUser(parsedUser);
        } else {
          console.warn("User data from localStorage is missing 'role' property or is invalid.");
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem("user"); // Clear corrupted data if parsing fails
        setUser(null);
      }
    }
    setLoading(false); // Finished checking local storage
  }, []); // Empty dependency array means this runs only once on component mount

  // Function to handle user login
  const login = async (email, password) => {
    setLoading(true); // Set loading true during login process
    try {
      const userData = await authService.login({ email, password });
      if (!userData || !userData.role) {
        throw new Error("Login successful but user data is missing role information.");
      }
      setUser(userData); // Update context state
      toast.success(userData.message || "Inicio de sesión exitoso!");
      navigate("/dashboard"); // Redirect to dashboard after successful login
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      const message =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || "Error de inicio de sesión.";
      toast.error(message);
      setUser(null); // Clear user state on failed login
      return { success: false, message };
    } finally {
      setLoading(false); // Reset loading state after login attempt
    }
  };

  // Function to handle user registration
  const register = async (firstName, lastName, email, password, role) => {
    setLoading(true); // Set loading true during registration process
    try {
      const userData = await authService.register({ firstName, lastName, email, password, role });
      if (!userData || !userData.role) {
        throw new Error("Registration successful but user data is missing role information.");
      }
      setUser(userData); // Update context state
      toast.success(userData.message || "Registro exitoso!");
      navigate("/dashboard"); // Redirect to dashboard after successful registration
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error);
      const message =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message || "Error de registro.";
      toast.error(message);
      setUser(null); // Clear user state on failed registration
      return { success: false, message };
    } finally {
      setLoading(false); // Reset loading state after registration attempt
    }
  };

  // Function to handle user logout
  const logout = () => {
    authService.logout(); // Clear localStorage via authService
    setUser(null); // Clear user state
    // REMOVED: toast.info("Sesión cerrada.");
    // This toast often causes issues during rapid unmounting/navigation.
    // If you need a "logged out" message, consider showing it conditionally on the sign-in page.
    navigate("/authentication/sign-in"); // Redirect to login page
  };

  // The value that will be provided to consumers of this context
  const authContextValue = {
    user, // The current authenticated user's data (includes .role)
    loading, // True while checking localStorage on initial load or during auth ops
    login, // Function to log in a user
    register, // Function to register a user
    logout, // Function to log out a user
    isAuthenticated: !!user, // Convenience boolean to check if a user is logged in
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook for easier consumption of the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
