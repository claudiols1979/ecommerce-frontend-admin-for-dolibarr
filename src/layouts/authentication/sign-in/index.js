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

import { useState } from "react"; // Already present, but good to confirm

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

// --- NEW: Import useAuth hook from your contexts directory ---
import { useAuth } from "contexts/AuthContext";

function Basic() {
  // The component is named Basic, not BasicSignIn
  const [rememberMe, setRememberMe] = useState(false);

  // --- NEW: State for form inputs ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // --- NEW: State for loading indicator and error messages ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- NEW: Get the login function from AuthContext ---
  const { login } = useAuth();

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  // --- NEW: Handle form submission ---
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default browser form submission
    setLoading(true); // Show loading state
    setError(null); // Clear any previous errors

    try {
      // Call the login function from AuthContext
      const result = await login(email, password);
      if (!result.success) {
        // If login failed (e.g., wrong credentials), display the message from the backend
        setError(result.message);
      }
      // If login was successful, the AuthProvider already handles redirection to /dashboard
    } catch (err) {
      // Catch any unexpected network errors or other issues
      console.error("An unexpected error occurred during login:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Iniciar Sesión
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Ingresa tu correo electrónico y contraseña
          </MDTypography>
          {/* Social login buttons are usually not integrated with custom backend auth; 
              you can remove them if you don't plan to use social login.
              For now, I'll keep them as they are in your original file.
          */}
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {/* --- NEW: Add onSubmit handler to the form --- */}
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email} // --- NEW: Bind value to component state ---
                onChange={(e) => setEmail(e.target.value)} // --- NEW: Update state on input change ---
                required // --- NEW: Add HTML5 required validation for basic checks ---
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Contraseña" // Changed label to Spanish for consistency
                fullWidth
                value={password} // --- NEW: Bind value to component state ---
                onChange={(e) => setPassword(e.target.value)} // --- NEW: Update state on input change ---
                required // --- NEW: Add HTML5 required validation for basic checks ---
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              {/* <Switch checked={rememberMe} onChange={handleSetRememberMe} /> */}
              {/* <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Recordarme
              </MDTypography> */}
            </MDBox>

            {/* --- NEW: Display error message if present --- */}
            {error && (
              <MDBox mt={2} mb={1}>
                <MDTypography variant="caption" color="error" fontWeight="medium">
                  {error}
                </MDTypography>
              </MDBox>
            )}

            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit" // --- NEW: Set button type to "submit" for form handling ---
                disabled={loading} // --- NEW: Disable button while loading ---
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}{" "}
                {/* --- NEW: Change button text based on loading state --- */}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                ¿No tienes una cuenta? {/* Changed text to Spanish for consistency */}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Regístrate
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
