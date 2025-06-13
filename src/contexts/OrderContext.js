// frontend/src/contexts/OrderContext.js
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

  // --- Client-side Pagination State ---
  // Your backend's `getAllOrders` does not return pagination metadata.
  // We'll manage pagination entirely on the frontend by fetching all orders
  // and then slicing them for display.
  // 0-indexed for TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(20); // Default items per page
  // `total` will be `orders.length`

  // Helper function to set authorization headers
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

  // --- API Functions ---
  // New fetchOrders function that accepts pagination, sorting, and search parameters
  const fetchOrders = useCallback(async (page = 1, limit = 10, sort = 'createdAt_desc', search = '') => {
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
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      params.append('sort', sort);
      if (search) {
        params.append('search', search);
      }

      // Construct URL with query parameters
      const response = await axios.get(`${API_URL}/api/orders?${params.toString()}`, config);

      if (response.data && Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.pages);
        setTotalOrders(response.data.totalOrders);
        setCurrentLimit(limit); // Store the limit that was used for the fetch
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
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : err.message || "Error al cargar pedidos.";
      setError({ message: errorMessage });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [authToken, getAuthHeaders, API_URL]);

  /**
   * Fetches all orders from the backend.
   * Your backend's `getAllOrders` (GET /api/orders) fetches all orders
   * and populates 'user' with 'name', 'email', 'resellerCategory'
   * and 'items.product' with 'name', 'code'.
   * It does NOT support query parameters for pagination/filtering.
   */
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
      // Your backend's GET /api/orders does not take query params like page/limit.
      // It fetches all orders.
      const response = await axios.get(`${API_URL}/api/orders`, config);

      if (Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
      } else {
        console.warn(
          "API response format unexpected. 'orders' array missing or not an array.",
          response.data
        );
        setError({ message: "Unexpected order response format. 'orders' array missing." });
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : err.message || "Error al cargar pedidos.";
      setError({ message: errorMessage });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [authToken, getAuthHeaders, API_URL]);

  /**
   * Fetches a single order by ID.
   * IMPORTANT: Your backend does NOT have a GET /api/orders/:id endpoint.
   * This function will simulate fetching by filtering from the `orders` array
   * that `getOrders` has already loaded. This means it only works for orders
   * already visible in the list. Direct navigation to /orders/details/:id might
   * fail if the orders list hasn't been loaded first.
   */
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

  /**
   * Creates a new order.
   * IMPORTANT: Your backend only has `addItemToOrder` (for carts) and `placeOrder` (to finalize a cart).
   * It does NOT have a generic `POST /api/orders/create` endpoint for admins to create new orders.
   * This function will be a NO-OP and will throw an error to indicate this limitation.
   * To implement this, you would need to add a new endpoint to your backend.
   */
  const createOrder = useCallback(async (orderData) => {
    setError(null);
    const errorMessage =
      "Funcionalidad de crear pedido directamente desde el administrador NO DISPONIBLE. El backend no tiene un endpoint para esto. Use 'addItemToOrder' y 'placeOrder' para un flujo de carrito.";
    setError({ message: errorMessage });
    throw new Error(errorMessage);
  }, []);

  /**
   * Updates an existing order.
   * Your backend's `orderRoutes.js` has PUT /api/orders/:id mapped to `updateOrder`. This aligns.
   * This is used for changing status.
   */
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
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message || "Error al actualizar el pedido.";
        setError({ message: errorMessage });
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [authToken, user?.role, getAuthHeaders, getOrders, API_URL]
  );

  /**
   * Updates an order's status. This is the "delete/restore" equivalent for your frontend,
   * as your backend doesn't have explicit delete/restore endpoints.
   * It simply calls `updateOrder` to change the `status` field.
   * `isCurrentlyCancelled` determines if we are changing FROM cancelled to something else (restore)
   * or TO cancelled (cancel).
   */
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

  // Initial fetch of orders when component mounts or auth state changes
  useEffect(() => {
    if (authToken) {
      getOrders();
    } else {
      setOrders([]); // Clear orders if not authenticated
    }
  }, [authToken, getOrders]); // Depend on authToken and getOrders

  const value = {
    orders,
    loading,
    error,
    // Client-side pagination values
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    totalOrders: orders.length, // Total is simply the count of all fetched orders

    fetchOrders,
    getOrders,
    getOrderById,
    createOrder, // This will throw an error with current backend
    updateOrder,
    changeOrderStatus, // Use this for status changes (cancel/restore)
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
