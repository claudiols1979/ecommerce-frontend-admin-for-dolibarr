// frontend/src/layouts/resellers/templates/EditReseller.js

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

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

// List of valid reseller categories (must match backend enum)
const resellerCategories = ["cat1", "cat2", "cat3", "cat4", "cat5"];

function EditReseller() {
  const { id } = useParams(); // Get reseller ID from URL
  const navigate = useNavigate();
  const { getResellerById, updateReseller, loading } = useResellers();
  const { user } = useAuth();

  // Component-specific loading state for initial data fetch
  const [initialDataLoading, setInitialDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Form states, initialized to empty or null
  const [currentReseller, setCurrentReseller] = useState(null); // Stores the full reseller object once fetched
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [resellerCategory, setResellerCategory] = useState("");

  // Access control: Only 'Administrador' and 'Editor' can edit resellers
  const canEditReseller = user?.role === "Administrador" || user?.role === "Editor";

  // Effect to fetch reseller data when component mounts or ID changes
  useEffect(() => {
    const fetchReseller = async () => {
      setInitialDataLoading(true);
      setFetchError(null);
      try {
        const data = await getResellerById(id); // Use context function to fetch
        if (data) {
          setCurrentReseller(data); // Store the full data
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setEmail(data.email || "");
          setPhoneNumber(data.phoneNumber || "");
          setAddress(data.address || "");
          setResellerCategory(data.resellerCategory || "");
        } else {
          setFetchError("Revendedor no encontrado.");
          toast.error("Revendedor no encontrado.");
        }
      } catch (err) {
        setFetchError(err.message || "Error al cargar los detalles del revendedor.");
        toast.error(err.message || "Error al cargar los detalles del revendedor.");
        console.error("Error fetching reseller:", err);
      } finally {
        setInitialDataLoading(false);
      }
    };

    if (id) {
      fetchReseller();
    }
  }, [id, getResellerById]);

  // Function to check if any changes have been made to enable/disable the save button
  const hasChanges = useCallback(() => {
    if (!currentReseller) return false; // No current data, so no changes to compare

    return (
      firstName !== currentReseller.firstName ||
      lastName !== currentReseller.lastName ||
      email !== currentReseller.email ||
      phoneNumber !== currentReseller.phoneNumber ||
      address !== currentReseller.address ||
      resellerCategory !== currentReseller.resellerCategory
    );
  }, [firstName, lastName, email, phoneNumber, address, resellerCategory, currentReseller]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Basic client-side validation
    if (!firstName || !lastName || !email || !resellerCategory) {
      toast.error("Por favor, complete todos los campos obligatorios.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Por favor, ingrese un correo electrónico válido.");
      return;
    }

    if (!resellerCategories.includes(resellerCategory)) {
      toast.error("Categoría de revendedor inválida.");
      return;
    }

    // Prepare updated data
    const updatedData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      resellerCategory,
    };

    try {
      const success = await updateReseller(id, updatedData);
      if (success) {
        // Navigating back to reseller list, or reseller details if you create one
        navigate("/revendedores");
      }
    } catch (error) {
      console.error("Failed to update reseller in component:", error);
      // Toast message already handled by context
    }
  };

  // Show loading spinner for initial data fetch
  if (initialDataLoading) {
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

  // Show error if initial data fetch failed or reseller not found
  if (fetchError) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography variant="h5" color="error" gutterBottom>
            Error: {fetchError}
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

  // Access denied for unauthorized roles
  if (!canEditReseller) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography variant="h5" color="error" gutterBottom>
            Acceso Denegado
          </MDTypography>
          <MDTypography variant="body1" color="text">
            No tienes permiso para editar revendedores.
          </MDTypography>
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
                  Editar Revendedor: {currentReseller?.firstName} {currentReseller?.lastName}
                </MDTypography>
              </MDBox>
              <MDBox p={3} component="form" role="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nombre"
                      variant="outlined"
                      fullWidth
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Apellido"
                      variant="outlined"
                      fullWidth
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Correo Electrónico"
                      type="email"
                      variant="outlined"
                      fullWidth
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Número de Teléfono"
                      variant="outlined"
                      fullWidth
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Dirección"
                      variant="outlined"
                      fullWidth
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined" required>
                      <InputLabel id="reseller-category-label">Categoría de Revendedor</InputLabel>
                      <Select
                        labelId="reseller-category-label"
                        id="reseller-category"
                        value={resellerCategory}
                        onChange={(e) => setResellerCategory(e.target.value)}
                        label="Categoría de Revendedor"
                      >
                        <MenuItem value="">
                          <em>-- Selecciona una Categoría --</em>
                        </MenuItem>
                        {resellerCategories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category.toUpperCase()}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <MDBox mt={4} mb={1} display="flex" justifyContent="flex-end">
                  <MDButton
                    type="submit"
                    variant="gradient"
                    color="info"
                    disabled={loading || !hasChanges()} // Disable if API is loading or no changes
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar Cambios"}
                  </MDButton>
                  <MDButton
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate("/revendedores")}
                    disabled={loading}
                    sx={{ ml: 2 }}
                  >
                    Cancelar
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

export default EditReseller;
