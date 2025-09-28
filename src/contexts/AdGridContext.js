import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "./AuthContext";
import API_URL from "../config";

const AdGridContext = createContext();

export const useAdGrid = () => useContext(AdGridContext);

export const AdGridProvider = ({ children }) => {
  const { user } = useAuth();
  const authToken = user?.token;

  const [gridItems, setGridItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);

  const getAuthHeaders = useCallback(() => {
    if (!authToken) return null;
    return { headers: { Authorization: `Bearer ${authToken}` } };
  }, [authToken]);

  // GET - Fetch all active grid items (for public display) - NO AUTH NEEDED
  const fetchGridItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/api/ad-grid/public`);
      setGridItems(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error loading grid items";
      setError({ message: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // GET - Fetch all grid items with admin details (for dashboard) - REQUIRES AUTH
  const fetchAllGridItems = useCallback(async () => {
    const config = getAuthHeaders();
    if (!config) {
      toast.error("No autorizado para cargar items del grid.");
      throw new Error("No autorizado");
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/api/ad-grid`, config);
      setGridItems(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error loading grid items";
      setError({ message: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // GET - Fetch single grid item by ID
  const fetchGridItemById = useCallback(
    async (id) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para cargar item.");
        throw new Error("No autorizado");
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${API_URL}/api/ad-grid/${id}`, config);
        setCurrentItem(data);
        return data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error loading grid item";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // POST - Create new grid item
  const createGridItem = useCallback(
    async (itemData, imageFile) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para crear items.");
        throw new Error("No autorizado");
      }

      setLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("title", itemData.title);
        formData.append("department", itemData.department);
        formData.append("alt", itemData.alt || itemData.title);
        formData.append("order", itemData.order || 0);
        formData.append("isActive", itemData.isActive !== undefined ? itemData.isActive : true);

        if (imageFile) {
          formData.append("image", imageFile);
        }

        const { data } = await axios.post(`${API_URL}/api/ad-grid`, formData, {
          ...config,
          headers: {
            ...config.headers,
            "Content-Type": "multipart/form-data",
          },
        });

        setGridItems((prev) => [...prev, data]);
        toast.success("Item del grid creado exitosamente");
        return data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error creating grid item";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // PUT - Update grid item
  const updateGridItem = useCallback(
    async (id, itemData, imageFile) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para actualizar items.");
        throw new Error("No autorizado");
      }

      setLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("title", itemData.title);
        formData.append("department", itemData.department);
        formData.append("alt", itemData.alt);
        formData.append("order", itemData.order);
        formData.append("isActive", itemData.isActive);

        if (imageFile) {
          formData.append("image", imageFile);
        }

        const { data } = await axios.put(`${API_URL}/api/ad-grid/${id}`, formData, {
          ...config,
          headers: {
            ...config.headers,
            "Content-Type": "multipart/form-data",
          },
        });

        setGridItems((prev) => prev.map((item) => (item._id === id ? data : item)));
        if (currentItem && currentItem._id === id) {
          setCurrentItem(data);
        }

        toast.success("Item del grid actualizado exitosamente");
        return data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error updating grid item";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, currentItem]
  );

  // DELETE - Remove grid item
  const deleteGridItem = useCallback(
    async (id) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para eliminar items.");
        throw new Error("No autorizado");
      }

      setLoading(true);
      setError(null);
      try {
        await axios.delete(`${API_URL}/api/ad-grid/${id}`, config);
        setGridItems((prev) => prev.filter((item) => item._id !== id));
        if (currentItem && currentItem._id === id) {
          setCurrentItem(null);
        }
        toast.success("Item del grid eliminado exitosamente");
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error deleting grid item";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, currentItem]
  );

  // PUT - Reorder grid items
  const reorderGridItems = useCallback(
    async (itemsOrder) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para reordenar items.");
        throw new Error("No autorizado");
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.put(
          `${API_URL}/api/ad-grid/reorder/reorder`,
          {
            items: itemsOrder,
          },
          config
        );

        setGridItems(data);
        toast.success("Items del grid reordenados exitosamente");
        return data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error reordering grid items";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Toggle grid item active status
  const toggleGridItemActive = useCallback(
    async (id, isActive) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para cambiar estado de items.");
        throw new Error("No autorizado");
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.put(
          `${API_URL}/api/ad-grid/${id}`,
          {
            isActive: !isActive,
          },
          config
        );

        setGridItems((prev) => prev.map((item) => (item._id === id ? data : item)));
        toast.success(`Item ${!isActive ? "activado" : "desactivado"} exitosamente`);
        return data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error updating grid item status";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Bulk update grid items status
  const bulkUpdateStatus = useCallback(
    async (ids, isActive) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para actualizar estado de items.");
        throw new Error("No autorizado");
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.put(
          `${API_URL}/api/ad-grid/bulk/status`,
          {
            ids,
            isActive,
          },
          config
        );

        setGridItems(data);
        toast.success(
          `${ids.length} items ${isActive ? "activados" : "desactivados"} exitosamente`
        );
        return data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error updating grid items status";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Clear current item selection
  const clearCurrentItem = useCallback(() => {
    setCurrentItem(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch grid items when token becomes available
  useEffect(() => {
    if (authToken) {
      fetchAllGridItems();
    }
  }, [authToken, fetchAllGridItems]);

  const value = {
    // State
    gridItems,
    currentItem,
    loading,
    error,

    // Public actions
    fetchGridItems,

    // Admin actions
    fetchAllGridItems,
    fetchGridItemById,
    createGridItem,
    updateGridItem,
    deleteGridItem,
    reorderGridItems,
    toggleGridItemActive,
    bulkUpdateStatus,

    // Utility functions
    clearCurrentItem,
    clearError,
  };

  return <AdGridContext.Provider value={value}>{children}</AdGridContext.Provider>;
};

AdGridProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
