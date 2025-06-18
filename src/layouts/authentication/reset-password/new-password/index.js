import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { Box } from "@mui/material";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-reset-cover.jpeg";

// Context
import { useAuth } from "contexts/AuthContext";

function NewPassword() {
  const { resetToken } = useParams();
  const { resetPassword, loading } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const result = await resetPassword(resetToken, password);

    if (result.success) {
      setMessage(result.message); // Muestra el mensaje de éxito
    } else {
      setError(result.message);
    }
  };

  return (
    <CoverLayout coverHeight="50vh" image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          py={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h3" fontWeight="medium" color="white" mt={1}>
            Ingresa tu Nueva Contraseña
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Si el reseteo fue exitoso, muestra el mensaje y el botón de login */}
          {message ? (
            <Box textAlign="center">
              <Alert severity="success" sx={{ mb: 3 }}>
                {message}
              </Alert>
              <MDButton
                variant="gradient"
                color="info"
                onClick={() => navigate("/authentication/sign-in")}
              >
                Ir a Iniciar Sesión
              </MDButton>
            </Box>
          ) : (
            // Si no, muestra el formulario de reseteo
            <MDBox component="form" role="form" onSubmit={handleSubmit}>
              <MDBox mb={2}>
                <MDInput
                  type="password"
                  label="Nueva Contraseña"
                  variant="standard"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </MDBox>
              <MDBox mb={4}>
                <MDInput
                  type="password"
                  label="Confirmar Nueva Contraseña"
                  variant="standard"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </MDBox>
              <MDBox mt={6} mb={1}>
                <MDButton
                  variant="gradient"
                  color="info"
                  fullWidth
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Restablecer Contraseña"
                  )}
                </MDButton>
              </MDBox>
            </MDBox>
          )}
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default NewPassword;
