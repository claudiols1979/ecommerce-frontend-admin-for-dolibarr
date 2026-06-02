import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Icon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Contexts
import { useAuth } from "contexts/AuthContext";
import API_URL from "config";

function FAQManager() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    order: 0,
    active: true,
  });
  const { user } = useAuth();
  const token = user?.token;

  const fetchFaqs = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/faqs/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFaqs(res.data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast.error("Error al cargar las preguntas frecuentes.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleOpen = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        order: faq.order || 0,
        active: faq.active !== undefined ? faq.active : true,
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: "",
        answer: "",
        order: faqs.length,
        active: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingFaq(null);
  };

  const handleSave = async () => {
    if (!formData.question || !formData.answer) {
      toast.error("Pregunta y respuesta son requeridas.");
      return;
    }

    try {
      if (editingFaq) {
        await axios.put(`${API_URL}/api/faqs/${editingFaq._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Pregunta frecuente actualizada.");
      } else {
        await axios.post(`${API_URL}/api/faqs`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Pregunta frecuente creada.");
      }
      handleClose();
      fetchFaqs();
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast.error("Error al guardar la pregunta frecuente.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar esta pregunta frecuente?")) {
      try {
        await axios.delete(`${API_URL}/api/faqs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Pregunta frecuente eliminada.");
        fetchFaqs();
      } catch (error) {
        console.error("Error deleting FAQ:", error);
        toast.error("Error al eliminar la pregunta frecuente.");
      }
    }
  };

  if (loading && faqs.length === 0) {
    return (
      <MDBox display="flex" justifyContent="center" py={3}>
        <CircularProgress color="info" />
      </MDBox>
    );
  }

  return (
    <MDBox>
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        flexDirection={{ xs: "column", sm: "row" }}
        mb={2}
        gap={1}
      >
        <MDTypography variant="h6">Gestión de FAQ</MDTypography>
        <MDButton variant="gradient" color="info" onClick={() => handleOpen()}>
          <Icon>add</Icon>&nbsp;Nueva Pregunta
        </MDButton>
      </MDBox>

      <TableContainer component={Paper} sx={{ boxShadow: "none", overflowX: "auto" }}>
        <Table sx={{ minWidth: { xs: 500, sm: "auto" } }}>
          <TableHead sx={{ display: "table-header-group" }}>
            <TableRow>
              <TableCell sx={{ color: "inherit" }}>
                <MDTypography variant="caption" color="text" fontWeight="bold">
                  Orden
                </MDTypography>
              </TableCell>
              <TableCell sx={{ color: "inherit" }}>
                <MDTypography variant="caption" color="text" fontWeight="bold">
                  Pregunta
                </MDTypography>
              </TableCell>
              <TableCell sx={{ color: "inherit" }}>
                <MDTypography variant="caption" color="text" fontWeight="bold">
                  Estado
                </MDTypography>
              </TableCell>
              <TableCell align="right" sx={{ color: "inherit" }}>
                <MDTypography variant="caption" color="text" fontWeight="bold">
                  Acciones
                </MDTypography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faqs.map((faq) => (
              <TableRow key={faq._id}>
                <TableCell>
                  <MDTypography variant="caption" color="text" fontWeight="medium">
                    {faq.order}
                  </MDTypography>
                </TableCell>
                <TableCell>
                  <MDTypography variant="caption" color="text" fontWeight="medium">
                    {faq.question}
                  </MDTypography>
                </TableCell>
                <TableCell>
                  <MDTypography
                    variant="caption"
                    color={faq.active ? "success" : "error"}
                    fontWeight="bold"
                  >
                    {faq.active ? "ACTIVA" : "INACTIVA"}
                  </MDTypography>
                </TableCell>
                <TableCell align="right">
                  <IconButton color="info" onClick={() => handleOpen(faq)}>
                    <Icon>edit</Icon>
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(faq._id)}>
                    <Icon>delete</Icon>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {faqs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No hay preguntas frecuentes configuradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingFaq ? "Editar Pregunta" : "Nueva Pregunta"}</DialogTitle>
        <DialogContent>
          <MDBox mt={2}>
            <MDInput
              label="Pregunta"
              fullWidth
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              sx={{ mb: 2 }}
            />
            <MDInput
              label="Respuesta"
              fullWidth
              multiline
              rows={4}
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              sx={{ mb: 2 }}
            />
            <MDInput
              label="Orden visual"
              type="number"
              fullWidth
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              sx={{ mb: 2 }}
            />
            <MDBox
              display="flex"
              alignItems="center"
              mt={1}
              flexWrap="wrap"
              gap={0.5}
            >
              <MDTypography
                variant="button"
                color={!formData.active ? "text" : "secondary"}
                fontWeight={!formData.active ? "bold" : "regular"}
                sx={{ opacity: !formData.active ? 1 : 0.5 }}
              >
                Pregunta inactiva
              </MDTypography>
              <Switch
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                color="info"
              />
              <MDTypography
                variant="button"
                color={formData.active ? "success" : "secondary"}
                fontWeight={formData.active ? "bold" : "regular"}
                sx={{ opacity: formData.active ? 1 : 0.5 }}
              >
                Pregunta activa
              </MDTypography>
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleClose} color="secondary">
            Cancelar
          </MDButton>
          <MDButton onClick={handleSave} variant="gradient" color="info">
            Guardar
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}

export default FAQManager;
