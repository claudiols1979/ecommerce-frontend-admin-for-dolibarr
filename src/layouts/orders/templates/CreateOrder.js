// frontend/src/layouts/orders/templates/CreateOrder.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
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
import { useOrders } from "contexts/OrderContext"; // Consuming OrderContext
import { useProducts } from "contexts/ProductContext"; // Assuming you have a ProductContext for product selection
import { useAuth } from "contexts/AuthContext"; // To get resellerCategory for pricing

function CreateOrder() {
  const navigate = useNavigate();
  const { placeOrder, loading: orderLoading } = useOrders(); // Using placeOrder from OrderContext
  const { products, loading: productsLoading, error: productsError } = useProducts(); // Fetching products from ProductContext
  const { user } = useAuth(); // Get current user for reseller category

  // Removed customer details states as they will be derived from req.user on backend
  // const [customerName, setCustomerName] = useState("");
  // const [customerPhone, setCustomerPhone] = useState("");
  // const [customerAddress, setCustomerAddress] = useState("");

  const [whatsappAgentPhoneNumber, setWhatsappAgentPhoneNumber] = useState("");
  const [cartItems, setCartItems] = useState([]); // { product: { _id, name, code, resellerPrices }, quantity, priceAtSale }

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductQuantity, setSelectedProductQuantity] = useState(1);

  // Determine the reseller category for pricing purposes
  // Fallback to 'cat1' if user role is not 'Revendedor' or category is not set
  const currentResellerCategory = user?.role === "Revendedor" ? user.resellerCategory : "cat1";

  // Calculate total price of items in cart
  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.quantity * item.priceAtSale, 0);
  };

  // Handler for adding a product to the cart
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

    // Determine the price based on the current user's reseller category
    const priceAtSale =
      productToAdd.resellerPrices?.[currentResellerCategory] ||
      productToAdd.resellerPrices?.cat1 ||
      0;

    const existingItemIndex = cartItems.findIndex((item) => item.product._id === selectedProductId);

    if (existingItemIndex > -1) {
      // Update quantity if item already in cart
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += selectedProductQuantity;
      setCartItems(updatedCartItems);
    } else {
      // Add new item to cart
      setCartItems([
        ...cartItems,
        {
          product: productToAdd, // Keep product object for easy display/access to imageUrls etc.
          quantity: selectedProductQuantity,
          priceAtSale: priceAtSale,
          name: productToAdd.name, // Storing name/code directly as per OrderItemSchema (important for backend)
          code: productToAdd.code,
        },
      ]);
    }

    // Reset selected product and quantity
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
      // If quantity is invalid or zero, remove the item
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.product._id === productId ? { ...item, quantity: parsedQuantity } : item
      )
    );
  };

  // Handle placing the order
  const handlePlaceOrder = async () => {
    // Removed customer details validation and payload, as backend will derive it from req.user
    // if (!customerName || !customerPhone || !customerAddress) {
    //   toast.error("Por favor, complete todos los detalles del cliente.");
    //   return;
    // }
    if (!whatsappAgentPhoneNumber) {
      toast.error("Por favor, ingrese el número de teléfono del agente de WhatsApp.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("El carrito está vacío. Añade productos antes de finalizar el pedido.");
      return;
    }

    const orderData = {
      // customerDetails is now derived from the authenticated user on the backend
      whatsappAgentPhoneNumber: whatsappAgentPhoneNumber,
      items: cartItems.map((item) => ({
        product: item.product._id, // Send only product ID to backend
        quantity: item.quantity,
        priceAtSale: item.priceAtSale,
        name: item.name, // Send name/code explicitly as per backend OrderItemSchema
        code: item.code,
      })),
      // Note: totalPrice and status will be handled by backend placeOrder function
    };

    try {
      const response = await placeOrder(orderData); // Call placeOrder from OrderContext
      toast.success("Pedido creado y finalizado exitosamente!");
      navigate(`/orders/details/${response.order._id}`); // Navigate to order details
    } catch (err) {
      console.error("Error creating order:", err);
      toast.error(err.message || "Error al crear y finalizar el pedido.");
    }
  };

  if (productsLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="info" />
          <MDTypography variant="h5" ml={2}>
            Cargando productos...
          </MDTypography>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

  if (productsError) {
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
            Error: {productsError.message}
          </MDTypography>
          <MDButton
            onClick={() => navigate("/products")}
            variant="gradient"
            color="info"
            sx={{ mt: 2 }}
          >
            Ir a Productos
          </MDButton>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

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
                  Crear Nuevo Pedido
                </MDTypography>
                <MDButton onClick={() => navigate("/orders")} variant="gradient" color="dark">
                  Volver a Pedidos
                </MDButton>
              </MDBox>
              <MDBox p={3} component="form" role="form">
                <Grid container spacing={3}>
                  {/* Customer Details - NOW DERIVED FROM LOGGED-IN USER */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mb={2}>
                      Detalles del Cliente (Creador del Pedido):
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12}>
                    <MDTypography variant="body2" color="text">
                      El nombre, teléfono y dirección del cliente serán tomados automáticamente del
                      perfil del usuario que está creando este pedido ({user?.firstName}{" "}
                      {user?.lastName} - {user?.email || "N/A"}). Asegúrate de que la información de
                      tu perfil esté actualizada.
                    </MDTypography>
                  </Grid>
                  {/* Removed manual input fields for customer details */}
                  {/*
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nombre del Cliente"
                      fullWidth
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      variant="outlined"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Teléfono del Cliente"
                      fullWidth
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      variant="outlined"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Dirección del Cliente"
                      fullWidth
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      variant="outlined"
                      required
                    />
                  </Grid>
                  */}
                  <Grid item xs={12}>
                    <TextField
                      label="Número de Teléfono del Agente de WhatsApp"
                      fullWidth
                      value={whatsappAgentPhoneNumber}
                      onChange={(e) => setWhatsappAgentPhoneNumber(e.target.value)}
                      variant="outlined"
                      helperText="Este es el número al que se enviará el mensaje de WhatsApp."
                      required
                    />
                  </Grid>

                  {/* Add Products to Cart */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={3} mb={2}>
                      Añadir Productos:
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="select-product-label">Seleccionar Producto</InputLabel>
                      <Select
                        labelId="select-product-label"
                        id="select-product"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        label="Seleccionar Producto"
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
                    />
                  </Grid>
                  <Grid item xs={12} md={2} display="flex" alignItems="center">
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={handleAddToCart}
                      fullWidth
                      startIcon={<AddCircleOutlineIcon />}
                    >
                      Añadir
                    </MDButton>
                  </Grid>

                  {/* Cart Items */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={3} mb={2}>
                      Artículos en el Carrito ({cartItems.length}):
                    </MDTypography>
                    {cartItems.length === 0 ? (
                      <MDTypography variant="body2" color="text">
                        No hay productos en el carrito.
                      </MDTypography>
                    ) : (
                      <MDBox>
                        {cartItems.map((item) => (
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
                                  handleUpdateCartItemQuantity(item.product._id, e.target.value)
                                }
                                inputProps={{ min: 1 }}
                                sx={{ width: "70px", mr: 1 }}
                                size="small"
                              />
                              <IconButton
                                onClick={() => handleRemoveFromCart(item.product._id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </MDBox>
                          </MDBox>
                        ))}
                        <MDBox mt={2} display="flex" justifyContent="flex-end">
                          <MDTypography variant="h6">
                            Total:{" "}
                            {calculateTotalPrice().toLocaleString("es-CR", {
                              style: "currency",
                              currency: "CRC",
                            })}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    )}
                  </Grid>

                  {/* Place Order Button */}
                  <Grid item xs={12} display="flex" justifyContent="flex-end" mt={3}>
                    <MDButton
                      variant="gradient"
                      color="success"
                      onClick={handlePlaceOrder}
                      disabled={orderLoading || cartItems.length === 0} // Disable if order is loading or cart is empty
                    >
                      {orderLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Finalizar Pedido"
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

export default CreateOrder;
