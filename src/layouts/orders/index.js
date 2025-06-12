/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */

import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import PropTypes from "prop-types"; // Import PropTypes

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
  const navigate = useNavigate();
  const { user } = useAuth(); // To check user role for permissions

  const canEdit = user?.role === "Administrador" || user?.role === "Editor";
  const canChangeStatus = user?.role === "Administrador" || user?.role === "Editor";

  // Conditions for Edit Icon
  const isEditEnabled = ["pending", "placed", "processing", "shipped"].includes(orderStatus);

  // Conditions for Cancel/Restore Icon
  const isCancelOrRestoreEnabled = ["pending", "placed", "processing", "cancelled"].includes(
    orderStatus
  );

  const iconForStatusChange = orderStatus === "cancelled" ? "restore_from_trash" : "cancel";
  const iconColorForStatusChange = orderStatus === "cancelled" ? "success" : "error"; // Restore is success, cancel is error

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
        // Grey out if not editable
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
            onStatusChangeClick(orderId, orderStatus); // Pass orderId and currentStatus
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
        // Grey out if not allowed to change status
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
  onStatusChangeClick: PropTypes.func.isRequired, // Changed prop name
};

// Main Orders component
function Orders() {
  const navigate = useNavigate();
  // Changed from deleteOrder to updateOrder
  const { orders, loading: ordersLoading, error: ordersError, updateOrder } = useOrders();
  const { user } = useAuth();

  const [openStatusChangeDialog, setOpenStatusChangeDialog] = useState(false);
  const [statusChangeData, setStatusChangeData] = useState({
    orderId: null,
    currentStatus: null,
    targetStatus: null,
  });

  // Handle opening the status change confirmation dialog
  const handleOpenStatusChangeDialog = (orderId, currentStatus) => {
    let newTargetStatus;
    let confirmationMessage;

    if (currentStatus === "cancelled") {
      // If currently cancelled, the action is to restore
      newTargetStatus = "pending"; // Or 'placed', depending on desired restore state
      confirmationMessage = "¿Estás seguro de que quieres restaurar este pedido a 'Pendiente'?";
    } else {
      // For any other editable status, the action is to cancel
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
  };

  // Handle closing the status change confirmation dialog
  const handleCloseStatusChangeDialog = () => {
    setOpenStatusChangeDialog(false);
    setStatusChangeData({ orderId: null, currentStatus: null, targetStatus: null, message: "" });
  };

  // Handle confirming the status change
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
      { Header: "fecha", accessor: "orderDate", align: "center" }, // NEW: Date column
      { Header: "realizado por", accessor: "orderedBy", align: "left" }, // NEW: Ordered By column
      { Header: "acción", accessor: "action", align: "center" },
    ],
    []
  );

  console.log("orders: ", orders);

  const rows = useMemo(() => {
    return orders.map((order) => ({
      orderNumber: <OrderNumberCell orderId={order._id} orderNumber={order.orderNumber} />,
      customer: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {order.user?.firstName} {order.user?.lastName} ({order.user?.phoneNumber})
        </MDTypography>
      ),
      totalPrice: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {order.totalPrice?.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}
        </MDTypography>
      ),
      status: <OrderStatusBadge status={order.status} />,
      // NEW: Populate orderDate
      orderDate: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {new Date(order.createdAt).toLocaleDateString("es-CR")}
        </MDTypography>
      ),
      // NEW: Populate orderedBy
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
  }, [orders, user, handleOpenStatusChangeDialog]); // Add handleOpenStatusChangeDialog to dependencies

  if (ordersLoading) {
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
                  Órdenes
                </MDTypography>
                {/* {(user?.role === "Administrador" || user?.role === "Revendedor") && (
                  <MDButton
                    variant="gradient"
                    color="dark"
                    onClick={() => navigate("/orders/create")}
                  >
                    <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                    &nbsp;Crear Nuevo Pedido
                  </MDButton>
                )} */}
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
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
