// frontend/src/contexts/ProductContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import PropTypes from "prop-types";
import API_URL from "../config";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const authToken = user?.token;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const getAuthHeaders = useCallback(() => {
    if (!authToken) {
      return null;
    }
    return {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
  }, [authToken]);

  const fetchProducts = useCallback(
    async (currentSearchTerm) => {
      // Accept the search term as an argument
      if (!authToken) {
        setProducts([]);
        setLoading(false);
        setError(null);
        return;
      }

      const config = getAuthHeaders();
      if (!config) {
        setError({ message: "Authentication token not available. Please wait or log in." });
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_URL}/api/products?page=${page}&limit=${limit}&keyword=${currentSearchTerm}`, // Use the passed search term
          config
        );

        if (Array.isArray(response.data.products)) {
          setProducts(response.data.products);
          setPage(response.data.page);
          setPages(response.data.pages);
          setTotal(response.data.total);
        } else {
          console.warn(
            "ProductContext (fetchProducts): API response format unexpected. 'products' array missing or not an array.",
            response.data
          );
          setError({ message: "Unexpected product response format. 'products' array missing." });
          setProducts([]);
        }
      } catch (err) {
        console.error("ProductContext (fetchProducts): Error fetching products:", err);
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message || "Error al cargar productos.";
        setError({ message: errorMessage });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [authToken, getAuthHeaders, page, limit, API_URL]
  );

  // This useEffect now only fetches on initial load and when pagination or limit changes.

  // useEffect(() => {
  //   if (authToken) {
  //     fetchProducts(searchTerm);
  //   } else {
  //     setProducts([]);
  //     setPage(1);
  //     setPages(1);
  //     setTotal(0);
  //   }
  // }, [authToken, page, limit]);

  // Removed searchTerm from dependencies

  // --- CRUD operations for products ---
  // (The rest of your CRUD operations remain the same)
  const getProductById = useCallback(
    async (productId) => {
      setLoading(true);
      setError(null);
      try {
        const config = getAuthHeaders();
        if (!config) throw new Error("Authentication headers not available.");
        const response = await axios.get(`${API_URL}/api/products/${productId}`, config);
        return response.data;
      } catch (err) {
        console.error("ProductContext (getProductById): Error fetching single product:", err);
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message || "Error al obtener los detalles del producto.";
        setError({
          message: errorMessage,
        });
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, API_URL]
  );

  const createProduct = useCallback(
    async (productData) => {
      if (!authToken || !["Administrador", "Editor"].includes(user?.role)) {
        throw new Error("No autorizado para crear productos.");
      }

      setLoading(true);
      setError(null);
      try {
        const config = getAuthHeaders();
        if (!config) throw new Error("Authentication headers not available.");
        const response = await axios.post(
          `${API_URL}/api/products/create-product`,
          productData,
          config
        );
        await fetchProducts(searchTerm); // Refresh list immediately
        return response.data;
      } catch (err) {
        console.error("ProductContext (createProduct): Error creating product:", err);
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message || "Error al crear producto.";
        setError({
          message: errorMessage,
        });
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [authToken, user?.role, getAuthHeaders, fetchProducts, API_URL]
  );

  const updateProduct = useCallback(
    async (productId, productData) => {
      if (!authToken || !["Administrador", "Editor"].includes(user?.role)) {
        throw new Error("No autorizado para actualizar productos.");
      }

      setLoading(true);
      setError(null);
      try {
        const config = getAuthHeaders();
        if (!config) throw new Error("Authentication headers not available.");
        const response = await axios.put(
          `${API_URL}/api/products/${productId}`,
          productData,
          config
        );
        await fetchProducts(searchTerm); // Refresh list immediately
        return response.data;
      } catch (err) {
        console.error("ProductContext (updateProduct): Error updating product:", err);
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message || "Error al actualizar producto.";
        setError({
          message: errorMessage,
        });
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [authToken, user?.role, getAuthHeaders, fetchProducts, API_URL]
  );

  const deleteProduct = useCallback(
    async (productId) => {
      if (!authToken || user?.role !== "Administrador") {
        throw new Error("No autorizado para eliminar productos.");
      }

      setLoading(true);
      setError(null);
      try {
        const config = getAuthHeaders();
        if (!config) throw new Error("Authentication headers not available.");
        const response = await axios.delete(`${API_URL}/api/products/delete/${productId}`, config);
        await fetchProducts(searchTerm); // Refresh list immediately
        return response.data;
      } catch (err) {
        console.error("ProductContext (deleteProduct): Error deleting product:", err);
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message || "Error al eliminar producto.";
        setError({
          message: errorMessage,
        });
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [authToken, user?.role, getAuthHeaders, fetchProducts, API_URL]
  );

  const value = {
    products,
    loading,
    error,
    page,
    pages,
    total,
    limit,
    searchTerm,
    setSearchTerm,
    setPage,
    setLimit,
    getProducts: fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

ProductProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
