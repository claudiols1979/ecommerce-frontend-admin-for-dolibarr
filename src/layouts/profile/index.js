/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";
// Card import is no longer needed as the order section is removed
// import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";

// Overview page components
import Header from "layouts/profile/components/Header";

// React hooks for state and effect
import { useState, useEffect } from "react"; // useMemo is no longer needed as no filtering is done

// Import custom hooks from your contexts
import { useAuth } from "contexts/AuthContext";
// DashboardContext is no longer directly used in this file as orders are removed
// import { useDashboard } from "contexts/DashboardContext";

function Overview() {
  // Using the custom hook to get user data from AuthContext
  const { user, loading: authLoading, error: authError, isAuthenticated } = useAuth();
  // DashboardContext is no longer used for orders, so we remove its destructuring
  // const { dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboard();

  // State for component-specific loading and error, derived only from AuthContext now
  const [componentLoading, setComponentLoading] = useState(true);
  const [componentError, setComponentError] = useState(null);

  // The logic for fetching and filtering orders is entirely removed.
  // No need for loggedInUserId or userOrders useMemo.

  // Simplified useEffect to handle overall loading and error states,
  // now only dependent on the AuthContext.
  useEffect(() => {
    // Determine overall loading state based on authentication loading
    if (authLoading) {
      setComponentLoading(true);
    } else {
      setComponentLoading(false);
    }

    // Determine overall error state based on authentication error
    if (authError) {
      setComponentError(authError);
    } else {
      setComponentError(null);
    }
  }, [authLoading, authError]);

  // Handle loading state: Show a loading message while user data is being fetched
  if (componentLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox mb={2} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <MDTypography variant="h5" color="text">
            Cargando perfil de usuario...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Handle error state: Display an error message if there's an issue fetching user data
  if (componentError) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          mb={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
          flexDirection="column"
        >
          <MDTypography variant="h5" color="error" mb={1}>
            Error: {componentError.message || String(componentError)}
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Por favor, intente recargar la página.
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // If user data is not available after loading, or not authenticated,
  // prompt the user to log in.
  if (!user || !isAuthenticated) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox mb={2} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <MDTypography variant="h5" color="text">
            No se encontraron datos de usuario. Por favor, inicie sesión.
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Combine first and last name for display in the ProfileInfoCard
  const userFullNameForDisplay = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} /> {/* Provides some vertical spacing below the navbar */}
      <Header>
        <MDBox mt={5} mb={3}>
          {" "}
          {/* Provides margin top and bottom for the content */}
          {/* Main Grid container to hold the profile information. */}
          {/* justifyContent="center" is applied here to horizontally center the Grid items. */}
          <Grid container spacing={3} justifyContent="left">
            {/* Grid item for the ProfileInfoCard */}
            <Grid item xs={12} md={8} xl={6} sx={{ display: "flex" }}>
              <ProfileInfoCard
                title="información del perfil"
                description={`${user.role} del sistema.`}
                info={{
                  Nombre: userFullNameForDisplay,
                  Correo: user.email,
                  Ubicación: "Costa Rica", // Hardcoded location as per previous requirements
                }}
                social={[]} // Pass an empty array to satisfy ProfileInfoCard's social prop expectation
                action={{ route: "", tooltip: "Editar Perfil" }}
                shadow={false}
              />
            </Grid>

            {/* The entire "Latest Orders" Grid item, along with all its content and logic,
                has been completely removed from this file. */}
          </Grid>
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
