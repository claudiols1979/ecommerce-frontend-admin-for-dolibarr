// contexts/VideoContext.js
import React, { createContext, useContext, useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useAuth } from "./AuthContext";
import API_URL from "../config";

const VideoContext = createContext();

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
};

export const VideoProvider = ({ children }) => {
  const { user } = useAuth();
  const authToken = user?.token;

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    if (!authToken) return null;
    return { headers: { Authorization: `Bearer ${authToken}` } };
  }, [authToken]);

  const fetchAllVideos = useCallback(async () => {
    const config = getAuthHeaders();
    if (!config) {
      console.log("No autorizado para cargar videos");
      setVideos([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/hero-carousel-video`, config);
      setVideos(response.data);
    } catch (err) {
      // Si no hay videos o el backend no responde, simplemente dejamos el array vacío
      setVideos([]);
      console.log("No videos found or backend not available");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const createVideo = async (videoData) => {
    const config = getAuthHeaders();
    if (!config) {
      throw new Error("No autorizado para crear videos");
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/hero-carousel-video`, videoData, config);
      setVideos((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error creating video";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // En contexts/VideoContext.js - ACTUALIZA la función updateVideo:
  const updateVideo = async (id, videoData) => {
    const config = getAuthHeaders();
    if (!config) {
      throw new Error("No autorizado para actualizar videos");
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${API_URL}/api/hero-carousel-video/${id}`,
        videoData,
        config
      );
      setVideos((prev) => prev.map((video) => (video._id === id ? response.data : video)));
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error updating video";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id) => {
    const config = getAuthHeaders();
    if (!config) {
      throw new Error("No autorizado para eliminar videos");
    }

    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/api/hero-carousel-video/${id}`, config);
      setVideos((prev) => prev.filter((video) => video._id !== id));
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error deleting video";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // contexts/VideoContext.js - AGREGA esta función:
  const activateVideo = async (id) => {
    const config = getAuthHeaders();
    if (!config) {
      throw new Error("No autorizado para activar videos");
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${API_URL}/api/hero-carousel-video/${id}/activate`,
        {},
        config
      );

      // Actualizar el estado: el video activado se marca como activo, los demás como inactivos
      setVideos((prev) =>
        prev.map((video) =>
          video._id === id ? { ...video, isActive: true } : { ...video, isActive: false }
        )
      );

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error activating video";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    videos,
    loading,
    error,
    fetchAllVideos,
    createVideo,
    updateVideo,
    deleteVideo,
    activateVideo,
  };

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>;
};

VideoProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
