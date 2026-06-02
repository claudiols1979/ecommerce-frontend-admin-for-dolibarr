import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  Icon,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import claimsTableData from "./data/claimsTableData";
import { useAuth } from "contexts/AuthContext";
import axios from "axios";
import API_URL from "../../config";
import { useMaterialUIController } from "context";

function Claims() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchClaims = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/api/claims`, config);
      setClaims(response.data);
    } catch (error) {
      console.error("Error fetching claims:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleViewClaim = async (claim) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/api/claims/${claim._id}`, config);
      setSelectedClaim(response.data);
    } catch (error) {
      console.error("Error fetching claim detail:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        `${API_URL}/api/claims/${selectedClaim._id}/messages`,
        { content: newMessage },
        config
      );
      setSelectedClaim(response.data);
      setNewMessage("");
      fetchClaims();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleChangeStatus = async (status) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = storedUser?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(
        `${API_URL}/api/claims/${selectedClaim._id}/status`,
        { status },
        config
      );
      setSelectedClaim(response.data);
      fetchClaims();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const { columns, rows } = claimsTableData(claims, handleViewClaim);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
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
                  Gestión de Reclamos
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <Box display="flex" justifyContent="center" p={5}>
                    <CircularProgress color="info" />
                  </Box>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Detalle del Reclamo */}
      <Dialog
        open={Boolean(selectedClaim)}
        onClose={() => setSelectedClaim(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <MDBox
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={1}
          >
            <MDTypography variant="h6">Reclamo: {selectedClaim?.subject}</MDTypography>
            <MDBox display="flex" flexWrap="wrap" gap={0.5}>
              <MDButton
                variant="outlined"
                color="info"
                size="small"
                onClick={() => handleChangeStatus("in-progress")}
              >
                En Proceso
              </MDButton>
              <MDButton
                variant="outlined"
                color="success"
                size="small"
                onClick={() => handleChangeStatus("resolved")}
              >
                Resuelto
              </MDButton>
              <MDButton
                variant="outlined"
                color="dark"
                size="small"
                onClick={() => handleChangeStatus("closed")}
              >
                Cerrar
              </MDButton>
            </MDBox>
          </MDBox>
        </DialogTitle>
        <DialogContent dividers>
          <MDBox mb={3}>
            <MDTypography variant="button" fontWeight="bold">
              Información del Cliente:
            </MDTypography>
            <MDTypography variant="body2">
              {selectedClaim?.user?.firstName} {selectedClaim?.user?.lastName} (
              {selectedClaim?.user?.email})
            </MDTypography>
          </MDBox>
          {selectedClaim?.order && (
            <MDBox mb={3}>
              <MDTypography variant="button" fontWeight="bold">
                Orden Relacionada:
              </MDTypography>
              <MDTypography variant="body2">
                ID: {selectedClaim.order._id} | Total: {selectedClaim.order.totalPrice} | Fecha:{" "}
                {new Date(selectedClaim.order.createdAt).toLocaleDateString()}
              </MDTypography>
            </MDBox>
          )}
          <Divider sx={{ my: 2 }} />
          <MDTypography variant="h6" mb={2}>
            Mensajes
          </MDTypography>
          <MDBox
            sx={{
              maxHeight: "300px",
              overflowY: "auto",
              mb: 2,
              p: 2,
              backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            {selectedClaim?.messages?.map((msg, idx) => {
              const isAdmin = msg.sender.role === "Administrador" || msg.sender.role === "Editor";
              return (
                <MDBox
                  key={idx}
                  mb={2}
                  sx={{
                    textAlign: isAdmin ? "right" : "left",
                  }}
                >
                  <MDBox
                    sx={{
                      display: "inline-block",
                      p: 1.5,
                      borderRadius: "12px",
                      backgroundColor: isAdmin
                        ? darkMode
                          ? "rgba(33, 150, 243, 0.2)"
                          : "#e3f2fd"
                        : darkMode
                        ? "rgba(255, 255, 255, 0.1)"
                        : "#fff",
                      border: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      maxWidth: "80%",
                    }}
                  >
                    <MDTypography
                      variant="caption"
                      fontWeight="bold"
                      display="block"
                      color={darkMode ? "white" : "dark"}
                    >
                      {msg.sender.firstName} {msg.sender.lastName}
                    </MDTypography>
                    <MDTypography variant="body2" color={darkMode ? "white" : "dark"}>
                      {msg.content}
                    </MDTypography>
                    <MDTypography
                      variant="caption"
                      color={darkMode ? "text" : "secondary"}
                      sx={{ opacity: 0.8 }}
                    >
                      {new Date(msg.createdAt).toLocaleString()}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              );
            })}
          </MDBox>
          {selectedClaim?.status !== "resolved" && selectedClaim?.status !== "closed" ? (
            <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={1}>
              <MDInput
                fullWidth
                label="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                multiline
                rows={2}
              />
              <MDButton
                variant="gradient"
                color="info"
                onClick={handleSendMessage}
                disabled={sending}
                sx={{ minWidth: { xs: "100%", sm: "auto" } }}
              >
                <Icon>send</Icon>
              </MDButton>
            </MDBox>
          ) : (
            <MDBox textAlign="center" py={2}>
              <MDTypography variant="button" color="text" fontWeight="medium">
                Este reclamo está {selectedClaim.status === "resolved" ? "Resuelto" : "Cerrado"} y
                no acepta más mensajes.
              </MDTypography>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setSelectedClaim(null)} color="secondary">
            Cerrar
          </MDButton>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
}

export default Claims;
