import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
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
    currentPage, // Renamed from context
    totalPages,
    totalOrders,
    changeOrderStatus,
  } = useOrders();

  // Local state for controlling the UI and API queries
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("createdAt_desc");
  const [searchTerm, setSearchTerm] = useState("");

  // Main data fetching effect
  useEffect(() => {
    // --- CORRECTED CALL ---
    // Pass arguments separately to match the context function's signature.
    fetchOrders(page, limit, sort, searchTerm);
  }, [page, limit, sort, fetchOrders]); // fetchOrders is stable due to useCallback in context

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1); // Reset to first page
  };
  
  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleSearch = useCallback(() => {
    if (page !== 1) {
      setPage(1); // Setting the page will trigger the useEffect to fetch data.
    }
    // --- CORRECTED CALL ---
    // If we're already on page 1, we need to trigger the fetch manually.
    fetchOrders(1, limit, sort, searchTerm);
  }, [limit, sort, searchTerm, fetchOrders, page]);
  
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    try {
      await changeOrderStatus(orderId, newStatus);
      toast.success(`Estado del pedido cambiado.`);
      // --- CORRECTED CALL ---
      // Re-fetch the current view after status change.
      fetchOrders(page, limit, sort, searchTerm);
    } catch (err) {
      toast.error(err.message || "Error al cambiar el estado del pedido.");
    }
  }, [page, limit, sort, searchTerm, changeOrderStatus, fetchOrders]);
  
  const { columns, rows } = useMemo(
    () => ordersTableData(orders, user, handleStatusChange),
    [orders, user, handleStatusChange]
  );

  if (loading && orders.length === 0) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="info" />
          <MDTypography variant="h5" ml={2}>Cargando pedidos...</MDTypography>
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
          <MDTypography variant="h5" color="error">{error.message}</MDTypography>
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
                <MDTypography variant="h6" color="white">Pedidos</MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" px={3} mb={3}>
                  <MDBox display="flex" alignItems="center" gap={2} flexGrow={1}>
                    <TextField
                      label="Buscar Pedido"
                      variant="outlined"
                      value={searchTerm}
                      onChange={handleSearchInputChange}
                      onKeyPress={handleKeyPress}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleSearch} edge="end">
                              <Icon>search</Icon>
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <FormControl variant="outlined" sx={{ minWidth: 220 }}>
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
                  <MDBox display="flex" alignItems="center" gap={2} ml={3}>
                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <InputLabel>Mostrar</InputLabel>
                      <Select value={limit} onChange={handleLimitChange} label="Mostrar">
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </Select>
                    </FormControl>
                  </MDBox>
                </MDBox>

                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  noEndBorder
                  entriesPerPage={false}
                  showTotalEntries={false}
                  canSearch={false}
                />
                
                <MDBox display="flex" justifyContent="center" alignItems="center" p={3}>
                    
                    {totalPages > 1 && (
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="info"
                        />
                    )}
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" alignItems="left" p={2}>
                  <MDTypography variant="caption" color="text">
                        {`Mostrando ${rows.length} de ${totalOrders} pedidos`}
                    </MDTypography>
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
