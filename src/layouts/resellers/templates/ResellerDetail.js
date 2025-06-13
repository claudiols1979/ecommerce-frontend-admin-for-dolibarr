// frontend/src/layouts/resellers/templates/ResellerDetail.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// @mui dialog components for confirmation
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Contexts
import { useResellers } from "contexts/ResellerContext";
import { useAuth } from "contexts/AuthContext";

function ResellerDetail() {
  const { id } = useParams(); // Get reseller ID from URL
  const navigate = useNavigate();
  const { getResellerById, resetResellerCode, loading: contextLoading } = useResellers(); // Renamed to contextLoading
  const { user } = useAuth();

  const [reseller, setReseller] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false); // New state for action-specific loading

  // Dialog states for reset code confirmation
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resellerIdToReset, setResellerIdToReset] = useState(null);

  // Access control: Admins, Editors, and the specific Reseller themselves can view
  const canViewDetails = user?.role === "Administrador" || user?.role === "Editor" || (user?._id === id && user?.role === "Revendedor");
  const isAdmin = user?.role === "Administrador"; // For reset code functionality

  useEffect(() => {
    const fetchDetails = async () => {
      if (!canViewDetails) {
        setFetchError("No tienes permiso para ver los detalles de este revendedor.");
        return;
      }
      try {
        // Use contextLoading for the initial fetch, not isActionLoading
        const data = await getResellerById(id);
        if (data) {
          setReseller(data);
        } else {
          setFetchError("Revendedor no encontrado.");
          toast.error("Revendedor no encontrado.");
        }
      } catch (err) {
        setFetchError(err.message || "Error al cargar los detalles del revendedor.");
        toast.error(err.message || "Error al cargar los detalles del revendedor.");
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id, getResellerById, canViewDetails]);

  // Handle opening the reset confirmation dialog
  const handleResetCodeRequest = (resellerId) => {
    setResellerIdToReset(resellerId);
    setOpenResetDialog(true);
  };

  // Handle closing the reset confirmation dialog
  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
    setResellerIdToReset(null);
  };

  // Handle confirming the reset action
  const handleConfirmReset = async () => {
    setOpenResetDialog(false); // Close dialog immediately
    setIsActionLoading(true); // Start action-specific loading
    if (resellerIdToReset) {
      try {
        if (!isAdmin) {
          toast.error("No tienes permiso para restablecer códigos de revendedor.");
          return;
        }
        const newCode = await resetResellerCode(resellerIdToReset);
        if (newCode) {
          toast.success(`Código de revendedor restablecido: ${newCode}`);
          // Update the reseller in current state so it reflects immediately
          setReseller(prevReseller => ({ ...prevReseller, resellerCode: newCode }));
          // Optionally, navigate back to the list page after a short delay
          // navigate("/revendedores"); // If you always want to go back
        }
      } catch (err) {
        toast.error(err.message || "Error al restablecer el código del revendedor.");
      } finally {
        setIsActionLoading(false); // End action-specific loading
        setResellerIdToReset(null);
      }
    }
  };


  // Show loading for initial data fetch
  if (contextLoading && !reseller && !fetchError) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="info" />
          <MDTypography variant="h5" ml={2}>
            Cargando detalles del revendedor...
          </MDTypography>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

  // Handle access denied or fetch error
  if (fetchError || !reseller) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography variant="h5" color="error" gutterBottom>
            {fetchError || "Revendedor no encontrado o acceso denegado."}
          </MDTypography>
          <MDButton
            onClick={() => navigate("/revendedores")}
            variant="gradient"
            color="info"
            sx={{ mt: 2 }}
          >
            Volver a Revendedores
          </MDButton>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Render details
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
                  Detalles del Revendedor
                </MDTypography>
                <MDBox display="flex" gap={1}> {/* Use MDBox with gap for multiple buttons */}
                    {/* Edit button */}
                    {(user?.role === "Administrador" || user?.role === "Editor") && (
                        <MDButton
                            component={Link}
                            to={`/resellers/edit/${reseller._id}`}
                            variant="gradient"
                            bgColor="dark"
                            sx={{
                                backgroundColor: 'black',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#333',
                                },
                            }}
                        >
                            <Icon sx={{ fontWeight: "bold", color: 'white' }}>edit</Icon>
                            &nbsp;Editar
                        </MDButton>
                    )}

                    {/* Reset Code Button (Admin only) */}
                    {isAdmin && (
                        <MDButton
                            variant="gradient"
                            bgColor="warning" // Use a warning color for reset
                            sx={{
                                backgroundColor: '#ffc107', // Gold-ish color for warning
                                color: 'black',
                                '&:hover': {
                                    backgroundColor: '#e0a800', // Darker gold on hover
                                },
                            }}
                            onClick={() => handleResetCodeRequest(reseller._id)}
                            disabled={isActionLoading} // Disable while action is in progress
                        >
                            {isActionLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                <>
                                    <Icon sx={{ fontWeight: "bold", color: 'black' }}>vpn_key</Icon>
                                    &nbsp;Restablecer Código
                                </>
                            )}
                        </MDButton>
                    )}
                </MDBox>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <MDTypography variant="h5" mb={1}>
                      {reseller.firstName} {reseller.lastName}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDTypography variant="body2" color="text" fontWeight="bold">
                      Correo Electrónico:
                    </MDTypography>
                    <MDTypography variant="body2">{reseller.email}</MDTypography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDTypography variant="body2" color="text" fontWeight="bold">
                      Código de Revendedor:
                    </MDTypography>
                    <MDTypography variant="body2" color="info">
                      {reseller.resellerCode}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDTypography variant="body2" color="text" fontWeight="bold">
                      Categoría:
                    </MDTypography>
                    <MDTypography variant="body2">{reseller.resellerCategory?.toUpperCase()}</MDTypography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDTypography variant="body2" color="text" fontWeight="bold">
                      Teléfono:
                    </MDTypography>
                    <MDTypography variant="body2">{reseller.phoneNumber || "N/A"}</MDTypography>
                  </Grid>
                  <Grid item xs={12}>
                    <MDTypography variant="body2" color="text" fontWeight="bold">
                      Dirección:
                    </MDTypography>
                    <MDTypography variant="body2">{reseller.address || "N/A"}</MDTypography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                    <MDTypography variant="body2" color="text" fontWeight="bold">
                      Registrado:
                    </MDTypography>
                    <MDTypography variant="body2">
                      {new Date(reseller.createdAt).toLocaleDateString()}
                    </MDTypography>
                  </Grid>
                </Grid>
                <MDBox mt={4} display="flex" justifyContent="flex-end">
                  <MDButton
                    variant="gradient"
                    color="secondary"
                    onClick={() => navigate("/revendedores")}
                  >
                    Volver
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Reset Code Confirmation Dialog */}
      <Dialog
        open={openResetDialog}
        onClose={handleCloseResetDialog}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
        PaperProps={{
          sx: (theme) => ({
            backgroundColor:
              theme.palette.mode === "dark" ? "#1A2027" : theme.palette.background.paper,
            color: theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary,
          }),
        }}
      >
        <DialogTitle id="reset-dialog-title">
          <MDTypography
            variant="h6"
            color={(theme) =>
              theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary
            }
          >
            {"Confirmar Restablecimiento de Código"}
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="reset-dialog-description">
            <MDTypography
              variant="body2"
              color={(theme) =>
                theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary
              }
            >
              ¿Estás seguro de que quieres restablecer el código de revendedor para{" "}
              <MDTypography component="span" fontWeight="bold" color="info">
                {reseller?.firstName} {reseller?.lastName}
              </MDTypography>
              ? El código actual será invalidado y se generará uno nuevo.
            </MDTypography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton
            onClick={handleCloseResetDialog}
            color="dark"
            variant="text"
            disabled={isActionLoading}
          >
            Cancelar
          </MDButton>
          <MDButton
            onClick={handleConfirmReset}
            color="warning" // Warning color for reset confirmation
            variant="gradient"
            autoFocus
            disabled={isActionLoading}
          >
            Restablecer Código
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default ResellerDetail;
