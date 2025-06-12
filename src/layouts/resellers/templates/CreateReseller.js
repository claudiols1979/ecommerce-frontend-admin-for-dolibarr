// frontend/src/layouts/resellers/templates/CreateReseller.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress"; // For loading spinner on button
import Box from "@mui/material/Box"; // For loading spinner container

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

// List of valid reseller categories
const resellerCategories = ["cat1", "cat2", "cat3", "cat4", "cat5"];

function CreateReseller() {
  const navigate = useNavigate();
  const { createReseller, loading } = useResellers(); // Use loading from context for API calls
  const { user } = useAuth(); // Get current user for role-based access

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [resellerCategory, setResellerCategory] = useState(""); // Initialize empty for dropdown

  // Access control: Only 'Administrador' can create resellers
  const canCreateReseller = user?.role === "Administrador";

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Basic client-side validation
    if (!firstName || !lastName || !email || !resellerCategory) {
      toast.error(
        "Por favor, complete todos los campos obligatorios: Nombre, Apellido, Correo Electrónico y Categoría de Revendedor."
      );
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

    const resellerData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      resellerCategory,
    };

    try {
      const success = await createReseller(resellerData);
      if (success) {
        // Redirection handled by toast success in context, but good to keep flow
        navigate("/revendedores"); // Navigate back to the resellers list
      }
    } catch (error) {
      // Error handling is primarily done in the context via toast.error
      console.error("Failed to create reseller in component:", error);
    }
  };

  if (!canCreateReseller) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography variant="h5" color="error" gutterBottom>
            Acceso Denegado
          </MDTypography>
          <MDTypography variant="body1" color="text">
            No tienes permiso para crear nuevos revendedores.
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
                  Registrar Nuevo Revendedor
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
                    disabled={loading} // Disable button while loading
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Registrar Revendedor"
                    )}
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

export default CreateReseller;
