// frontend/src/contexts/UserContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext"; // Assuming AuthContext provides user and token

const UserContext = createContext();

export const useUsers = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const { user } = useAuth(); // Get user and token from AuthContext
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000/api"; // Adjust if your backend URL is different

  // Function to fetch all users (e.g., for approver selection)
  const getUsers = useCallback(async () => {
    if (!user || !user.token) {
      setError(new Error("Authentication required to fetch users."));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // Assuming a /api/users endpoint that returns all users
      const { data } = await axios.get(`${BASE_URL}/users`, config);
      setUsers(data.users); // Assuming response structure is { users: [...] }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch users.";
      setError(new Error(errorMessage));
      toast.error(`Error al cargar usuarios: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === "Administrador") {
      // Only fetch users if authenticated as Admin
      getUsers();
    }
  }, [user, getUsers]);

  const value = {
    users,
    loading,
    error,
    getUsers,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
