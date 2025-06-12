import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "./AuthContext";
import API_URL from "../config";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const authToken = user?.token;

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!authToken) {
      setLoading(false);
      setError("Authentication token not available. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      // --- CRITICAL FIX: Read the response body ONLY ONCE ---
      const responseData = await response.json(); // Reads the stream here, once.
      // --- END CRITICAL FIX ---

      console.log("DashboardContext: Raw Network Response Object:", response); // This logs the Response object itself
      console.log("DashboardContext: Parsed API Response JSON:", responseData); // This logs the parsed JSON data

      if (!response.ok) {
        // If the response status is not OK (e.g., 401, 403, 500),
        // use the already parsed responseData for error details.
        console.error(
          "DashboardContext: API Response Not OK. Status:",
          response.status,
          "Error Data:",
          responseData
        );
        throw new Error(
          responseData.message || `Failed to fetch dashboard data: ${response.status}`
        );
      }

      // If response.ok is true, then we have successful data.
      // Check if the 'data' key exists in the responseData (as per your Postman)
      if (responseData && typeof responseData.data !== "undefined") {
        setDashboardData(responseData.data);
        console.log("DashboardContext: Data successfully set to state:", responseData.data);
      } else {
        // This case handles if the backend sends success: true but no 'data' key
        console.warn(
          "DashboardContext: API response is missing the 'data' key or it's undefined.",
          responseData
        );
        setDashboardData(null); // Explicitly set to null if the expected data is missing
        setError("Unexpected API response format: 'data' key missing.");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "An unexpected error occurred while fetching dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [authToken]); // Dependency array: recreate fetchDashboardData if authToken changes

  useEffect(() => {
    if (authToken && !dashboardData && !loading && !error) {
      fetchDashboardData();
    } else if (authToken && !dashboardData && loading) {
      // Allow initial fetch to proceed if loading is true (from initial state)
      // This prevents re-fetching if data is already present, but allows the first fetch.
      fetchDashboardData();
    }

    if (!authToken && dashboardData) {
      setDashboardData(null);
      setError(null);
      setLoading(false);
    }
  }, [authToken, fetchDashboardData, dashboardData, loading, error]);

  const contextValue = {
    dashboardData,
    loading,
    error,
    fetchDashboardData,
  };

  return <DashboardContext.Provider value={contextValue}>{children}</DashboardContext.Provider>;
};

DashboardProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
