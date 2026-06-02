// frontend/src/layouts/resellers/index.js
/* eslint-disable */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// No longer need PropTypes import here as it's handled in data file now

// @mui material components
import {
  Grid,
  Card,
  Icon,
  CircularProgress,
  Box,
  MenuItem,
  InputAdornment,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

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

// Custom components
import MDAlert from "components/MDAlert";
import MDConfirmationModal from "components/MDConfirmationModal";

// Contexts
import { useResellers } from "contexts/ResellerContext";
import { useAuth } from "contexts/AuthContext";
import { useMaterialUIController } from "context";

// Data for resellers table
import { resellersTableColumns, resellersTableRows } from "./data/resellersTableData";

function Resellers() {
  const navigate = useNavigate();
  const { resellers, loading, error, deleteReseller, resetResellerCode, toggleUserBlock } =
    useResellers();
  const { user } = useAuth();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResellers, setFilteredResellers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [resellerIdToDelete, setResellerIdToDelete] = useState(null);

  // Define user roles for access control
  const isAdmin = user?.role === "Administrador";
  const isEditor = user?.role === "Editor";
  const canManageResellers = isAdmin || isEditor; // Can edit, view, reset code
  const canDeleteResellers = isAdmin; // Only Admin can delete

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(1);
  };

  // Effect to filter resellers based on search term
  useEffect(() => {
    if (resellers.length > 0) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const newFilteredResellers = resellers.filter((reseller) => {
        const matchesName = `${reseller.firstName} ${reseller.lastName}`
          .toLowerCase()
          .includes(lowerCaseSearchTerm);
        const matchesEmail = reseller.email?.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesCode = reseller.resellerCode?.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesCategory = reseller.resellerCategory
          ?.toLowerCase()
          .includes(lowerCaseSearchTerm);
        const matchesPhone = reseller.phoneNumber?.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesAddress = reseller.address?.toLowerCase().includes(lowerCaseSearchTerm);

        return (
          matchesName ||
          matchesEmail ||
          matchesCode ||
          matchesCategory ||
          matchesPhone ||
          matchesAddress
        );
      });
      setFilteredResellers(newFilteredResellers);
    } else {
      setFilteredResellers([]);
    }
  }, [resellers, searchTerm]);

  // Handle opening the delete confirmation dialog
  const handleDeleteReseller = useCallback((id) => {
    setResellerIdToDelete(id);
    setOpenDeleteDialog(true);
  }, []);

  // Handle closing the delete confirmation dialog
  const handleCloseDeleteDialog = useCallback(() => {
    setOpenDeleteDialog(false);
    setResellerIdToDelete(null);
  }, []);

  // Handle confirming the delete action
  const handleConfirmDelete = async () => {
    setOpenDeleteDialog(false); // Close dialog immediately
    if (resellerIdToDelete) {
      try {
        if (!canDeleteResellers) {
          toast.error("No tienes permiso para eliminar revendedores.");
          return;
        }
        await deleteReseller(resellerIdToDelete);
        toast.success("Revendedor eliminado exitosamente.");
      } catch (err) {
        toast.error(err.message || "Error al eliminar el revendedor.");
      } finally {
        setResellerIdToDelete(null);
      }
    }
  };

  // Handle resetting reseller code
  const handleResetCode = useCallback(
    async (id) => {
      try {
        if (!canManageResellers) {
          // Assuming Editor can also reset code for simplicity, or make it Admin only
          toast.error("No tienes permiso para restablecer códigos de revendedor.");
          return;
        }
        const newCode = await resetResellerCode(id); // This function now re-fetches list
        if (newCode) {
          toast.success(`Código de revendedor restablecido: ${newCode}`);
        }
      } catch (err) {
        toast.error(err.message || "Error al restablecer el código del revendedor.");
      }
    },
    [canManageResellers, resetResellerCode]
  );

  // Define columns for the DataTable - now directly from imported data
  const columns = useMemo(() => resellersTableColumns, []); // Use useMemo to prevent re-creation

  // Paging logic
  const totalPages = Math.ceil(filteredResellers.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedResellers = useMemo(() => {
    return filteredResellers.slice(startIndex, startIndex + limit);
  }, [filteredResellers, startIndex, limit]);

  const handlePageChange = (p) => setPage(p);
  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
    setPage(1);
  };

  // Map filteredResellers to rows digestible by DataTable - now using imported function
  const rows = useMemo(() => {
    return resellersTableRows(
      paginatedResellers,
      handleDeleteReseller,
      handleResetCode,
      toggleUserBlock,
      canManageResellers,
      canDeleteResellers
    );
  }, [
    paginatedResellers,
    handleDeleteReseller,
    handleResetCode,
    toggleUserBlock,
    canManageResellers,
    canDeleteResellers,
  ]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="info" />
          <MDTypography variant="h5" ml={2}>
            Cargando clientes...
          </MDTypography>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDAlert color="error" dismissible>
            <MDTypography variant="body2" color="white">
              {error || "Error al cargar los revendedores."}
            </MDTypography>
          </MDAlert>
          <MDButton
            onClick={() => window.location.reload()} // Simple refresh to try again
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

  // Access control for viewing the page
  // Only Admins/Editors can manage. If Resellers can view, add 'Revendedor' to this check.
  if (!canManageResellers) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDAlert color="error" dismissible>
            <MDTypography variant="body2" color="white">
              No tienes permiso para ver esta página.
            </MDTypography>
          </MDAlert>
          <MDButton
            onClick={() => navigate("/dashboard")}
            variant="gradient"
            color="info"
            sx={{ mt: 2 }}
          >
            Volver al Dashboard
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
                variant="gradient"
                borderRadius="lg"
                mx={2}
                mt={-3}
                py={3}
                px={2}
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={2}
                sx={{
                  background: "linear-gradient(135deg, #9b2fbe 0%, #c471ed 50%, #e056a0 100%)",
                  boxShadow: "0 4px 20px rgba(180, 60, 160, 0.5)",
                }}
              >
                <MDTypography variant="h6" color="white">
                  Gestión de Clientes
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <MDBox mb={3}>
                  <MDInput
                    label="Buscar cliente por nombre, correo, código, etc."
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {searchTerm && (
                            <IconButton onClick={handleClearSearch} size="small" sx={{ mr: 1 }}>
                              <CloseIcon
                                sx={{ color: darkMode ? "#ffffff !important" : "inherit" }}
                              />
                            </IconButton>
                          )}
                          <SearchIcon sx={{ color: darkMode ? "#ffffff !important" : "inherit" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </MDBox>

                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />

                <MDBox display="flex" justifyContent="center" alignItems="center" p={3}>
                  {totalPages > 1 && (
                    <MDPagination variant="gradient" color="info">
                      <MDPagination
                        item
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
                      </MDPagination>
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= page - 2 && pageNumber <= page + 2)
                        ) {
                          return (
                            <MDPagination
                              item
                              key={pageNumber}
                              active={pageNumber === page}
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </MDPagination>
                          );
                        } else if (pageNumber === page - 3 || pageNumber === page + 3) {
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
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                      >
                        <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
                      </MDPagination>
                    </MDPagination>
                  )}
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" alignItems="left" p={2}>
                  <MDTypography variant="caption" color="text">
                    {`Mostrando ${paginatedResellers.length} de ${filteredResellers.length} clientes`}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <MDConfirmationModal
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        content="¿Estás seguro de que quieres eliminar este revendedor? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={loading}
      />
    </DashboardLayout>
  );
}

export default Resellers;
