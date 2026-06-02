import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import PropTypes from "prop-types";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Contexts
import { useConfig } from "contexts/ConfigContext";

// Components
import FAQManager from "./components/FAQManager";
import AdminEmailManager from "./components/AdminEmailManager";

function Administration() {
  const { configs, updateConfig, loading, systemEnv, envLoading } = useConfig();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [bannerMessage, setBannerMessage] = useState(configs.PROMOTION_BANNER_MESSAGE || "");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSaveBanner = async () => {
    setIsUpdating(true);
    try {
      await updateConfig("PROMOTION_BANNER_MESSAGE", bannerMessage);
      toast.success("Mensaje del banner actualizado con éxito.");
    } catch (error) {
      toast.error("Error al actualizar el mensaje del banner.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegimeChange = async (event) => {
    const newRegime = event.target.checked ? "simplified" : "traditional";
    setIsUpdating(true);
    try {
      await updateConfig("TAX_REGIME", newRegime);
      toast.success(
        `Régimen cambiado a: ${newRegime === "simplified" ? "Simplificado" : "Tradicional"}`
      );
    } catch (error) {
      toast.error("Error al cambiar el régimen fiscal.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6} justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
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
              >
                <MDTypography variant="h6" color="white">
                  Configuración Administrativa
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{ mb: 3, borderBottom: "1px solid #ddd" }}
                >
                  <Tab label="Fiscal" />
                  <Tab label="Marketing" />
                  <Tab label="FAQ" />
                  <Tab label="Notificaciones" />
                  <Tab label="Sistema" />
                </Tabs>

                {activeTab === 0 ? (
                  <MDBox>
                    <MDTypography variant="h6" mb={2}>
                      Régimen de Tributación
                    </MDTypography>
                    <MDBox display="flex" flexDirection="column">
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                        flexDirection={{ xs: "column", md: "row" }}
                        mb={2}
                        gap={2}
                      >
                        <MDBox sx={{ flex: "1 1 auto", maxWidth: { xs: "100%", md: "70%" } }}>
                          <MDTypography variant="button" fontWeight="bold">
                            Régimen Fiscal Activo
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            {configs.TAX_REGIME === "simplified"
                              ? "Actualmente en Régimen Simplificado (0% IVA, Envío con impuesto incluido)."
                              : "Actualmente en Régimen Tradicional (13% IVA desglosado)."}
                          </MDTypography>
                        </MDBox>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={configs.TAX_REGIME === "simplified"}
                              onChange={handleRegimeChange}
                              disabled={isUpdating || loading}
                              color="info"
                            />
                          }
                          label={
                            <MDTypography variant="button" fontWeight="medium" color="text">
                              {configs.TAX_REGIME === "simplified" ? "Simplificado" : "Tradicional"}
                            </MDTypography>
                          }
                          sx={{ flexShrink: 0 }}
                        />
                      </MDBox>
                      <Divider />
                      <MDBox mt={2}>
                        <MDTypography variant="h6" mb={1} color="warning">
                          ¿Qué cambia con el Régimen Simplificado?
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          1. <strong>IVA 0%:</strong> Todos los productos tendrán un 0% de IVA.
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          2. <strong>Envío Flat:</strong> El costo de envío incluirá el impuesto
                          internamente pero se mostrará como un monto único.
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          3. <strong>Sin Factura Electrónica:</strong> No se enviarán documentos a
                          Hacienda.
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          4. <strong>Ticket Simplificado:</strong> Se generará un comprobante
                          interno para el cliente con la leyenda legal correspondiente.
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                ) : activeTab === 1 ? (
                  <MDBox>
                    <MDTypography variant="h6" mb={2}>
                      Configuración de Marketing
                    </MDTypography>
                    <MDBox mb={2}>
                      <MDTypography variant="button" fontWeight="bold" mb={1} display="block">
                        Mensaje del Banner de Promoción
                      </MDTypography>
                      <MDInput
                        fullWidth
                        multiline
                        rows={2}
                        value={bannerMessage}
                        onChange={(e) => setBannerMessage(e.target.value)}
                        placeholder="Escribe el mensaje que aparecerá en el banner superior..."
                      />
                    </MDBox>
                    <MDBox mt={3} display="flex" justifyContent="flex-end">
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={handleSaveBanner}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          "Guardar Mensaje"
                        )}
                      </MDButton>
                    </MDBox>
                  </MDBox>
                ) : activeTab === 2 ? (
                  <FAQManager />
                ) : activeTab === 3 ? (
                  <AdminEmailManager />
                ) : (
                  <MDBox>
                    <MDTypography variant="h6" mb={2}>
                      Variables de Entorno (Solo Lectura)
                    </MDTypography>
                    {envLoading ? (
                      <MDBox display="flex" justifyContent="center" py={3}>
                        <CircularProgress color="info" />
                      </MDBox>
                    ) : systemEnv ? (
                      <MDBox>
                        <MDBox mb={3}>
                          <MDTypography variant="button" fontWeight="bold" color="info">
                            Configuración del Servidor (Backend)
                          </MDTypography>
                          <MDBox ml={2} mt={1}>
                            <SystemVar label="Entorno" value={systemEnv.backend?.nodeEnv} />
                            <SystemVar label="Puerto" value={systemEnv.backend?.port} />
                            <SystemVar label="MongoDB URI" value={systemEnv.backend?.mongoUri} />
                            <SystemVar label="JWT Secret" value={systemEnv.backend?.jwtSecret} />
                            <SystemVar label="Email User" value={systemEnv.backend?.emailUser} />
                            <SystemVar
                              label="Cloudinary Name"
                              value={systemEnv.backend?.cloudinaryName}
                            />
                            <SystemVar
                              label="Frontend URL"
                              value={systemEnv.backend?.frontendUrl}
                            />
                            <SystemVar
                              label="Frontend Store URL"
                              value={systemEnv.backend?.frontendStoreUrl}
                            />
                          </MDBox>
                        </MDBox>

                        <Divider />

                        <MDBox mb={3} mt={2}>
                          <MDTypography variant="button" fontWeight="bold" color="info">
                            Asistente AI (DeepSeek)
                          </MDTypography>
                          <MDBox ml={2} mt={1}>
                            <SystemVar label="API Key" value={systemEnv.deepseek?.apiKey} />
                            <SystemVar label="API URL" value={systemEnv.deepseek?.apiUrl} />
                            <SystemVar label="Modelo" value={systemEnv.deepseek?.model} />
                            <SystemVar
                              label="Temperatura"
                              value={systemEnv.deepseek?.temperature}
                            />
                            <SystemVar label="Max Tokens" value={systemEnv.deepseek?.maxTokens} />
                            <SystemVar
                              label="Ventana Rate Limit"
                              value={`${systemEnv.deepseek?.rateLimitWindow} ms`}
                            />
                            <SystemVar
                              label="Max Mensajes"
                              value={systemEnv.deepseek?.rateLimitMax}
                            />
                          </MDBox>
                        </MDBox>

                        <Divider />

                        <MDBox mb={3} mt={2}>
                          <MDTypography variant="button" fontWeight="bold" color="info">
                            Tilopay (Pasarela de Pagos)
                          </MDTypography>
                          <MDBox ml={2} mt={1}>
                            <SystemVar label="Usuario API" value={systemEnv.tilopay.user} />
                            <SystemVar label="Password API" value={systemEnv.tilopay.password} />
                            <SystemVar label="Key API" value={systemEnv.tilopay.key} />
                            <SystemVar label="URL API" value={systemEnv.tilopay.url} />
                            <SystemVar label="URL Redirección" value={systemEnv.tilopay.redirect} />
                          </MDBox>
                        </MDBox>

                        <Divider />

                        <MDBox mb={3} mt={2}>
                          <MDTypography variant="button" fontWeight="bold" color="info">
                            Su Factura Fácil (Facturación Electrónica)
                          </MDTypography>
                          <MDBox ml={2} mt={1}>
                            <SystemVar label="API URL" value={systemEnv.sff.apiUrl} />
                            <SystemVar label="Key Cliente" value={systemEnv.sff.keyCliente} />
                            <SystemVar label="Key Emisor" value={systemEnv.sff.keyEmisor} />
                          </MDBox>
                        </MDBox>

                        <Divider />

                        <MDBox mb={3} mt={2}>
                          <MDTypography variant="button" fontWeight="bold" color="info">
                            Datos del Emisor (Hacienda)
                          </MDTypography>
                          <MDBox ml={2} mt={1}>
                            <SystemVar label="Nombre/Razón Social" value={systemEnv.company.name} />
                            <SystemVar label="Cédula" value={systemEnv.company.cedula} />
                            <SystemVar
                              label="Código Actividad"
                              value={systemEnv.company.codigoActividad}
                            />
                            <SystemVar label="Dirección" value={systemEnv.company.address} />
                            <SystemVar label="Teléfono" value={systemEnv.company.phone} />
                            <SystemVar label="Email" value={systemEnv.company.email} />
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    ) : (
                      <MDTypography variant="button" color="text">
                        No se pudo cargar la información del sistema.
                      </MDTypography>
                    )}
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

const SystemVar = ({ label, value }) => (
  <MDBox
    display="flex"
    justifyContent="space-between"
    mb={0.5}
    sx={{
      flexWrap: "wrap",
      gap: 0.5,
      wordBreak: "break-word",
    }}
  >
    <MDTypography variant="caption" fontWeight="bold" color="text" sx={{ minWidth: "120px" }}>
      {label}:
    </MDTypography>
    <MDTypography
      variant="caption"
      fontWeight="medium"
      sx={{
        wordBreak: "break-all",
        maxWidth: { xs: "180px", sm: "100%" },
      }}
    >
      {value || "No configurado"}
    </MDTypography>
  </MDBox>
);

SystemVar.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

export default Administration;
