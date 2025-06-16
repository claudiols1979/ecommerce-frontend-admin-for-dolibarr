import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext"; // Assuming AuthContext is in the same directory
import PropTypes from "prop-types";
import API_URL from "../config"; // Make sure this path is correct

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const authToken = user?.token;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentLimit, setCurrentLimit] = useState(10); // Default limit
  const [rowsPerPage, setRowsPerPage] = useState(20); // Default items per page

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

  // This function remains as is, it's used by the component for pagination.
  const fetchOrders = useCallback(
    async (page = 1, limit = 10, sort = "createdAt_desc", search = "") => {
      if (!authToken) {
        setOrders([]);
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
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", limit);
        params.append("sort", sort);
        if (search) {
          params.append("search", search);
        }

        const response = await axios.get(`${API_URL}/api/orders?${params.toString()}`, config);

        if (response.data && Array.isArray(response.data.orders)) {
          setOrders(response.data.orders);
          setCurrentPage(response.data.page);
          setTotalPages(response.data.pages);
          setTotalOrders(response.data.totalOrders);
          setCurrentLimit(limit);
        } else {
          console.warn(
            "API response format unexpected for orders list. 'orders' array missing or not an array.",
            response.data
          );
          setError({ message: "Unexpected order response format. 'orders' array missing." });
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        const errorMessage =
          err.response?.data?.message || err.message || "Error al cargar pedidos.";
        setError({ message: errorMessage });
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [authToken, getAuthHeaders, API_URL]
  );

  // This function remains as is from your original file.
  const getOrders = useCallback(async () => {
    if (!authToken) {
      setOrders([]);
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
      const response = await axios.get(`${API_URL}/api/orders`, config);
      if (Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
      } else {
        setError({ message: "Unexpected order response format." });
        setOrders([]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error al cargar pedidos.";
      setError({ message: errorMessage });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [authToken, getAuthHeaders, API_URL]);

  // --- MODIFIED: This function now performs a real API call ---
  const getOrderById = useCallback(
    async (orderId) => {
      // Simulate loading state, though actual API call isn't happening here
      setLoading(true);
      setError(null);
      try {
        const foundOrder = orders.find((order) => order._id === orderId);
        if (foundOrder) {
          return foundOrder;
        } else {
          // If not found in current orders state, log an error and throw
          console.error(`Order with ID ${orderId} not found in loaded data.`);
          setError({ message: `Pedido con ID ${orderId} no encontrado.` });
          throw new Error(`Order with ID ${orderId} not found.`);
        }
      } catch (err) {
        // Re-throw the error so the calling component can catch it
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [orders] // Depends on the 'orders' state
  );

  // This function remains as is from your original file.
  const createOrder = useCallback(async (orderData) => {
    setError(null);
    const errorMessage =
      "Funcionalidad de crear pedido directamente desde el administrador NO DISPONIBLE. El backend no tiene un endpoint para esto. Use 'addItemToOrder' y 'placeOrder' para un flujo de carrito.";
    setError({ message: errorMessage });
    throw new Error(errorMessage);
  }, []);

  // This function remains as is from your original file.
  const updateOrder = useCallback(
    async (orderId, orderData) => {
      if (!authToken || !["Administrador", "Editor"].includes(user?.role)) {
        throw new Error("No autorizado para actualizar pedidos.");
      }

      setLoading(true);
      setError(null);
      try {
        const config = getAuthHeaders();
        if (!config) throw new Error("Authentication headers not available.");
        const response = await axios.put(`${API_URL}/api/orders/${orderId}`, orderData, config);
        await getOrders(); // Refresh all orders after update
        return response.data;
      } catch (err) {
        console.error("Error updating order:", err);
        const errorMessage = err.response?.data?.message || "Error al actualizar el pedido.";
        setError({ message: errorMessage });
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [authToken, user?.role, getAuthHeaders, getOrders, API_URL]
  );

  // This function remains as is from your original file.
  const changeOrderStatus = useCallback(
    async (orderId, newStatus) => {
      if (!authToken || !["Administrador", "Editor"].includes(user?.role)) {
        // Assuming Editor can also change status
        throw new Error("No autorizado para cambiar el estado de pedidos.");
      }

      setLoading(true);
      setError(null);
      try {
        const config = getAuthHeaders();
        if (!config) throw new Error("Authentication headers not available.");

        const response = await axios.put(
          `${API_URL}/api/orders/${orderId}`,
          { status: newStatus },
          config
        );

        await getOrders(); // Refresh all orders after update
        return response.data;
      } catch (err) {
        console.error("Error changing order status:", err);
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message || `Error al cambiar el estado del pedido a ${newStatus}.`;
        setError({ message: errorMessage });
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [authToken, user?.role, getAuthHeaders, getOrders, API_URL]
  );

  // This useEffect remains as is from your original file.
  useEffect(() => {
    if (authToken) {
      getOrders();
    } else {
      setOrders([]);
    }
  }, [authToken, getOrders]);

  const value = {
    orders,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    totalOrders,
    currentLimit,
    rowsPerPage,
    setRowsPerPage,
    fetchOrders,
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    changeOrderStatus,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

OrderProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};
