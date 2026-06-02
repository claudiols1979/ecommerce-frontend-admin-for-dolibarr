import { useState, useCallback } from "react";
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Components
import AuthBranding from "components/common/AuthBranding";

// Images
import bgImage from "assets/images/bg-reset-cover.jpeg";

// Context
import { useAuth } from "contexts/AuthContext";

function ForgotPasswordCover() {
  // We use the `forgotPassword` function, but NOT the global `loading` state
  const { forgotPassword } = useAuth();

  // --- NEW: Local loading state for this component only ---
  const [isSending, setIsSending] = useState(false);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Por favor, ingrese su correo electrónico.");
      return;
    }

    setIsSending(true); // Start local loading
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      const finalError = err.message || "Un error inesperado ocurrió.";
      setError(finalError);
    } finally {
      setIsSending(false); // Stop local loading
    }
  };

  return (
    <CoverLayout coverHeight="50vh" image={bgImage}>
      <Card
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.1) !important",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#fff",
        }}
      >
        <MDBox pt={4} pb={3} px={3}>
          <AuthBranding lightMode={true} />

          <MDTypography variant="h5" fontWeight="medium" color="white" mt={2} textAlign="center">
            Restablecer Contraseña
          </MDTypography>
          <MDTypography
            display="block"
            variant="button"
            color="white"
            my={1}
            textAlign="center"
            sx={{ opacity: 0.8 }}
          >
            Recibirás un correo con las instrucciones.
          </MDTypography>

          {message && (
            <Alert
              severity="success"
              sx={{
                mb: 2,
                mt: 3,
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                color: "#fff",
                border: "1px solid #4caf50",
              }}
            >
              {message}
            </Alert>
          )}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                mt: 3,
                backgroundColor: "rgba(244, 67, 54, 0.2)",
                color: "#fff",
                border: "1px solid #f44336",
              }}
            >
              {error}
            </Alert>
          )}

          <MDBox component="form" role="form" onSubmit={handleSubmit} mt={3}>
            <MDBox mb={4}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSending || !!message}
                sx={{
                  "& .MuiOutlinedInput-root, & .MuiInput-root": {
                    color: "#fff",
                    "&::before": { borderBottomColor: "rgba(255, 255, 255, 0.3) !important" },
                    "&::after": { borderBottomColor: "#ffffff !important" },
                    "&:hover:not(.Mui-disabled)::before": {
                      borderBottomColor: "rgba(255, 255, 255, 0.6) !important",
                    },
                    "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active":
                      {
                        WebkitBoxShadow: "0 0 0 30px rgba(255, 255, 255, 0.1) inset !important",
                        WebkitTextFillColor: "#fff !important",
                        caretColor: "#fff",
                        transition: "background-color 5000s ease-in-out 0s",
                      },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7) !important" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#ffffff !important" },
                }}
              />
            </MDBox>
            <MDBox mt={6} mb={1}>
              <MDButton
                variant="gradient"
                fullWidth
                type="submit"
                disabled={isSending || !!message}
                sx={{
                  background: "linear-gradient(135deg, #9b2fbe 0%, #c471ed 50%, #e056a0 100%)",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(180, 60, 160, 0.5)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #c471ed 0%, #e056a0 50%, #f64f59 100%)",
                  },
                }}
              >
                {isSending ? <CircularProgress size={24} color="inherit" /> : "Enviar Enlace"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography
                component={Link}
                to="/authentication/sign-in"
                variant="button"
                color="white"
                fontWeight="medium"
                sx={{ "&:hover": { opacity: 0.8 } }}
              >
                Volver a Iniciar Sesión
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default ForgotPasswordCover;
