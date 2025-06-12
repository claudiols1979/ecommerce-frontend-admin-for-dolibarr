// frontend/src/layouts/orders/index.js

/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions"; // CORRECTED IMPORT PATH
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import PropTypes from "prop-types";
import TextField from "@mui/material/TextField";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Contexts
import { useOrders } from "contexts/OrderContext";
import { useAuth } from "contexts/AuthContext";

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

// Helper component for Order Number (Link to detail)
const OrderNumberCell = ({ orderId, orderNumber }) => (
  <MDBox display="flex" alignItems="center" lineHeight={1}>
    <MDTypography
      component={Link}
      to={`/orders/details/${orderId}`}
      display="block"
      variant="button"
      fontWeight="medium"
      color="info"
      sx={{ "&:hover": { textDecoration: "underline" } }}
    >
      {orderNumber || orderId}
    </MDTypography>
  </MDBox>
);

OrderNumberCell.propTypes = {
  orderId: PropTypes.string.isRequired,
  orderNumber: PropTypes.string,
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

  return <MDBadge badgeContent={badgeText} color={badgeColor} variant="gradient" size="sm" />;
};

OrderStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

// Helper for Action Buttons (Edit / Cancel or Restore)
const ActionButtons = ({ orderId, orderStatus, onStatusChangeClick }) => {
  const { user } = useAuth(); // To check user role for permissions

  const canEdit = user?.role === "Administrador" || user?.role === "Editor";
  const canChangeStatus = user?.role === "Administrador" || user?.role === "Editor";

  const isEditEnabled = ["pending", "placed", "processing", "shipped"].includes(orderStatus);
  const isCancelOrRestoreEnabled = ["pending", "placed", "processing", "cancelled"].includes(
    orderStatus
  );

  const iconForStatusChange = orderStatus === "cancelled" ? "restore_from_trash" : "cancel";
  const iconColorForStatusChange = orderStatus === "cancelled" ? "success" : "error";

  return (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      {/* Edit Icon */}
      {canEdit && isEditEnabled ? (
        <MDTypography
          component={Link}
          to={`/orders/edit/${orderId}`}
          variant="caption"
          color="text"
          fontWeight="medium"
          sx={{ cursor: "pointer", marginRight: 1 }}
        >
          <Icon color="info" sx={{ fontSize: "24px" }}>
            edit
          </Icon>
        </MDTypography>
      ) : (
        <MDTypography
          variant="caption"
          color="text"
          fontWeight="medium"
          sx={{ cursor: "not-allowed", marginRight: 1, opacity: 0.5 }}
        >
          <Icon sx={{ fontSize: "24px" }}>edit</Icon>
        </MDTypography>
      )}

      {/* Cancel/Restore Icon */}
      {canChangeStatus && isCancelOrRestoreEnabled ? (
        <MDTypography
          component="a"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onStatusChangeClick(orderId, orderStatus);
          }}
          variant="caption"
          color="text"
          fontWeight="medium"
          sx={{ cursor: "pointer" }}
        >
          <Icon color={iconColorForStatusChange} sx={{ fontSize: "24px" }}>
            {iconForStatusChange}
          </Icon>
        </MDTypography>
      ) : (
        <MDTypography
          variant="caption"
          color="text"
          fontWeight="medium"
          sx={{ cursor: "not-allowed", opacity: 0.5 }}
        >
          <Icon sx={{ fontSize: "24px" }}>{iconForStatusChange}</Icon>
        </MDTypography>
      )}
    </MDBox>
  );
};

ActionButtons.propTypes = {
  orderId: PropTypes.string.isRequired,
  orderStatus: PropTypes.string.isRequired,
  onStatusChangeClick: PropTypes.func.isRequired,
};

