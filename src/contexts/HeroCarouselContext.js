import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "./AuthContext";
import API_URL from "../config";

const HeroCarouselContext = createContext();

export const useHeroCarousel = () => useContext(HeroCarouselContext);

export const HeroCarouselProvider = ({ children }) => {
  const { user } = useAuth();
  const authToken = user?.token;

  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(null);

  const getAuthHeaders = useCallback(() => {
    if (!authToken) return null;
    return { headers: { Authorization: `Bearer ${authToken}` } };
  }, [authToken]);

  // GET - Fetch all slides (for public display) - NO AUTH NEEDED
  const fetchSlides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/api/hero-carousel/public`);
      setSlides(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error loading carousel slides";
      setError({ message: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // GET - Fetch all slides with admin details (for dashboard) - REQUIRES AUTH
  const fetchAllSlides = useCallback(async () => {
    const config = getAuthHeaders();
    if (!config) {
      toast.error("No autorizado para cargar slides.");
      throw new Error("No autorizado");
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/api/hero-carousel`, config);
      setSlides(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error loading slides";
      setError({ message: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // GET - Fetch single slide by ID
  const fetchSlideById = useCallback(
    async (id) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para cargar slide.");
        throw new Error("No autorizado");
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${API_URL}/api/hero-carousel/${id}`, config);
        setCurrentSlide(data);
        return data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error loading slide";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // POST - Create new slide
  const createSlide = useCallback(
    async (slideData, imageFile) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para crear slides.");
        throw new Error("No autorizado");
      }

      setLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("alt", slideData.alt);
        formData.append("title", slideData.title);
        formData.append("description", slideData.description);
        formData.append("buttonText", slideData.buttonText || "Ver Productos");
        formData.append("buttonLink", slideData.buttonLink || "/products");
        formData.append("order", slideData.order || 0);
        formData.append("isActive", slideData.isActive !== undefined ? slideData.isActive : true);

        if (imageFile) {
          formData.append("image", imageFile);
        }

        const { data } = await axios.post(`${API_URL}/api/hero-carousel`, formData, {
          ...config,
          headers: {
            ...config.headers,
            "Content-Type": "multipart/form-data",
          },
        });

        setSlides((prev) => [...prev, data]);
        toast.success("Slide creado exitosamente");
        return data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error creating slide";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // PUT - Update slide
  const updateSlide = useCallback(
    async (id, slideData, imageFile) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para actualizar slides.");
        throw new Error("No autorizado");
      }

      setLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("alt", slideData.alt);
        formData.append("title", slideData.title);
        formData.append("description", slideData.description);
        formData.append("buttonText", slideData.buttonText);
        formData.append("buttonLink", slideData.buttonLink);
        formData.append("order", slideData.order);
        formData.append("isActive", slideData.isActive);

        if (imageFile) {
          formData.append("image", imageFile);
        }

        const { data } = await axios.put(`${API_URL}/api/hero-carousel/${id}`, formData, {
          ...config,
          headers: {
            ...config.headers,
            "Content-Type": "multipart/form-data",
          },
        });

        setSlides((prev) => prev.map((slide) => (slide._id === id ? data : slide)));
        if (currentSlide && currentSlide._id === id) {
          setCurrentSlide(data);
        }

        toast.success("Slide actualizado exitosamente");
        return data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error updating slide";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, currentSlide]
  );

  // DELETE - Remove slide
  const deleteSlide = useCallback(
    async (id) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para eliminar slides.");
        throw new Error("No autorizado");
      }

      setLoading(true);
      setError(null);
      try {
        await axios.delete(`${API_URL}/api/hero-carousel/${id}`, config);
        setSlides((prev) => prev.filter((slide) => slide._id !== id));
        if (currentSlide && currentSlide._id === id) {
          setCurrentSlide(null);
        }
        toast.success("Slide eliminado exitosamente");
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error deleting slide";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, currentSlide]
  );

  // PUT - Reorder slides
  const reorderSlides = useCallback(
    async (slidesOrder) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para reordenar slides.");
        throw new Error("No autorizado");
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.put(
          `${API_URL}/api/hero-carousel/reorder/reorder`,
          {
            slides: slidesOrder,
          },
          config
        );

        setSlides(data);
        toast.success("Slides reordenados exitosamente");
        return data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error reordering slides";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Toggle slide active status
  const toggleSlideActive = useCallback(
    async (id, isActive) => {
      const config = getAuthHeaders();
      if (!config) {
        toast.error("No autorizado para cambiar estado de slides.");
        throw new Error("No autorizado");
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.put(
          `${API_URL}/api/hero-carousel/${id}`,
          {
            isActive: !isActive,
          },
          config
        );

        setSlides((prev) => prev.map((slide) => (slide._id === id ? data : slide)));
        toast.success(`Slide ${!isActive ? "activado" : "desactivado"} exitosamente`);
        return data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Error updating slide status";
        setError({ message: errorMessage });
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Clear current slide selection
  const clearCurrentSlide = useCallback(() => {
    setCurrentSlide(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch slides when token becomes available
  useEffect(() => {
    if (authToken) {
      fetchAllSlides();
    }
  }, [authToken, fetchAllSlides]);

  const value = {
    // State
    slides,
    currentSlide,
    loading,
    error,

    // Public actions
    fetchSlides,

    // Admin actions
    fetchAllSlides,
    fetchSlideById,
    createSlide,
    updateSlide,
    deleteSlide,
    reorderSlides,
    toggleSlideActive,

    // Utility functions
    clearCurrentSlide,
    clearError,
  };

  return <HeroCarouselContext.Provider value={value}>{children}</HeroCarouselContext.Provider>;
};

HeroCarouselProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
