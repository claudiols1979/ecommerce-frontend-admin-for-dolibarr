import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDConfirmationModal from "components/MDConfirmationModal";

import { useAuth } from "contexts/AuthContext";
import API_URL from "../../../config";

function AdminEmailManager() {
  const { user } = useAuth();
  const token = user?.token;

  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState(null);

  // Form State
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmails(res.data);
    } catch (error) {
      console.error("Error fetching admin emails:", error);
      toast.error("Error al cargar los correos de notificación.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchEmails();
  }, [token]);

  const handleTestNotification = async () => {
    if (emails.filter((e) => e.isActive).length === 0) {
      toast.warning("No hay correos activos para probar.");
      return;
    }

    setIsTesting(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/admin-notifications/test`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
    } catch (error) {
      console.error("Error testing notifications:", error);
      toast.error(error.response?.data?.message || "Error al enviar correo de prueba.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!newEmail) return;

    setIsSubmitting(true);
    try {
      await axios.post(
        `${API_URL}/api/admin-notifications`,
        { email: newEmail, name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Correo agregado con éxito.");
      setNewEmail("");
      setNewName("");
      fetchEmails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al agregar el correo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/admin-notifications/${id}`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmails(emails.map((e) => (e._id === id ? { ...e, isActive: !currentStatus } : e)));
      toast.success("Estado actualizado.");
    } catch (error) {
      toast.error("Error al actualizar el estado.");
    }
  };

  const handleOpenDeleteModal = (id) => {
    setEmailToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setEmailToDelete(null);
  };

  const handleDeleteEmail = async () => {
    if (!emailToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`${API_URL}/api/admin-notifications/${emailToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmails(emails.filter((e) => e._id !== emailToDelete));
      toast.success("Correo eliminado.");
      handleCloseDeleteModal();
    } catch (error) {
      toast.error("Error al eliminar el correo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MDBox>
      <MDTypography variant="h6" mb={2}>
        Gestión de Notificaciones (Email)
      </MDTypography>
      <MDTypography variant="button" color="text" mb={3} display="block">
        Configura los correos que recibirán notificaciones cuando se realice un nuevo pedido.
      </MDTypography>

      <MDBox
        display="flex"
        justifyContent={{ xs: "stretch", sm: "flex-end" }}
        mb={2}
      >
        <MDButton
          variant="outlined"
          color="info"
          size="small"
          fullWidth={false}
          onClick={handleTestNotification}
          disabled={isTesting || loading}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {isTesting ? <CircularProgress size={15} color="inherit" /> : "Probar Notificación"}
        </MDButton>
      </MDBox>

      <Card sx={{ p: 2, mb: 4, bgcolor: "#f8f9fa" }}>
        <MDBox component="form" onSubmit={handleAddEmail}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <MDInput
                label="Correo Electrónico"
                fullWidth
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <MDInput
                label="Nombre (Opcional)"
                fullWidth
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Agregar"}
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>
      </Card>

      {loading ? (
        <MDBox display="flex" justifyContent="center" py={3}>
          <CircularProgress color="info" />
        </MDBox>
      ) : emails.length === 0 ? (
        <MDTypography variant="button" color="text" textAlign="center" display="block">
          No hay correos configurados. Se usará el correo por defecto del sistema.
        </MDTypography>
      ) : (
        <MDBox>
          {emails.map((email) => (
            <Card key={email._id} sx={{ mb: 1, p: 2 }}>
              <MDBox
                display="flex"
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                flexDirection={{ xs: "column", sm: "row" }}
                gap={1}
              >
                <MDBox sx={{ wordBreak: "break-all", maxWidth: { xs: "100%", sm: "60%" } }}>
                  <MDTypography variant="button" fontWeight="bold">
                    {email.email}
                  </MDTypography>
                  {email.name && (
                    <MDTypography variant="caption" color="text" display="block">
                      🏷️ {email.name}
                    </MDTypography>
                  )}
                </MDBox>
                <MDBox display="flex" alignItems="center" sx={{ flexShrink: 0 }}>
                  <Switch
                    checked={email.isActive}
                    onChange={() => handleToggleStatus(email._id, email.isActive)}
                    color="info"
                  />
                  <IconButton color="error" onClick={() => handleOpenDeleteModal(email._id)}>
                    <Icon>delete</Icon>
                  </IconButton>
                </MDBox>
              </MDBox>
            </Card>
          ))}
        </MDBox>
      )}

      <MDConfirmationModal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteEmail}
        loading={isDeleting}
        title="Eliminar Correo"
        content="¿Estás seguro de que deseas eliminar este correo de la lista de notificaciones? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </MDBox>
  );
}

export default AdminEmailManager;
