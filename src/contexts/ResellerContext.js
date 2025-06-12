// frontend/src/contexts/ResellerContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import PropTypes from "prop-types"; // This import is not actually used in the context itself, can be removed if not needed elsewhere
import API_URL from "../config"; // Make sure this path is correct based on your file structure

const ResellerContext = createContext();

export const useResellers = () => {
  return useContext(ResellerContext);
};

export const ResellerProvider = ({ children }) => {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, isAuthenticated } = useAuth(); // Also get isAuthenticated for clearer logging

  const token = user?.token;

  const getResellers = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("ResellerContext: Attempting to fetch resellers...");
    console.log("ResellerContext: Current token:", token ? "Exists" : "Does NOT exist");
    console.log("ResellerContext: Is Authenticated:", isAuthenticated);

    try {
      if (!token) {
        console.warn("ResellerContext: No token available. Cannot fetch resellers.");
        setLoading(false);
        // Do NOT show toast here, as the ProtectedRoute or App.js redirection handles unauthenticated state
        return;
      }

      const apiUrl = `${API_URL}/api/auth/resellers`;
      console.log(`ResellerContext: Fetching from URL: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`ResellerContext: API Response Status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("ResellerContext: API Error Data:", errorData);
        if (response.status === 401 || response.status === 403) {
          throw new Error(errorData.message || "No autorizado para ver revendedores.");
        }
        throw new Error(errorData.message || "Error al obtener revendedores.");
      }

      const data = await response.json();
      console.log("ResellerContext: Fetched Resellers Data:", data);

      if (Array.isArray(data)) {
        setResellers(data);
        toast.success("Revendedores cargados exitosamente!");
      } else {
        console.error("ResellerContext: Expected array of resellers but received:", data);
        throw new Error("Formato de datos de revendedores inesperado.");
      }
    } catch (err) {
      console.error("ResellerContext: Error in getResellers:", err);
      setError(err.message);
      toast.error(err.message || "Error al cargar revendedores.");
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated, API_URL]);

  const getResellerById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      console.log(`ResellerContext: Attempting to fetch reseller with ID: ${id}`);
      try {
        if (!token) {
          console.warn("ResellerContext: No token available for getResellerById.");
          toast.warn("No autenticado. Por favor, inicie sesión.");
          setLoading(false);
          return null;
        }

        const apiUrl = `${API_URL}/api/auth/resellers/${id}`;
        console.log(`ResellerContext: Fetching single reseller from URL: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(`ResellerContext: Single Reseller API Response Status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("ResellerContext: Single Reseller API Error Data:", errorData);
          throw new Error(errorData.message || `Error al obtener revendedor con ID ${id}.`);
        }

        const data = await response.json();
        console.log(`ResellerContext: Fetched Reseller Data for ID ${id}:`, data);
        setLoading(false);
        return data;
      } catch (err) {
        console.error(`ResellerContext: Error in getResellerById for ID ${id}:`, err);
        setError(err.message);
        toast.error(err.message || `Error al cargar revendedor con ID ${id}.`);
        setLoading(false);
        return null;
      }
    },
    [token, API_URL]
  );

  const createReseller = useCallback(
    async (resellerData) => {
      setLoading(true);
      setError(null);
      console.log("ResellerContext: Attempting to create reseller with data:", resellerData);
      try {
        if (!token) {
          console.warn("ResellerContext: No token available for createReseller.");
          toast.warn("No autenticado. Por favor, inicie sesión.");
          setLoading(false);
          return false;
        }

        const apiUrl = `${API_URL}/api/auth/register-reseller`;
        console.log(`ResellerContext: Posting to URL: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(resellerData),
        });

        console.log(`ResellerContext: Create Reseller API Response Status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("ResellerContext: Create Reseller API Error Data:", errorData);
          throw new Error(errorData.message || "Error al registrar revendedor.");
        }

        const newReseller = await response.json();
        console.log("ResellerContext: New Reseller Created:", newReseller);
        setResellers((prevResellers) => [...prevResellers, newReseller]); // Optimistic update
        toast.success("¡Revendedor registrado exitosamente!");
        return true;
      } catch (err) {
        console.error("ResellerContext: Error in createReseller:", err);
        setError(err.message);
        toast.error(err.message || "Error al registrar revendedor.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, API_URL]
  );

  const updateReseller = useCallback(
    async (id, updatedData) => {
      setLoading(true);
      setError(null);
      console.log(
        `ResellerContext: Attempting to update reseller ID ${id} with data:`,
        updatedData
      );
      try {
        if (!token) {
          console.warn("ResellerContext: No token available for updateReseller.");
          toast.warn("No autenticado. Por favor, inicie sesión.");
          setLoading(false);
          return false;
        }

        const apiUrl = `${API_URL}/api/auth/resellers/${id}`;
        console.log(`ResellerContext: Putting to URL: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        });

        console.log(`ResellerContext: Update Reseller API Response Status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("ResellerContext: Update Reseller API Error Data:", errorData);
          throw new Error(errorData.message || `Error al actualizar revendedor con ID ${id}.`);
        }

        const updatedReseller = await response.json();
        console.log("ResellerContext: Reseller Updated:", updatedReseller);
        setResellers((prevResellers) =>
          prevResellers.map((reseller) =>
            reseller._id === id ? { ...reseller, ...updatedReseller } : reseller
          )
        );
        toast.success("¡Revendedor actualizado exitosamente!");
        return true;
      } catch (err) {
        console.error(`ResellerContext: Error in updateReseller for ID ${id}:`, err);
        setError(err.message);
        toast.error(err.message || `Error al actualizar revendedor con ID ${id}.`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, API_URL]
  );

  const deleteReseller = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      console.log(`ResellerContext: Attempting to delete reseller with ID: ${id}`);
      try {
        if (!token) {
          console.warn("ResellerContext: No token available for deleteReseller.");
          toast.warn("No autenticado. Por favor, inicie sesión.");
          setLoading(false);
          return false;
        }

        const apiUrl = `${API_URL}/api/auth/resellers/${id}`;
        console.log(`ResellerContext: Deleting from URL: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(`ResellerContext: Delete Reseller API Response Status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("ResellerContext: Delete Reseller API Error Data:", errorData);
          throw new Error(errorData.message || `Error al eliminar revendedor con ID ${id}.`);
        }

        console.log(`ResellerContext: Reseller ID ${id} deleted successfully.`);
        setResellers((prevResellers) => prevResellers.filter((reseller) => reseller._id !== id));
        toast.success("¡Revendedor eliminado exitosamente!");
        return true;
      } catch (err) {
        console.error(`ResellerContext: Error in deleteReseller for ID ${id}:`, err);
        setError(err.message);
        toast.error(err.message || `Error al eliminar revendedor con ID ${id}.`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, API_URL]
  );

  const resetResellerCode = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      console.log(`ResellerContext: Attempting to reset code for reseller with ID: ${id}`);
      try {
        if (!token) {
          console.warn("ResellerContext: No token available for resetResellerCode.");
          toast.warn("No autenticado. Por favor, inicie sesión.");
          setLoading(false);
          return null;
        }

        const apiUrl = `${API_URL}/api/auth/reset-reseller-code/${id}`;
        console.log(`ResellerContext: Putting to URL (reset code): ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(`ResellerContext: Reset Reseller Code API Response Status: ${response.status}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("ResellerContext: Reset Reseller Code API Error Data:", errorData);
          throw new Error(
            errorData.message || `Error al restablecer código para revendedor con ID ${id}.`
          );
        }

        const result = await response.json();
        console.log("ResellerContext: Reset Code Result:", result);
        toast.success("¡Código de revendedor restablecido exitosamente!");

        // Update the specific reseller in the state with the new code
        setResellers((prevResellers) =>
          prevResellers.map((reseller) =>
            reseller._id === id ? { ...reseller, resellerCode: result.newResellerCode } : reseller
          )
        );

        return result.newResellerCode;
      } catch (err) {
        console.error(`ResellerContext: Error in resetResellerCode for ID ${id}:`, err);
        setError(err.message);
        toast.error(err.message || `Error al restablecer código para revendedor con ID ${id}.`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, API_URL]
  );

  // Effect to call getResellers on initial mount or when token changes
  useEffect(() => {
    if (token) {
      getResellers();
    } else {
      setLoading(false); // If no token, stop loading, assume no data to fetch
      setResellers([]); // Clear any previous data if token is gone
    }
  }, [token, getResellers]); // getResellers is stable due to useCallback

  // PropTypes for the provider (can be removed from here as it's not a visual component)
  ResellerProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  const contextValue = {
    resellers,
    loading,
    error,
    getResellers,
    getResellerById,
    createReseller,
    updateReseller,
    deleteReseller, // Corrected from reducereseller
    resetResellerCode,
  };

  return <ResellerContext.Provider value={contextValue}>{children}</ResellerContext.Provider>;
};
