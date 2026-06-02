import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import {
  Grid,
  Card,
  Icon,
  CircularProgress,
  Box,
  Pagination,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDPagination from "components/MDPagination";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import ordersTableData from "./data/ordersTableData";

// Contexts
import { useAuth } from "contexts/AuthContext";
import { useOrders } from "contexts/OrderContext";
import { useConfig } from "contexts/ConfigContext";
import { useMaterialUIController } from "context";

function Orders() {
  const { user } = useAuth();
  const { taxRegime: globalTaxRegime } = useConfig();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const {
    orders,
    loading,
    error,
    fetchOrders,
    currentPage,
    totalPages,
    totalOrders,
    changeOrderStatus,
    cleanupPendingOrders,
  } = useOrders();

  // Local state for controlling the UI and API queries
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("createdAt_desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); // Immediate input state
  const [showPending, setShowPending] = useState(() => {
    return localStorage.getItem("orders-show-pending") === "true";
  });

  // Cleanup Modal state
  const [openCleanup, setOpenCleanup] = useState(false);
  const [cleanupDates, setCleanupDates] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [isCleaning, setIsCleaning] = useState(false);

  // Sync showPending to localStorage
  useEffect(() => {
    localStorage.setItem("orders-show-pending", showPending);
  }, [showPending]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
      if (searchInput !== searchTerm) {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput, searchTerm]);

  useEffect(() => {
    fetchOrders(page, limit, sort, searchTerm, !showPending);
    const intervalId = setInterval(() => {
      fetchOrders(page, limit, sort, searchTerm, !showPending, true);
    }, 8000); // 8000 milliseconds = 8 seconds

    return () => clearInterval(intervalId);
  }, [fetchOrders, page, limit, sort, searchTerm, showPending]);

  // Main data fetching effect removed as it's redundant with the one above

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = useCallback(() => {
    if (page !== 1) {
      setPage(1);
    }
    fetchOrders(1, limit, sort, searchInput, !showPending);
  }, [limit, sort, searchInput, fetchOrders, page, showPending]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
    fetchOrders(1, limit, sort, "", !showPending);
  };

  const handleTogglePending = (event) => {
    setShowPending(event.target.checked);
    setPage(1);
  };

  const handleCleanupSubmit = async () => {
    if (!cleanupDates.start || !cleanupDates.end) {
      toast.error("Por favor, seleccione ambas fechas.");
      return;
    }
    setIsCleaning(true);
    try {
      const result = await cleanupPendingOrders(cleanupDates.start, cleanupDates.end);
      toast.success(result.message);
      setOpenCleanup(false);
      fetchOrders(page, limit, sort, searchTerm, !showPending);
    } catch (err) {
      toast.error(err.message || "Error al limpiar carritos.");
    } finally {
      setIsCleaning(false);
    }
  };

  const handleStatusChange = useCallback(
    async (orderId, newStatus) => {
      try {
        await changeOrderStatus(orderId, newStatus);
        toast.success(`Estado del pedido cambiado.`);
        fetchOrders(page, limit, sort, searchTerm, !showPending);
      } catch (err) {
        toast.error(err.message || "Error al cambiar el estado del pedido.");
      }
    },
    [page, limit, sort, searchTerm, changeOrderStatus, fetchOrders]
  );

  const { columns, rows } = useMemo(
    () => ordersTableData(orders, user, handleStatusChange, globalTaxRegime),
    [orders, user, handleStatusChange, globalTaxRegime]
  );

  if (loading && orders.length === 0) {
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
          <MDTypography variant="h5" color="error">
            {error.message}
          </MDTypography>
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
              </MDBox>
              <MDBox pt={3}>
                {/* ==================================================================== */}
                {/* AQUÍ COMIENZA EL BLOQUE DE FILTROS RESPONSIVO (ÚNICO CAMBIO)         */}
                {/* Se usa Grid para que los filtros se apilen en pantallas pequeñas    */}
                {/* ==================================================================== */}
                <MDBox px={3} mb={3}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <MDInput
                        label="Buscar Pedido"
                        variant="outlined"
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        onKeyPress={handleKeyPress}
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {searchInput && (
                                <IconButton onClick={handleClearSearch} size="small" sx={{ mr: 1 }}>
                                  <Icon sx={{ color: darkMode ? "#ffffff !important" : "inherit" }}>
                                    close
                                  </Icon>
                                </IconButton>
                              )}
                              <IconButton onClick={handleSearch} edge="end">
                                <Icon sx={{ color: darkMode ? "#ffffff !important" : "inherit" }}>
                                  search
                                </Icon>
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MDInput
                        select
                        variant="outlined"
                        fullWidth
                        value={sort}
                        onChange={handleSortChange}
                        label="Ordenar Por"
                      >
                        <MenuItem value="createdAt_desc">Fecha (Más Reciente)</MenuItem>
                        <MenuItem value="createdAt_asc">Fecha (Más Antigua)</MenuItem>
                        <MenuItem value="totalPrice_desc">Total (Mayor a Menor)</MenuItem>
                        <MenuItem value="totalPrice_asc">Total (Menor a Mayor)</MenuItem>
                        <MenuItem value="status_asc">Estado (A-Z)</MenuItem>
                      </MDInput>
                    </Grid>

                    <Grid item xs={12} sm={8} md={3}>
                      <MDBox
                        display="flex"
                        flexDirection={{ xs: "column", sm: "row" }}
                        justifyContent={{ xs: "flex-start", sm: "space-around" }}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        gap={1}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={showPending}
                              onChange={handleTogglePending}
                              color="info"
                            />
                          }
                          label={
                            <MDTypography variant="button" fontWeight="medium" color="text">
                              Mostrar Carritos (Pendientes)
                            </MDTypography>
                          }
                        />
                        <MDButton
                          variant="gradient"
                          color="error"
                          size="small"
                          startIcon={<DeleteSweepIcon />}
                          onClick={() => setOpenCleanup(true)}
                          sx={{ width: { xs: "100%", sm: "auto" } }}
                        >
                          Limpiar Carritos
                        </MDButton>
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
                {/* ==================================================================== */}
                {/* AQUÍ TERMINA EL BLOQUE DE FILTROS RESPONSIVO                         */}
                {/* ==================================================================== */}

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
                    <MDPagination variant="gradient" color="info">
                      <MDPagination
                        item
                        onClick={() => handlePageChange(null, currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
                      </MDPagination>
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                        ) {
                          return (
                            <MDPagination
                              item
                              key={pageNumber}
                              active={pageNumber === currentPage}
                              onClick={() => handlePageChange(null, pageNumber)}
                            >
                              {pageNumber}
                            </MDPagination>
                          );
                        } else if (
                          pageNumber === currentPage - 3 ||
                          pageNumber === currentPage + 3
                        ) {
                          return (
                            <MDTypography
                              key={pageNumber}
                              variant="button"
                              color="secondary"
                              px={1}
                            >
                              ...
                            </MDTypography>
                          );
                        }
                        return null;
                      })}
                      <MDPagination
                        item
                        onClick={() => handlePageChange(null, currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
                      </MDPagination>
                    </MDPagination>
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

      {/* Cleanup Modal */}
      <Dialog open={openCleanup} onClose={() => !isCleaning && setOpenCleanup(false)}>
        <DialogTitle>Limpieza de Carritos Abandonados</DialogTitle>
        <DialogContent>
          <MDBox pt={2} px={1}>
            <MDTypography variant="body2" color="text" mb={3}>
              Esta acción eliminará todos los pedidos con estado{" "}
              <strong>&quot;Pendiente&quot;</strong> que hayan sido creados en el rango de fechas
              seleccionado. Esta acción <strong>no se puede deshacer</strong>.
            </MDTypography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Fecha Inicio"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={cleanupDates.start}
                  onChange={(e) => setCleanupDates({ ...cleanupDates, start: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Fecha Fin"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={cleanupDates.end}
                  onChange={(e) => setCleanupDates({ ...cleanupDates, end: e.target.value })}
                />
              </Grid>
            </Grid>
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MDButton
            variant="text"
            color="secondary"
            onClick={() => setOpenCleanup(false)}
            disabled={isCleaning}
          >
            Cancelar
          </MDButton>
          <MDButton
            variant="gradient"
            color="error"
            onClick={handleCleanupSubmit}
            disabled={isCleaning}
          >
            {isCleaning ? <CircularProgress size={24} color="inherit" /> : "Confirmar Eliminación"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Orders;
