// frontend/src/layouts/orders/templates/EditOrder.js

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Contexts
import { useOrders } from "contexts/OrderContext";
import { useProducts } from "contexts/ProductContext"; // For product selection
import { useAuth } from "contexts/AuthContext"; // For current user's reseller category

// Status Translations (consistent with other order components)
const statusTranslations = {
  pending: "Pendiente",
  placed: "Realizado",
  cancelled: "Cancelado",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  expired: "Expirado",
};

// Define statuses where order items can be modified (add/remove/quantity of products)
const canModifyOrderItemsStatuses = ["pending", "placed", "processing"];

// Define statuses where the order's *status* can be changed via the dropdown
// This specifically allows changing from 'shipped' to 'delivered'
const canChangeOrderStatusDropdown = ["pending", "placed", "processing", "shipped"];

function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById, updateOrder, loading: orderLoading } = useOrders();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { user } = useAuth(); // To get current user's role and reseller category

  const [order, setOrder] = useState(null); // Stores the initially fetched order data
  const [currentStatus, setCurrentStatus] = useState(""); // Tracks the currently selected status in the dropdown
  const [cartItems, setCartItems] = useState([]); // To manage items in the order for editing

  // States to track initial values for comparison
  const [initialStatus, setInitialStatus] = useState("");
  const [initialCartItems, setInitialCartItems] = useState([]);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductQuantity, setSelectedProductQuantity] = useState(1);

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Determine the reseller category for pricing purposes
  const currentResellerCategory = user?.role === "Revendedor" ? user.resellerCategory : "cat1";

  // Determine if order items can be modified based on the current status
  const areOrderItemsEditable = canModifyOrderItemsStatuses.includes(currentStatus);

  // Determine if the status dropdown itself is editable based on the current status
  const isStatusDropdownEditable = canChangeOrderStatusDropdown.includes(currentStatus);

  // Fetch order data on component mount or ID change
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setInitialLoadComplete(false);
        setFetchError(null);
        if (typeof getOrderById !== "function") {
          throw new Error("Function to get order by ID is not available.");
        }
        const fetchedOrder = await getOrderById(id);
        if (fetchedOrder) {
          setOrder(fetchedOrder);
          setCurrentStatus(fetchedOrder.status);
          setInitialStatus(fetchedOrder.status); // Store initial status

          // Initialize cartItems from fetched order items and store initial state
          const mappedItems = fetchedOrder.items.map((item) => {
            let productIdString;
            let productImageViews = [];

            // Ensure product ID is always a string for consistency
            if (typeof item.product === "object" && item.product !== null) {
              productIdString = item.product._id.toString(); // Ensure it's a string
              productImageViews = item.product.imageUrls || []; // Get image URLs if populated
            } else if (typeof item.product === "string") {
              productIdString = item.product; // Already a string
            } else {
              productIdString = item._id ? item._id.toString() : "unknown"; // Fallback
            }

            return {
              product: {
                _id: productIdString,
                name: item.name || "Unknown Product",
                code: item.code || "UNKNOWN",
                imageUrls: productImageViews,
              },
              quantity: item.quantity,
              priceAtSale: item.priceAtSale,
              name: item.name, // Keep these directly from item for backend consistency
              code: item.code, // Keep these directly from item for backend consistency
            };
          });
          setCartItems(mappedItems);
          setInitialCartItems(mappedItems); // Store initial cart items
        } else {
          setFetchError("Detalles del pedido no encontrados.");
          toast.error("Detalles del pedido no encontrados.");
        }
      } catch (err) {
        setFetchError(err.message || "Error al cargar los detalles del pedido.");
        toast.error(err.message || "Error al cargar los detalles del pedido.");
        console.error("Error fetching order details:", err);
      } finally {
        setInitialLoadComplete(true);
      }
    };

    if (id) {
      fetchOrderData();
    }
  }, [id, getOrderById]);

  // Calculate total price of items in cart
  const calculateTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity * item.priceAtSale, 0);
  }, [cartItems]);

  // Handler for adding a product to the cart (similar to CreateOrder)
  const handleAddToCart = () => {
    if (!selectedProductId) {
      toast.error("Por favor, selecciona un producto.");
      return;
    }
    if (selectedProductQuantity <= 0) {
      toast.error("La cantidad debe ser mayor a cero.");
      return;
    }

    const productToAdd = products.find((p) => p._id === selectedProductId);
    if (!productToAdd) {
      toast.error("Producto no encontrado.");
      return;
    }

    // Ensure productToAdd._id is treated as a string for comparison
    const existingItemInCart = cartItems.find(
      (item) => item.product._id === productToAdd._id.toString()
    );
    const currentQuantityInCart = existingItemInCart ? existingItemInCart.quantity : 0;
    const totalRequestedQuantity = currentQuantityInCart + selectedProductQuantity;

    // Check if total requested quantity exceeds available stock
    if (totalRequestedQuantity > productToAdd.countInStock) {
      toast.error(
        `No hay suficiente stock para ${productToAdd.name}. Cantidad disponible: ${
          productToAdd.countInStock - currentQuantityInCart
        }.`
      );
      return;
    }

    // Determine the price based on the current user's reseller category
    const priceAtSale =
      productToAdd.resellerPrices?.[currentResellerCategory] ||
      productToAdd.resellerPrices?.cat1 ||
      0;

    const existingItemIndex = cartItems.findIndex(
      (item) => item.product._id === productToAdd._id.toString()
    );

    if (existingItemIndex > -1) {
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity = totalRequestedQuantity; // Update to the new total
      setCartItems(updatedCartItems);
    } else {
      setCartItems([
        ...cartItems,
        {
          product: {
            // Create a consistent object structure for new items too
            _id: productToAdd._id.toString(), // Ensure _id is a string
            name: productToAdd.name,
            code: productToAdd.code,
            imageUrls: productToAdd.imageUrls, // Carry over image URLs
          },
          quantity: selectedProductQuantity,
          priceAtSale: priceAtSale,
          name: productToAdd.name,
          code: productToAdd.code,
        },
      ]);
    }

    setSelectedProductId("");
    setSelectedProductQuantity(1);
  };

  // Handler for removing an item from the cart
  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item.product._id !== productId));
  };

  // Handler for updating quantity of an item in the cart
  const handleUpdateCartItemQuantity = (productId, newQuantity) => {
    const parsedQuantity = parseInt(newQuantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const productInStock = products.find((p) => p._id === productId);
    if (productInStock && parsedQuantity > productInStock.countInStock) {
      toast.error(
        `No hay suficiente stock para ${productInStock.name}. Cantidad disponible: ${productInStock.countInStock}.`
      );
      return;
    }

    setCartItems(
      cartItems.map((item) =>
        item.product._id === productId ? { ...item, quantity: parsedQuantity } : item
      )
    );
  };

  // Logic to determine if changes have been made (for Save button)
  const hasStatusChanged = currentStatus !== initialStatus;

  // Helper function to normalize and sort items for comparison
  const normalizeAndSortItems = (items) => {
    return items
      .map((item) => ({
        product: item.product._id, // Ensure _id is a string
        quantity: item.quantity,
        priceAtSale: item.priceAtSale,
        name: item.name,
        code: item.code,
      }))
      .sort((a, b) => a.product.localeCompare(b.product)); // Sort by product ID for consistent comparison
  };

  const hasItemsChanged =
    JSON.stringify(normalizeAndSortItems(cartItems)) !==
    JSON.stringify(normalizeAndSortItems(initialCartItems));

  const handleSaveOrder = async () => {
    // --- DEBUG LOGS ---
    console.log("handleSaveOrder: initialStatus:", initialStatus);
    console.log("handleSaveOrder: currentStatus:", currentStatus);
    console.log("handleSaveOrder: hasStatusChanged:", hasStatusChanged);
    console.log("handleSaveOrder: hasItemsChanged:", hasItemsChanged);
    console.log(
      "handleSaveOrder: areOrderItemsEditable (based on currentStatus):",
      areOrderItemsEditable
    );
    console.log(
      "handleSaveOrder: isStatusDropdownEditable (based on currentStatus):",
      isStatusDropdownEditable
    );
    // --- END DEBUG LOGS ---

    // Validation for empty cart (if items were initially present and now removed, this should still allow saving)
    if (cartItems.length === 0 && (hasItemsChanged || hasStatusChanged)) {
      toast.error(
        "El pedido no puede quedar sin productos. Añade al menos uno, o cancela los cambios."
      );
      return;
    }

    // Frontend validation to ensure items aren't modified if not allowed by status
    if (hasItemsChanged && !canModifyOrderItemsStatuses.includes(initialStatus)) {
      toast.error("No se pueden modificar los artículos de un pedido con este estado inicial.");
      return;
    }

    // Frontend validation to ensure status change is allowed FROM the initial status
    if (hasStatusChanged && !canChangeOrderStatusDropdown.includes(initialStatus)) {
      toast.error("No se permite cambiar el estado de este pedido desde su estado inicial.");
      return;
    }

    // NEW: Specific validation for transitions from 'shipped'
    if (initialStatus === "shipped" && hasStatusChanged) {
      // As per clarification, if 'shipped', it cannot go to 'cancelled' or 'expired'.
      // It *can* go to 'delivered' or back to 'processing', 'pending', 'placed'.
      if (currentStatus === "cancelled" || currentStatus === "expired") {
        toast.error(
          `No se puede cambiar el estado de 'Enviado' a '${statusTranslations[currentStatus]}'.`
        );
        return;
      }
    }

    // If no changes at all, don't proceed
    if (!hasStatusChanged && !hasItemsChanged) {
      toast.info("No hay cambios para guardar.");
      return;
    }

    const updatedData = {
      status: currentStatus,
      items: cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        priceAtSale: item.priceAtSale,
        name: item.name,
        code: item.code,
      })),
    };

    try {
      await updateOrder(id, updatedData);
      toast.success("Pedido actualizado exitosamente!");
      navigate(`/orders/details/${id}`);
    } catch (err) {
      console.error("Error updating order:", err);
      toast.error(err.message || "Error al actualizar el pedido.");
    }
  };

  if (!initialLoadComplete || orderLoading || productsLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="info" />
          <MDTypography variant="h5" ml={2}>
            Cargando datos del pedido...
          </MDTypography>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

  if (fetchError || !order) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <MDTypography variant="h5" color="error">
            Error: {fetchError}
          </MDTypography>
          <MDButton
            onClick={() => navigate("/orders")}
            variant="gradient"
            color="info"
            sx={{ mt: 2 }}
          >
            Volver a Pedidos
          </MDButton>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

  if (productsError) {
    toast.error(`Error al cargar productos para añadir: ${productsError.message}`);
  }

  // --- DEBUGGING LOGS (visible in browser console during render) ---
  console.log("Render State:");
  console.log("  currentStatus:", currentStatus);
  console.log("  initialStatus:", initialStatus);
  console.log(
    "  cartItems (current):",
    cartItems.length,
    cartItems.map((item) => ({ _id: item.product._id, qty: item.quantity }))
  );
  console.log(
    "  initialCartItems (initial):",
    initialCartItems.length,
    initialCartItems.map((item) => ({ _id: item.product._id, qty: item.quantity }))
  );
  console.log("  hasStatusChanged:", hasStatusChanged);
  console.log("  hasItemsChanged:", hasItemsChanged);
  console.log("  Button Disabled State:", orderLoading || (!hasStatusChanged && !hasItemsChanged));
  // --- END DEBUGGING LOGS ---

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={8}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Editar Pedido: {order.orderNumber || order._id}
                </MDTypography>
                <MDButton
                  onClick={() => navigate(`/orders/details/${id}`)}
                  variant="gradient"
                  color="dark"
                >
                  Ver Detalles
                </MDButton>
              </MDBox>
              <MDBox p={3} component="form" role="form">
                <Grid container spacing={3}>
                  {/* Order Status */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mb={2}>
                      Estado del Pedido:
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="status-label">Estado</InputLabel>
                      <Select
                        labelId="status-label"
                        id="order-status"
                        value={currentStatus}
                        onChange={(e) => setCurrentStatus(e.target.value)}
                        label="Estado" // Corrected label
                        disabled={!isStatusDropdownEditable}
                      >
                        {Object.keys(statusTranslations).map((statusKey) => (
                          <MenuItem key={statusKey} value={statusKey}>
                            {statusTranslations[statusKey]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Add Products to Order */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={3} mb={2}>
                      Modificar Artículos:
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <FormControl fullWidth variant="outlined" disabled={!areOrderItemsEditable}>
                      <InputLabel id="select-product-label">Añadir Producto</InputLabel>
                      <Select
                        labelId="select-product-label"
                        id="select-product"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        label="Añadir Producto"
                        disabled={!areOrderItemsEditable}
                      >
                        <MenuItem value="">
                          <em>-- Selecciona un Producto --</em>
                        </MenuItem>
                        {products.map((product) => (
                          <MenuItem key={product._id} value={product._id}>
                            {product.name} ({product.code}) - Stock: {product.countInStock} - Precio{" "}
                            {currentResellerCategory.toUpperCase()}:{" "}
                            {product.resellerPrices?.[currentResellerCategory]?.toLocaleString(
                              "es-CR",
                              { style: "currency", currency: "CRC" }
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Cantidad"
                      type="number"
                      fullWidth
                      value={selectedProductQuantity}
                      onChange={(e) =>
                        setSelectedProductQuantity(Math.max(1, parseInt(e.target.value)))
                      }
                      variant="outlined"
                      inputProps={{ min: 1 }}
                      disabled={!areOrderItemsEditable}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} display="flex" alignItems="center">
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={handleAddToCart}
                      fullWidth
                      startIcon={<AddCircleOutlineIcon />}
                      disabled={!areOrderItemsEditable}
                    >
                      Añadir
                    </MDButton>
                  </Grid>

                  {/* Current Order Items */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={3} mb={2}>
                      Artículos Actuales ({cartItems.length}):
                    </MDTypography>
                    {cartItems.length === 0 ? (
                      <MDTypography variant="body2" color="text">
                        No hay productos en este pedido.
                      </MDTypography>
                    ) : (
                      <MDBox>
                        {cartItems.map((item) => (
                          <MDBox
                            key={item.product?._id || item._id}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            mb={1}
                            p={1}
                            borderBottom="1px solid #eee"
                          >
                            <MDBox display="flex" alignItems="center">
                              <MDBox
                                component="img"
                                src={
                                  item.product?.imageUrls?.[0]?.secure_url ||
                                  `https://placehold.co/40x40/cccccc/000000?text=${
                                    item.code || "Item"
                                  }`
                                }
                                alt={item.name || "Item"}
                                sx={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "md",
                                  mr: 1.5,
                                }}
                              />
                              <MDTypography variant="button" fontWeight="medium">
                                {item.name} (Cód: {item.code}) - {item.quantity} x{" "}
                                {item.priceAtSale.toLocaleString("es-CR", {
                                  style: "currency",
                                  currency: "CRC",
                                })}
                              </MDTypography>
                            </MDBox>
                            <MDBox display="flex" alignItems="center">
                              <TextField
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateCartItemQuantity(
                                    item.product?._id || item._id,
                                    e.target.value
                                  )
                                }
                                inputProps={{ min: 1 }}
                                sx={{ width: "70px", mr: 1 }}
                                size="small"
                                disabled={!areOrderItemsEditable}
                              />
                              <IconButton
                                onClick={() => handleRemoveFromCart(item.product?._id || item._id)}
                                color="error"
                                disabled={!areOrderItemsEditable}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </MDBox>
                          </MDBox>
                        ))}
                        <MDBox mt={2} display="flex" justifyContent="flex-end">
                          <MDTypography variant="h6">
                            Nuevo Total Estimado:{" "}
                            {calculateTotalPrice().toLocaleString("es-CR", {
                              style: "currency",
                              currency: "CRC",
                            })}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    )}
                  </Grid>

                  {/* Save Button */}
                  <Grid item xs={12} display="flex" justifyContent="flex-end" mt={3}>
                    <MDButton
                      variant="gradient"
                      color="success"
                      onClick={handleSaveOrder}
                      // Disabled if loading, or if no changes have been made
                      disabled={orderLoading || (!hasStatusChanged && !hasItemsChanged)}
                    >
                      {orderLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Guardar Cambios"
                      )}
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default EditOrder;
