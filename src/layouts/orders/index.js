// frontend/src/layouts/orders/index.js

import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination"; // For pagination control
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField"; // For search input

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// OrdersTableData for table columns and rows
import ordersTableData from "./data/ordersTableData";

// Contexts
import { useAuth } from "contexts/AuthContext";
import { useOrders } from "contexts/OrderContext";

function Orders() {
  const { user } = useAuth();
  const {
    orders,
    loading,
    error,
    fetchOrders,
    currentPage,
    totalPages,
    totalOrders,
    currentLimit,
    changeOrderStatus,
  } = useOrders();
  const navigate = useNavigate();

  // Local state for pagination, sorting, and search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("createdAt_desc"); // Default to latest first
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "Administrador";
  const isEditor = user?.role === "Editor";
  const isReseller = user?.role === "Revendedor";

  // Debounce search input
  const debouncedSearch = useMemo(() => {
    const handler = setTimeout(() => {
      fetchOrders(page, limit, sort, search);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [search, page, limit, sort, fetchOrders]); // Add fetchOrders to dependencies

  useEffect(() => {
    // Initial fetch and whenever page, limit, or sort changes
    fetchOrders(page, limit, sort, search); // Pass search term directly
  }, [page, limit, sort, fetchOrders]); // No need for debouncedSearch in main useEffect

  // Handle page change from Pagination component
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Handle limit change
  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page when limit changes
  };

  // Handle sort change
  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1); // Reset to first page when sort changes
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1); // Reset to first page when search changes
  };

  // Status Change Logic (for Admin/Editor)
  const handleStatusChange = async (orderId, currentStatus) => {
    // Example: Toggle between 'pending' and 'cancelled' for demonstration
    // In a real app, you'd likely open a modal with status options.
    const newStatus = currentStatus === "cancelled" ? "placed" : "cancelled"; // Simple toggle for example
    try {
      await changeOrderStatus(orderId, newStatus);
      toast.success(`Estado del pedido ${orderId} cambiado a ${newStatus}!`);
      fetchOrders(page, limit, sort, search); // Re-fetch to update table
    } catch (err) {
      toast.error(err.message || "Error al cambiar el estado del pedido.");
    }
  };

  const { columns, rows } = useMemo(() => {
    return ordersTableData(orders, user, handleStatusChange);
  }, [orders, user, handleStatusChange]); // Re-generate table data when orders or user changes

  // Display loading, error, or data
  if (loading && orders.length === 0) {
    // Only show full-screen loading if no data
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

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography variant="h5" color="error" gutterBottom>
            {error.message}
          </MDTypography>
          <MDButton
            onClick={() => fetchOrders(page, limit, sort, search)}
            variant="gradient"
            color="info"
            sx={{ mt: 2 }}
          >
            Reintentar
          </MDButton>
        </MDBox>
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
                  Pedidos
                </MDTypography>
                {/* {isAdmin || isEditor || isReseller ? (
                  <MDButton
                    component={Link}
                    to="/orders/create"
                    variant="gradient"
                    bgColor="dark"
                    sx={{
                      backgroundColor: "black",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#333",
                      },
                    }}
                  >
                    <Icon sx={{ fontWeight: "bold", color: "white" }}>add</Icon>
                    &nbsp;Crear Pedido
                  </MDButton>
                ) : null} */}
              </MDBox>
              <MDBox pt={3}>
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  px={3}
                  mb={3}
                >
                  <MDBox display="flex" alignItems="center" gap={2}>
                    {/* Search Input */}
                    <TextField
                      label="Buscar Pedido"
                      variant="outlined"
                      value={search}
                      onChange={handleSearchChange}
                      sx={{ minWidth: 200 }}
                    />
                    {/* Sort By Select */}
                    <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                      <InputLabel>Ordenar Por</InputLabel>
                      <Select value={sort} onChange={handleSortChange} label="Ordenar Por">
                        <MenuItem value="createdAt_desc">Fecha (Más Reciente)</MenuItem>
                        <MenuItem value="createdAt_asc">Fecha (Más Antigua)</MenuItem>
                        <MenuItem value="totalPrice_desc">Total (Mayor a Menor)</MenuItem>
                        <MenuItem value="totalPrice_asc">Total (Menor a Mayor)</MenuItem>
                        <MenuItem value="status_asc">Estado (A-Z)</MenuItem>
                      </Select>
                    </FormControl>
                  </MDBox>
                  <MDBox display="flex" alignItems="center" gap={2}>
                    {/* Items Per Page Select */}
                    <FormControl variant="outlined" sx={{ minWidth: 80 }}>
                      <InputLabel>Mostrar</InputLabel>
                      <Select value={limit} onChange={handleLimitChange} label="Mostrar">
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </Select>
                    </FormControl>
                    <MDTypography variant="caption" color="text">
                      {`Mostrando ${orders.length} de ${totalOrders} pedidos`}
                    </MDTypography>
                  </MDBox>
                </MDBox>

                <DataTable
                  table={{ columns, rows }}
                  is
                  noEndBorder
                  entriesPerPage={false} // Disable built-in entries per page
                  showTotalEntries={false} // Disable built-in total entries
                  canSearch={false} // Disable built-in search
                />
                <MDBox display="flex" justifyContent="center" my={3}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="info"
                  />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Orders;
