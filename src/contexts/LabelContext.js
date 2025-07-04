import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "./AuthContext";
import API_URL from "../config"; // Asegúrate de que la ruta a tu config sea correcta

const LabelContext = createContext();

export const useLabels = () => useContext(LabelContext);

export const LabelProvider = ({ children }) => {
  const { user } = useAuth();
  const authToken = user?.token;

  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    if (!authToken) return null;
    return { headers: { Authorization: `Bearer ${authToken}` } };
  }, [authToken]);

  const fetchLabels = useCallback(async () => {
    const config = getAuthHeaders();
    if (!config) return; // No intentar si no hay token

    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/api/labels`, config);
      setLabels(data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al cargar las etiquetas de promoción.";
      setError({ message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Llama a fetchLabels cuando el token de autenticación esté disponible
  useEffect(() => {
    if (authToken) {
      fetchLabels();
    }
  }, [authToken, fetchLabels]);

  const assignLabelsToProduct = useCallback(
    async (productId, labelIds) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para asignar etiquetas.");
        throw new Error("No autorizado");
      }
      setLoading(true);
      setError(null);
      try {
        await axios.post(`${API_URL}/api/product-labels/assign`, { productId, labelIds }, config);
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error al asignar las etiquetas.";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // --- FUNCIÓN AÑADIDA QUE FALTABA ---
  const removeLabelFromProduct = useCallback(
    async (productId, labelId) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para eliminar etiquetas.");
        throw new Error("No autorizado");
      }
      setLoading(true);
      setError(null);
      try {
        await axios.delete(`${API_URL}/api/product-labels/remove`, {
          headers: config.headers,
          data: { productId, labelId }, // Pasando datos en el cuerpo de una petición DELETE
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error al eliminar la etiqueta.";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const value = {
    labels,
    loading,
    error,
    fetchLabels,
    assignLabelsToProduct,
    removeLabelFromProduct, // Se exporta la nueva función
  };

  return <LabelContext.Provider value={value}>{children}</LabelContext.Provider>;
};

LabelProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
