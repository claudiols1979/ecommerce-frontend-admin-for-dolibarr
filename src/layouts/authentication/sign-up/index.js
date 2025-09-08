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

import { useState } from "react";

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import InputLabel from "@mui/material/InputLabel"; // <--- NEW: For select input label
import Select from "@mui/material/Select"; // <--- NEW: For dropdown select
import MenuItem from "@mui/material/MenuItem"; // <--- NEW: For dropdown options
import FormControl from "@mui/material/FormControl"; // <--- NEW: For select wrapping

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

// Import useAuth from your AuthContext
import { useAuth } from "contexts/AuthContext";

function Cover() {
  // --- Form State: Updated for firstName, lastName, and role ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Editor"); // Default to Editor, as per requirement
  const [agreement, setAgreement] = useState(false);
  // --- End Form State ---

  // Get the register function and loading state from your AuthContext
  const { register, loading } = useAuth();

  const handleSetAgreement = () => setAgreement(!agreement);

  // --- Handle Form Submission ---
  const handleRegister = async (event) => {
    event.preventDefault();

    // Basic client-side validation
    if (!firstName || !lastName || !email || !password || !role) {
      alert("Por favor, complete todos los campos requeridos y acepte los términos."); // Spanish message
      return;
    }

    // Call the register function from AuthContext with the new parameters
    const result = await register(firstName, lastName, email, password, role);

    if (result.success) {
      // Clear form fields on successful registration
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("Editor"); // Reset to default
      setAgreement(false);
    }
  };
  // --- End Handle Form Submission ---

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Únete a nosotros hoy
          </MDTypography>{" "}
          {/* Spanish */}
          <MDTypography display="block" variant="button" color="white" my={1}>
            Ingrese su información para registrarse
          </MDTypography>{" "}
          {/* Spanish */}
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleRegister}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Nombre" // Spanish label
                variant="standard"
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required // Mark as required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Apellido" // Spanish label
                variant="standard"
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required // Mark as required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Correo Electrónico" // Spanish label
                variant="standard"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required // Mark as required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Contraseña" // Spanish label
                variant="standard"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required // Mark as required
              />
            </MDBox>
            {/* --- NEW: Role selection dropdown --- */}
            <MDBox mb={2}>
              <FormControl variant="standard" fullWidth>
                <InputLabel id="role-select-label">Rol</InputLabel> {/* Spanish label */}
                <Select
                  labelId="role-select-label"
                  id="role-select"
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="Administrador">Administrador</MenuItem>
                  <MenuItem value="Editor">Editor</MenuItem>
                </Select>
              </FormControl>
            </MDBox>
            {/* --- END NEW: Role selection --- */}

            <MDBox display="flex" alignItems="center" ml={-1}></MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit" disabled={loading}>
                {loading ? "Registrando..." : "Registrarse"} {/* Spanish button text */}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                ¿Ya tienes una cuenta? {/* Spanish */}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Iniciar Sesión
                </MDTypography>{" "}
                {/* Spanish */}
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;
