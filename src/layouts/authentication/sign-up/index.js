/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import { useState } from "react";

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";
import AuthBranding from "components/common/AuthBranding";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

// Import useAuth from your AuthContext
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
    "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active":
      {
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
  "& .MuiSelect-icon": {
    color: "rgba(255, 255, 255, 0.7)",
  },
  "& .MuiSelect-select": {
    color: "#fff !important",
  },
};

function Cover() {
  // --- Form State ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Editor");
  const [agreement, setAgreement] = useState(false);

  // Get the register function and loading state from your AuthContext
  const { register, loading } = useAuth();

  const handleSetAgreement = () => setAgreement(!agreement);

  // --- Handle Form Submission ---
  const handleRegister = async (event) => {
    event.preventDefault();

    if (!firstName || !lastName || !email || !password || !role) {
      alert("Por favor, complete todos los campos requeridos y acepte los términos.");
      return;
    }

    const result = await register(firstName, lastName, email, password, role);

    if (result.success) {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("Editor");
      setAgreement(false);
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card sx={glassCardSx}>
        <MDBox pt={4} pb={0} px={3}>
          <AuthBranding lightMode={true} />
        </MDBox>
        <MDBox
          variant="gradient"
          borderRadius="lg"
          mx={2}
          mt={1}
          p={3}
          mb={1}
          textAlign="center"
          sx={{
            background: "linear-gradient(135deg, #9b2fbe 0%, #c471ed 50%, #e056a0 100%)",
            boxShadow: "0 4px 20px rgba(180, 60, 160, 0.5)",
          }}
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Únete a nosotros hoy
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Ingrese su información para registrarse
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleRegister}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Nombre"
                variant="standard"
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                sx={glassInputSx}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Apellido"
                variant="standard"
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                sx={glassInputSx}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Correo Electrónico"
                variant="standard"
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
                variant="standard"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={glassInputSx}
              />
            </MDBox>
            {/* Role selection dropdown */}
            <MDBox mb={2}>
              <TextField
                select
                variant="standard"
                fullWidth
                id="role-select"
                value={role}
                label="Rol"
                onChange={(e) => setRole(e.target.value)}
                sx={glassInputSx}
              >
                <MenuItem value="Administrador">Administrador</MenuItem>
                <MenuItem value="Editor">Editor</MenuItem>
              </TextField>
            </MDBox>

            <MDBox display="flex" alignItems="center" ml={-1}></MDBox>
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
                {loading ? "Registrando..." : "Registrarse"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" sx={{ color: "rgba(255, 255, 255, 0.7) !important" }}>
                ¿Ya tienes una cuenta?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  fontWeight="medium"
                  sx={{
                    color: "#fff !important",
                    "&:hover": { color: "rgba(255,255,255,0.9) !important" },
                  }}
                >
                  Iniciar Sesión
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;
