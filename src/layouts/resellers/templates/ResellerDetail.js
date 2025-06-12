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
import Icon from "@mui/material/Icon"; // Ensure Icon is imported for the Edit button

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

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
  const { getResellerById, loading } = useResellers(); // Use loading from context for API calls
  const { user } = useAuth();

  const [reseller, setReseller] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Access control: Admins, Editors, and the specific Reseller themselves can view
  const canViewDetails =
    user?.role === "Administrador" ||
    user?.role === "Editor" ||
    (user?._id === id && user?.role === "Revendedor");

  useEffect(() => {
    const fetchDetails = async () => {
      // It's crucial to check canViewDetails before attempting to fetch
      if (!canViewDetails) {
        setFetchError("No tienes permiso para ver los detalles de este revendedor.");
        // Do not attempt fetch if not authorized
        return;
      }
      try {
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
  }, [id, getResellerById, canViewDetails]); // Add canViewDetails to dependencies

  // Handle loading and error states for initial fetch
  if (loading && !reseller && !fetchError) {
    // Only show loading if no data & no error yet
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
                {/* Edit button */}
                {(user?.role === "Administrador" || user?.role === "Editor") && (
                  <MDButton
                    component={Link} // Link component needed for navigation
                    to={`/resellers/edit/${reseller._id}`}
                    variant="gradient"
                    color="dark"
                    sx={{
                      backgroundColor: "black",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#333",
                      },
                    }}
                  >
                    <Icon sx={{ fontWeight: "bold", color: "white" }}>edit</Icon>
                    &nbsp;Editar
                  </MDButton>
                )}
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
                    <MDTypography variant="body2">
                      {reseller.resellerCategory?.toUpperCase()}
                    </MDTypography>
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
    </DashboardLayout>
  );
}

export default ResellerDetail;
