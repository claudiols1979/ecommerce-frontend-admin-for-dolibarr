/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import { useState } from "react";
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";
import AuthBranding from "components/common/AuthBranding";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

// --- Import useAuth hook ---
import { useAuth } from "contexts/AuthContext";

const glassCardSx = {
  backgroundColor: "rgba(255, 255, 255, 0.1) !important",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  color: "#fff",
};

const glassInputSx = {
  "& .MuiOutlinedInput-root, & .MuiInput-root, & .MuiFilledInput-root": {
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    color: "#fff",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255, 255, 255, 0.6)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(255, 255, 255, 0.8)",
    },
    "&::before": {
      borderBottomColor: "rgba(255, 255, 255, 0.3) !important",
    },
    "&::after": {
      borderBottomColor: "#ffffff !important",
    },
    "&:hover:not(.Mui-disabled)::before": {
      borderBottomColor: "rgba(255, 255, 255, 0.6) !important",
    },
    "& input": {
      color: "#fff !important",
    },
    "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active": {
      WebkitBoxShadow: "0 0 0 30px rgba(255, 255, 255, 0.12) inset !important",
      WebkitTextFillColor: "#fff !important",
      caretColor: "#fff",
      transition: "background-color 5000s ease-in-out 0s",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7) !important",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#ffffff !important",
  },
};

function Basic() {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      console.error("An unexpected error occurred during login:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card sx={glassCardSx}>
        <MDBox pt={4} pb={0} px={3}>
          <AuthBranding lightMode={true} />
        </MDBox>
        <MDBox
          variant="gradient"
          borderRadius="lg"
          mx={2}
          mt={1}
          p={2}
          mb={1}
          textAlign="center"
          sx={{
            background: "linear-gradient(135deg, #9b2fbe 0%, #c471ed 50%, #e056a0 100%)",
            boxShadow: "0 4px 20px rgba(180, 60, 160, 0.5)",
          }}
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Iniciar Sesión
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Ingresa tu correo electrónico y contraseña
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={glassInputSx}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Contraseña"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={glassInputSx}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" justifyContent="space-between">
              <MDBox display="flex" alignItems="center" ml={-1}>
                {/* Remember me switch can be added here if needed */}
              </MDBox>
              {/* --- FORGOT PASSWORD LINK --- */}
              <MDTypography
                component={Link}
                to="/authentication/reset-password"
                variant="button"
                fontWeight="regular"
                sx={{
                  color: "rgba(255, 255, 255, 0.7) !important",
                  "&:hover": { color: "#fff !important" },
                }}
              >
                ¿Olvidaste tu contraseña?
              </MDTypography>
            </MDBox>

            {error && (
              <MDBox mt={2} mb={1} textAlign="center">
                <MDTypography
                  variant="caption"
                  fontWeight="medium"
                  sx={{ color: "#ff8a80 !important" }}
                >
                  {error}
                </MDTypography>
              </MDBox>
            )}

            <MDBox mt={4} mb={1}>
              <MDButton
                fullWidth
                type="submit"
                disabled={loading}
                sx={{
                  background:
                    "linear-gradient(135deg, #9b2fbe 0%, #c471ed 50%, #e056a0 100%) !important",
                  color: "#fff !important",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  padding: "12px",
                  boxShadow: "0 4px 20px rgba(180, 60, 160, 0.5)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #c471ed 0%, #e056a0 50%, #f64f59 100%) !important",
                    boxShadow: "0 6px 30px rgba(180, 60, 160, 0.7)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" sx={{ color: "rgba(255, 255, 255, 0.7) !important" }}>
                ¿No tienes una cuenta?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  fontWeight="medium"
                  sx={{
                    color: "#fff !important",
                    "&:hover": { color: "rgba(255,255,255,0.9) !important" },
                  }}
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
