// frontend/src/contexts/ProductContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import PropTypes from "prop-types";
import API_URL from "../config"; // Make sure this path is correct based on your file structure

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
  const [limit, setLimit] = useState(20); // Default limit for pagination

  // Helper function to set authorization headers
  // Returns config object or null if authToken is not available.
  const getAuthHeaders = useCallback(() => {
    console.log(
      "ProductContext (getAuthHeaders): authToken status:",
      authToken ? "Present" : "Missing"
    );
    if (!authToken) {
      return null; // Return null if token is not available, rather than throwing.
    }
    return {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
  }, [authToken]); // authToken is a dependency here

  // --- API Functions ---

  // Get all products with pagination
  const getProducts = useCallback(
    async (pageNum = page, limitNum = limit, keyword = "") => {
      console.log("ProductContext (getProducts): Called. isAuthenticated:");

      if (!authToken) {
        console.log(
          "ProductContext (getProducts): Not authenticated. Clearing products and returning."
        );
        setProducts([]); // Clear products if not authenticated
        setLoading(false);
        setError(null);
        return;
      }

      const config = getAuthHeaders(); // Get config. This might be null if token is missing.

      if (!config) {
        // Check if auth headers are successfully retrieved
        console.log(
          "ProductContext (getProducts): Auth headers not ready. Cannot fetch products yet."
        );
        setError({ message: "Authentication token not available. Please wait or log in." });
        setLoading(false); // Make sure loading is false if we're not even trying to fetch
        return; // Exit if headers aren't ready
      }

      setLoading(true);
      setError(null); // Clear previous errors
      try {
        console.log(
          `ProductContext (getProducts): Attempting to fetch from ${API_URL}/api/products`
        );
        const response = await axios.get(
          `${API_URL}/api/products?page=${pageNum}&limit=${limitNum}&keyword=${keyword}`,
          config
        );
        console.log("ProductContext (getProducts): API Response Data:", response.data);

        // Crucial: Check if response.data.products exists and is an array
        if (Array.isArray(response.data.products)) {
          setProducts(response.data.products);
          setPage(response.data.page);
          setPages(response.data.pages);
          setTotal(response.data.total);
          setLimit(limitNum);
          console.log(
            `ProductContext (getProducts): Successfully set ${response.data.products.length} products.`
          );
        } else {
          console.warn(
            "ProductContext (getProducts): API response format unexpected. 'products' array missing or not an array.",
            response.data
          );
          setError({ message: "Unexpected product response format. 'products' array missing." });
          setProducts([]); // Ensure products state is an empty array on unexpected format
        }
      } catch (err) {
        console.error("ProductContext (getProducts): Error fetching products:", err);
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message || "Error al cargar productos.";
        console.error("ProductContext (getProducts): Extracted Error Message:", errorMessage);
        setError({ message: errorMessage });
        setProducts([]); // Clear products on error
      } finally {
        setLoading(false);
        console.log("ProductContext (getProducts): Fetch attempt finished. Loading set to false.");
      }
    },
    [authToken, getAuthHeaders, page, limit] // Dependencies for useCallback
  );

  // Get single product by ID (This function was already defined but not exposed)
  const getProductById = useCallback(
    async (productId) => {
      setLoading(true); // Can use a separate loading state if needed for detail view
      setError(null);
      try {
        const config = getAuthHeaders();
        if (!config) throw new Error("Authentication headers not available.");
        console.log(`ProductContext (getProductById): Fetching product with ID: ${productId}`);
        const response = await axios.get(`${API_URL}/api/products/${productId}`, config);
        console.log("ProductContext (getProductById): Product fetched:", response.data);
        return response.data; // Return the fetched product data
      } catch (err) {
        console.error("ProductContext (getProductById): Error fetching single product:", err);
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message || "Error al obtener los detalles del producto.";
        setError({ message: errorMessage });
        // Don't toast here, let the calling component handle the error display
        throw new Error(errorMessage); // Re-throw to propagate to calling component
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, API_URL]
  );

  // Create a new product
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
        console.log("ProductContext (createProduct): Attempting to create product.");
        const response = await axios.post(
          `${API_URL}/api/products/create-product`,
          productData,
          config
        );
        console.log("ProductContext (createProduct): Product created successfully:", response.data);
        await getProducts(page, limit); // Refresh current page
        return response.data;
      } catch (err) {
        console.error("ProductContext (createProduct): Error creating product:", err);
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message || "Error al crear producto.";
        setError({ message: errorMessage });
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
        console.log("ProductContext (createProduct): Creation attempt finished.");
      }
    },
    [authToken, user?.role, getAuthHeaders, getProducts, page, limit, API_URL]
  );

  // Update an existing product
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
        console.log(`ProductContext (updateProduct): Attempting to update product ${productId}.`);
        const response = await axios.put(
          `${API_URL}/api/products/${productId}`,
          productData,
          config
        );
        console.log("ProductContext (updateProduct): Product updated successfully:", response.data);
        await getProducts(page, limit); // Refresh current page
        return response.data;
      } catch (err) {
        console.error("ProductContext (updateProduct): Error updating product:", err);
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message || "Error al actualizar producto.";
        setError({ message: errorMessage });
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
        console.log("ProductContext (updateProduct): Update attempt finished.");
      }
    },
    [authToken, user?.role, getAuthHeaders, getProducts, page, limit, API_URL]
  );

  // Delete a product
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
        console.log(`ProductContext (deleteProduct): Attempting to delete product ${productId}.`);
        const response = await axios.delete(`${API_URL}/api/products/delete/${productId}`, config);
        console.log("ProductContext (deleteProduct): Product deleted successfully:", response.data);
        await getProducts(page, limit); // Refresh product list after deletion
        return response.data;
      } catch (err) {
        console.error("ProductContext (deleteProduct): Error deleting product:", err);
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message || "Error al eliminar producto.";
        setError({ message: errorMessage });
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
        console.log("ProductContext (deleteProduct): Deletion attempt finished.");
      }
    },
    [authToken, user?.role, getAuthHeaders, getProducts, page, limit, API_URL]
  );

  // Initial fetch of products when component mounts or auth state changes
  useEffect(() => {
    console.log(
      "ProductContext (useEffect): Root effect triggered. isAuthenticated:",
      authToken,
      "authToken:",
      authToken ? "Present" : "Missing"
    );
    // Only call getProducts if authToken is present.
    if (authToken) {
      console.log(
        "ProductContext (useEffect): Authenticated and token present. Attempting to get products."
      );
      getProducts();
    } else {
      console.log(
        "ProductContext (useEffect): Not authenticated OR token missing. Clearing product state."
      );
      setProducts([]); // Clear products if user logs out or token isn't ready
      setPage(1);
      setPages(1);
      setTotal(0);
    }
  }, [authToken, getProducts]);

  const value = {
    products,
    loading,
    error,
    page,
    pages,
    total,
    limit,
    getProducts,
    getProductById, // <--- EXPOSED getProductById HERE
    createProduct,
    updateProduct,
    deleteProduct,
    setPage,
    setLimit,
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
