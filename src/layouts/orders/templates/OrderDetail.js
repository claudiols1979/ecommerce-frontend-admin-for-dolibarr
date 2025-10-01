// frontend/src/layouts/orders/templates/OrderDetail.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types"; // Import PropTypes for validation

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge"; // Assuming MDBadge is used for status display

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Contexts
import { useOrders } from "contexts/OrderContext";
import { useAuth } from "contexts/AuthContext"; // To determine user role for permissions

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

// Helper component for Order Status Badge
const OrderStatusBadge = ({ status }) => {
  const badgeText = statusTranslations[status] || status;
  let badgeColor;
  switch (status) {
    case "pending":
    case "placed":
      badgeColor = "info";
      break;
    case "processing":
      badgeColor = "warning";
      break;
    case "shipped":
    case "delivered":
      badgeColor = "success";
      break;
    case "cancelled":
    case "expired":
      badgeColor = "error";
      break;
    default:
      badgeColor = "dark";
  }

  return <MDBadge badgeContent={badgeText} color={badgeColor} variant="gradient" size="md" />;
};

// Add PropTypes for OrderStatusBadge
OrderStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById, loading: orderLoading } = useOrders();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Determine the reseller category for pricing display
  // This might not be directly relevant for OrderDetail if prices are stored with the order,
  // but keeping it here for consistency if needed for future features.
  const currentResellerCategory = user?.role === "Revendedor" ? user.resellerCategory : "cat1";

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

  const isEditable = ["pending", "placed", "processing"].includes(order.status);
  // Assuming 'approvedBy' exists on the order if an admin/editor has processed it
  const approvedByAdmin = order.approvedBy
    ? `${order.approvedBy.firstName} ${order.approvedBy.lastName}`
    : "N/A";

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={10}>
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
                  Detalles del Pedido: {order.orderNumber || order._id}
                </MDTypography>
                <MDBox display="flex" alignItems="center">
                  {isEditable && (user?.role === "Administrador" || user?.role === "Editor") && (
                    <MDButton
                      onClick={() => navigate(`/orders/edit/${order._id}`)}
                      variant="gradient"
                      color="warning"
                      sx={{ mr: 1 }}
                    >
                      Ver Pedido
                    </MDButton>
                  )}
                  <MDButton onClick={() => navigate("/orders")} variant="gradient" color="dark">
                    Volver a todos los Pedidos
                  </MDButton>
                </MDBox>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={3}>
                  {/* Order Details */}
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="h6" mb={1}>
                      Información del Pedido:
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Número de Pedido:
                      </MDTypography>{" "}
                      {order.orderNumber || order._id}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Fecha del Pedido:
                      </MDTypography>{" "}
                      {new Date(order.createdAt).toLocaleDateString("es-CR")}
                    </MDTypography>
                    <MDBox display="flex" alignItems="center" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold" mr={1}>
                        Estado:
                      </MDTypography>{" "}
                      <OrderStatusBadge status={order.status} /> {/* Use the helper component */}
                    </MDBox>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Total (con iva + envío):
                      </MDTypography>{" "}
                      {order.totalPrice.toLocaleString("es-CR", {
                        style: "currency",
                        currency: "CRC",
                      })}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Realizado por:
                      </MDTypography>{" "}
                      {order.user?.firstName} {order.user?.lastName} ({order.user?.email})
                    </MDTypography>
                    {/* {(user?.role === "Administrador" || user?.role === "Editor") && (
                         <MDTypography variant="body2" color="text" mb={0.5}>
                         <MDTypography component="span" variant="button" fontWeight="bold">
                           Aprobado por:
                         </MDTypography>{" "}
                         {approvedByAdmin}
                       </MDTypography>
                    )} */}
                  </Grid>

                  {/* Customer Details */}
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="h6" mb={1}>
                      Detalles del Cliente Final:
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Nombre:
                      </MDTypography>{" "}
                      {order.customerDetails?.name}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Teléfono:
                      </MDTypography>{" "}
                      {order.customerDetails?.phoneNumber}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Dirección:
                      </MDTypography>{" "}
                      {order.customerDetails?.address}
                    </MDTypography>
                  </Grid>

                  {/* Order Items */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={3} mb={2}>
                      Artículos del Pedido ({order.items.length}):
                    </MDTypography>
                    {order.items.length === 0 ? (
                      <MDTypography variant="body2" color="text">
                        No hay productos en este pedido.
                      </MDTypography>
                    ) : (
                      <MDBox>
                        {order.items.map((item) => (
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
                            <MDTypography variant="button" fontWeight="medium">
                              Subtotal sin iva:{" "}
                              {(item.quantity * item.priceAtSale).toLocaleString("es-CR", {
                                style: "currency",
                                currency: "CRC",
                              })}
                            </MDTypography>
                          </MDBox>
                        ))}
                      </MDBox>
                    )}
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

export default OrderDetail;
