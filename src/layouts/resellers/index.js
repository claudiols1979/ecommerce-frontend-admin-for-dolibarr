// frontend/src/layouts/resellers/index.js
/* eslint-disable */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// No longer need PropTypes import here as it's handled in data file now

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Custom components
import MDAlert from "components/MDAlert";

// Contexts
import { useResellers } from "contexts/ResellerContext";
import { useAuth } from "contexts/AuthContext";

// Data for resellers table
import { resellersTableColumns, resellersTableRows } from "./data/resellersTableData";

function Resellers() {
  const navigate = useNavigate();
  const { resellers, loading, error, deleteReseller, resetResellerCode } = useResellers();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResellers, setFilteredResellers] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [resellerIdToDelete, setResellerIdToDelete] = useState(null);

  // Define user roles for access control
  const isAdmin = user?.role === "Administrador";
  const isEditor = user?.role === "Editor";
  const canManageResellers = isAdmin || isEditor; // Can edit, view, reset code
  const canDeleteResellers = isAdmin; // Only Admin can delete

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

  // Map filteredResellers to rows digestible by DataTable - now using imported function
  const rows = useMemo(() => {
    return resellersTableRows(
      filteredResellers,
      handleDeleteReseller,
      handleResetCode,
      canManageResellers,
      canDeleteResellers
    );
  }, [
    filteredResellers,
    handleDeleteReseller,
    handleResetCode,
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
            Cargando revendedores...
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
                  Gestión de Revendedores
                </MDTypography>
                {isAdmin && ( // Only Admin can create new resellers
                  <MDButton
                    component={Link}
                    to="/resellers/create" // Assuming this route will exist
                    variant="gradient"
                    bgColor="dark"
                    color="white"
                    sx={{
                      backgroundColor: "#333", // Explicitly set background to black
                      color: "#FFFFFF", // Explicitly set text color to white
                      "&:hover": {
                        backgroundColor: "#333", // Slightly lighter black on hover for feedback
                      },
                    }} // Changed from "dark" to "info" for better visibility
                  >
                    <Icon sx={{ fontWeight: "bold", color: "white" }}>person_add</Icon>
                    &nbsp;añadir revendedor
                  </MDButton>
                )}
              </MDBox>
              <MDBox p={3}>
                {/* Search Input */}
                <MDBox mb={3}>
                  <TextField
                    label="Buscar revendedor por nombre, correo, código, etc."
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: (theme) => ({
            backgroundColor:
              theme.palette.mode === "dark" ? "#1A2027" : theme.palette.background.paper,
            color: theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary,
          }),
        }}
      >
        <DialogTitle id="delete-dialog-title">
          <MDTypography
            variant="h6"
            color={(theme) =>
              theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary
            }
          >
            {"Confirmar Eliminación"}
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            <MDTypography
              variant="body2"
              color={(theme) =>
                theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary
              }
            >
              ¿Estás seguro de que quieres eliminar este revendedor? Esta acción no se puede
              deshacer.
            </MDTypography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton
            onClick={handleCloseDeleteDialog}
            color="dark"
            variant="text"
            disabled={loading}
          >
            Cancelar
          </MDButton>
          <MDButton
            onClick={handleConfirmDelete}
            color="error"
            variant="gradient"
            autoFocus
            disabled={loading}
          >
            Eliminar
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Resellers;
