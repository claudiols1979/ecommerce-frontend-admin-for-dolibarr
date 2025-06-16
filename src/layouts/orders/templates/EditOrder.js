import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios"; // Import axios for local product search

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
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
// ListItemText is no longer used for the search results, but might be used elsewhere.
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Contexts & Config
import { useOrders } from "contexts/OrderContext";
import { useAuth } from "contexts/AuthContext";
import API_URL from "config";

// Status Translations
const statusTranslations = {
  pending: "Pendiente",
  placed: "Realizado",
  cancelled: "Cancelado",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  expired: "Expirado",
};

const canModifyOrderItemsStatuses = ["pending", "placed", "processing"];
const canChangeOrderStatusDropdown = ["pending", "placed", "processing", "shipped"];

function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById, updateOrder, loading: orderLoading } = useOrders();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [initialStatus, setInitialStatus] = useState("");
  const [initialCartItems, setInitialCartItems] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const currentResellerCategory = user?.role === "Revendedor" ? user.resellerCategory : "cat1";
  const areOrderItemsEditable = canModifyOrderItemsStatuses.includes(currentStatus);
  const isStatusDropdownEditable = canChangeOrderStatusDropdown.includes(currentStatus);

  useEffect(() => {
    if (productSearchTerm.trim() === "") {
      setSearchedProducts([]);
      return;
    }

    const authToken = user?.token;
    if (!authToken) return;

    const handler = setTimeout(async () => {
      setProductsLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/products?keyword=${productSearchTerm}&limit=5`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        if (response.data && Array.isArray(response.data.products)) {
          setSearchedProducts(response.data.products);
        }
      } catch (err) {
        toast.error("Error al buscar productos.");
      } finally {
        setProductsLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [productSearchTerm, user?.token]);

  // Fetch order data on component mount (original logic preserved)
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
          setInitialStatus(fetchedOrder.status);
          const mappedItems = fetchedOrder.items.map((item) => {
            const productIdString =
              typeof item.product === "object" && item.product !== null
                ? item.product._id.toString()
                : item.product;
            const productImageViews =
              typeof item.product === "object" && item.product !== null
                ? item.product.imageUrls || []
                : [];
            return {
              product: {
                _id: productIdString,
                name: item.name,
                code: item.code,
                imageUrls: productImageViews,
              },
              quantity: item.quantity,
              priceAtSale: item.priceAtSale,
              name: item.name,
              code: item.code,
            };
          });
          setCartItems(mappedItems);
          setInitialCartItems(mappedItems);
        } else {
          throw new Error("Detalles del pedido no encontrados.");
        }
      } catch (err) {
        setFetchError(err.message || "Error al cargar los detalles del pedido.");
        toast.error(err.message || "Error al cargar los detalles del pedido.");
      } finally {
        setInitialLoadComplete(true);
      }
    };
    if (id) {
      fetchOrderData();
    }
  }, [id, getOrderById]);

  // `handleAddToCart` and other handlers remain unchanged
  const handleAddToCart = (productToAdd, quantity = 1) => {
    if (!productToAdd) return;

    const existingItem = cartItems.find((item) => item.product._id === productToAdd._id);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty + quantity > productToAdd.countInStock) {
      return toast.error(
        `No hay suficiente stock para ${productToAdd.name}. Disponible: ${
          productToAdd.countInStock - currentQty
        }.`
      );
    }

    const priceAtSale =
      productToAdd.resellerPrices?.[currentResellerCategory] ||
      productToAdd.resellerPrices?.cat1 ||
      0;

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.product._id === productToAdd._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          product: {
            _id: productToAdd._id.toString(),
            name: productToAdd.name,
            code: productToAdd.code,
            imageUrls: productToAdd.imageUrls,
          },
          quantity: quantity,
          priceAtSale,
          name: productToAdd.name,
          code: productToAdd.code,
        },
      ]);
    }
    setProductSearchTerm("");
    setSearchedProducts([]);
  };

  const calculateTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity * item.priceAtSale, 0);
  }, [cartItems]);

  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item.product._id !== productId));
  };

  const handleUpdateCartItemQuantity = (productId, newQuantity) => {
    const parsedQuantity = parseInt(newQuantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.product._id === productId ? { ...item, quantity: parsedQuantity } : item
      )
    );
  };

  const handleSaveOrder = async () => {
    const hasStatusChanged = currentStatus !== initialStatus;
    const normalizeItems = (items) =>
      JSON.stringify(
        items
          .map((i) => ({ p: i.product._id, q: i.quantity }))
          .sort((a, b) => a.p.localeCompare(b.p))
      );
    const hasItemsChanged = normalizeItems(cartItems) !== normalizeItems(initialCartItems);

    if (!hasStatusChanged && !hasItemsChanged) return toast.info("No hay cambios para guardar.");
    if (hasItemsChanged && !canModifyOrderItemsStatuses.includes(initialStatus))
      return toast.error("No se pueden modificar los artículos en este estado.");

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
      toast.error(err.message || "Error al actualizar el pedido.");
    }
  };

  if (!initialLoadComplete || orderLoading) {
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

  const hasStatusChanged = currentStatus !== initialStatus;
  const normalizeItems = (items) =>
    JSON.stringify(
      items.map((i) => ({ p: i.product._id, q: i.quantity })).sort((a, b) => a.p.localeCompare(b.p))
    );
  const hasItemsChanged = normalizeItems(cartItems) !== normalizeItems(initialCartItems);

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
                  {/* Order Status (Original and Unchanged) */}
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
                        value={currentStatus}
                        onChange={(e) => setCurrentStatus(e.target.value)}
                        label="Estado"
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

                  {/* Product Search Section */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={3} mb={1}>
                      Modificar Artículos:
                    </MDTypography>
                  </Grid>
                  {areOrderItemsEditable ? (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Buscar producto por nombre o código para añadir"
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        placeholder="Ej: Eros, PERF001..."
                        disabled={!areOrderItemsEditable}
                      />
                      {productsLoading && <CircularProgress size={20} sx={{ mt: 1 }} />}
                      {!productsLoading && searchedProducts.length > 0 && (
                        <Card sx={{ mt: 1, maxHeight: 220, overflow: "auto" }}>
                          <List dense>
                            {searchedProducts.map((product) => (
                              <ListItem key={product._id} divider>
                                {/* --- CORRECTED: Using MDTypography for theme-aware text --- */}
                                <MDBox flexGrow={1} p={2}>
                                  <MDTypography variant="button" color="text" fontWeight="medium">
                                    {product.name}
                                  </MDTypography>
                                  <MDTypography variant="caption" color="text" display="block">
                                    {`Cód: ${product.code} | Stock: ${product.countInStock}`}
                                  </MDTypography>
                                </MDBox>
                                <ListItemSecondaryAction>
                                  <MDButton
                                    variant="outlined"
                                    color="info"
                                    size="small"
                                    onClick={() => handleAddToCart(product)}
                                    sx={{ mr: 1 }}
                                  >
                                    Añadir
                                  </MDButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                          </List>
                        </Card>
                      )}
                    </Grid>
                  ) : (
                    <Grid item xs={12}>
                      <MDTypography variant="body2" color="text">
                        No se pueden modificar los artículos en el estado actual del pedido.
                      </MDTypography>
                    </Grid>
                  )}

                  {/* Current Order Items */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={3} mb={2}>
                      Artículos Actuales ({cartItems.length}):
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12}>
                    {cartItems.length > 0 ? (
                      cartItems.map((item) => (
                        <MDBox
                          key={item.product._id}
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
                                `https://placehold.co/40x40/cccccc/000000?text=Item`
                              }
                              alt={item.name}
                              sx={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "md",
                                mr: 1.5,
                              }}
                            />
                            <MDTypography variant="button" fontWeight="medium" color="text">
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
                                handleUpdateCartItemQuantity(item.product._id, e.target.value)
                              }
                              inputProps={{ min: 1 }}
                              sx={{ width: "70px", mr: 1 }}
                              size="small"
                              disabled={!areOrderItemsEditable}
                            />
                            <IconButton
                              onClick={() => handleRemoveFromCart(item.product._id)}
                              color="error"
                              disabled={!areOrderItemsEditable}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </MDBox>
                        </MDBox>
                      ))
                    ) : (
                      <MDTypography variant="body2" color="text">
                        No hay productos en este pedido.
                      </MDTypography>
                    )}
                    <MDBox mt={2} display="flex" justifyContent="flex-end">
                      <MDTypography variant="h6" color="text">
                        Nuevo Total Estimado:{" "}
                        {calculateTotalPrice().toLocaleString("es-CR", {
                          style: "currency",
                          currency: "CRC",
                        })}
                      </MDTypography>
                    </MDBox>
                  </Grid>

                  {/* Save Button (Original and Unchanged) */}
                  <Grid item xs={12} display="flex" justifyContent="flex-end" mt={3}>
                    <MDButton
                      variant="gradient"
                      color="success"
                      onClick={handleSaveOrder}
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