// Main Orders component
function Orders() {
  const navigate = useNavigate();
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    updateOrder,
    getOrders,
  } = useOrders();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [openStatusChangeDialog, setOpenStatusChangeDialog] = useState(false);
  const [statusChangeData, setStatusChangeData] = useState({
    orderId: null,
    currentStatus: null,
    targetStatus: null,
    message: "",
  });

  // Effect to fetch all orders initially when the component mounts
  useEffect(() => {
    if (user && user.token) {
      getOrders();
    }
  }, [user, getOrders]);

  // Effect to filter orders whenever `orders` (from context) or `searchTerm` changes
  useEffect(() => {
    if (orders && orders.length > 0) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      const newFilteredOrders = orders.filter((order) => {
        // Filter by order number, customer name, customer phone, customer email, or order ID (_id)
        const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesOrderId = order._id?.toLowerCase().includes(lowerCaseSearchTerm); // Filter by MongoDB _id
        const matchesCustomerFirstName = order.user?.firstName
          ?.toLowerCase()
          .includes(lowerCaseSearchTerm);
        const matchesCustomerLastName = order.user?.lastName
          ?.toLowerCase()
          .includes(lowerCaseSearchTerm);
        const matchesCustomerPhoneNumber = order.user?.phoneNumber
          ?.toLowerCase()
          .includes(lowerCaseSearchTerm);
        const matchesCustomerEmail = order.user?.email?.toLowerCase().includes(lowerCaseSearchTerm);

        return (
          matchesOrderNumber ||
          matchesOrderId ||
          matchesCustomerFirstName ||
          matchesCustomerLastName ||
          matchesCustomerPhoneNumber ||
          matchesCustomerEmail
        );
      });
      setFilteredOrders(newFilteredOrders);
    } else {
      setFilteredOrders([]);
    }
  }, [orders, searchTerm]);

  const handleOpenStatusChangeDialog = useCallback((orderId, currentStatus) => {
    let newTargetStatus;
    let confirmationMessage;

    if (currentStatus === "cancelled") {
      newTargetStatus = "pending";
      confirmationMessage = "¿Estás seguro de que quieres restaurar este pedido a 'Pendiente'?";
    } else {
      newTargetStatus = "cancelled";
      confirmationMessage =
        "¿Estás seguro de que quieres cancelar este pedido? Esta acción puede afectar el stock.";
    }

    setStatusChangeData({
      orderId,
      currentStatus,
      targetStatus: newTargetStatus,
      message: confirmationMessage,
    });
    setOpenStatusChangeDialog(true);
  }, []);

  const handleCloseStatusChangeDialog = () => {
    setOpenStatusChangeDialog(false);
    setStatusChangeData({ orderId: null, currentStatus: null, targetStatus: null, message: "" });
  };

  const handleConfirmStatusChange = async () => {
    handleCloseStatusChangeDialog();
    try {
      if (!user || !["Administrador", "Editor"].includes(user.role)) {
        toast.error("No tienes permiso para cambiar el estado de los pedidos.");
        return;
      }
      if (typeof updateOrder !== "function") {
        toast.error("Error interno: la función de actualización de pedido no está disponible.");
        return;
      }

      await updateOrder(statusChangeData.orderId, { status: statusChangeData.targetStatus });
      toast.success(
        `Pedido ${statusChangeData.orderId} cambiado a ${
          statusTranslations[statusChangeData.targetStatus]
        } exitosamente!`
      );
      getOrders(); // After status change, re-fetch all orders to ensure local list is up-to-date
    } catch (err) {
      toast.error(err.message || "Error al cambiar el estado del pedido.");
      console.error("Error changing order status:", err);
    }
  };

  const columns = useMemo(
    () => [
      { Header: "número de pedido", accessor: "orderNumber", width: "20%", align: "left" },
      { Header: "cliente", accessor: "customer", width: "25%", align: "left" },
      { Header: "total", accessor: "totalPrice", align: "right" },
      { Header: "estado", accessor: "status", align: "center" },
      { Header: "fecha", accessor: "orderDate", align: "center" },
      { Header: "realizado por", accessor: "orderedBy", align: "left" },
      { Header: "acción", accessor: "action", align: "center" },
    ],
    []
  );

  const rows = useMemo(() => {
    return filteredOrders.map((order) => ({
      orderNumber: <OrderNumberCell orderId={order._id} orderNumber={order.orderNumber} />,
      customer: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {order.user?.firstName} {order.user?.lastName} ({order.customerDetails?.phoneNumber})
        </MDTypography>
      ),
      totalPrice: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {order.totalPrice?.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}
        </MDTypography>
      ),
      status: <OrderStatusBadge status={order.status} />,
      orderDate: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {new Date(order.createdAt).toLocaleDateString("es-CR")}
        </MDTypography>
      ),
      orderedBy: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {order.user?.email || "N/A"}
        </MDTypography>
      ),
      action: (
        <ActionButtons
          orderId={order._id}
          orderStatus={order.status}
          onStatusChangeClick={handleOpenStatusChangeDialog}
        />
      ),
    }));
  }, [filteredOrders, user, handleOpenStatusChangeDialog]);

  // Show full-page loading spinner only for the initial load of all orders
  if (ordersLoading && orders.length === 0 && searchTerm === "") {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="info" />
          <MDTypography variant="h5" ml={2}>
            Cargando pedidos...
          </MDTypography>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

  // Error state display
  if (ordersError) {
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
            Error: {ordersError.message}
          </MDTypography>
          <MDButton
            onClick={() => navigate("/dashboard")}
            variant="gradient"
            color="info"
            sx={{ mt: 2 }}
          >
            Volver al Dashboard
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
        <Grid container spacing={6}>
          <Grid item xs={12}>
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
                  Gestión de Órdenes
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {/* Search Input for client-side filtering */}
                <MDBox mb={3} display="flex" alignItems="center">
                  <TextField
                    label="Buscar número de pedido, nombre del cliente, o correo electrónico"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {ordersLoading && ( // Only show a small spinner if a background fetch is happening
                    <CircularProgress size={24} sx={{ ml: 2 }} color="info" />
                  )}
                </MDBox>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={true}
                  showTotalEntries={true}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      {/* Status Change Confirmation Dialog */}
      <Dialog
        open={openStatusChangeDialog}
        onClose={handleCloseStatusChangeDialog}
        aria-labelledby="status-change-dialog-title"
        aria-describedby="status-change-dialog-description"
        PaperProps={{
          sx: (theme) => ({
            backgroundColor:
              theme.palette.mode === "dark" ? "#1A2027" : theme.palette.background.paper,
            color: theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary,
          }),
        }}
      >
        <DialogTitle id="status-change-dialog-title">
          <MDTypography
            variant="h6"
            color={(theme) =>
              theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary
            }
          >
            {statusChangeData.targetStatus === "cancelled"
              ? "Confirmar Cancelación"
              : "Confirmar Restauración"}
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="status-change-dialog-description">
            <MDTypography
              variant="body2"
              color={(theme) =>
                theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary
              }
            >
              {statusChangeData.message}
            </MDTypography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton
            onClick={handleCloseStatusChangeDialog}
            color="dark"
            variant="text"
            disabled={ordersLoading}
          >
            Cancelar
          </MDButton>
          <MDButton
            onClick={handleConfirmStatusChange}
            color={statusChangeData.targetStatus === "cancelled" ? "error" : "success"}
            variant="gradient"
            autoFocus
            disabled={ordersLoading}
          >
            {statusChangeData.targetStatus === "cancelled" ? "Confirmar" : "Restaurar"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Orders;
