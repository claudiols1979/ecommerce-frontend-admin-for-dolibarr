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
  Switch,
  FormControlLabel,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import couponsTableData from "./data/couponsTableData";
import axios from "axios";
import API_URL from "../../config";
import { useAuth } from "contexts/AuthContext";
import { toast } from "react-toastify";
import MDConfirmationModal from "components/MDConfirmationModal";

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [couponIdToDelete, setCouponIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: 0,
    isActive: true,
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    usageLimit: "",
    limitPerUser: 1,
    minOrderAmount: 0,
    isFirstPurchaseOnly: false,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = user?.token || storedUser?.token;
      if (!token) {
        console.warn("No token found for fetching coupons");
        setLoading(false);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/api/coupons`, config);
      setCoupons(response.data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenDialog = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        isActive: coupon.isActive,
        startDate: new Date(coupon.startDate).toISOString().split("T")[0],
        expiryDate: new Date(coupon.expiryDate).toISOString().split("T")[0],
        usageLimit: coupon.usageLimit || "",
        limitPerUser: coupon.limitPerUser,
        minOrderAmount: coupon.minOrderAmount,
        isFirstPurchaseOnly: coupon.isFirstPurchaseOnly,
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: "",
        discountPercentage: 0,
        isActive: true,
        startDate: new Date().toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        usageLimit: "",
        limitPerUser: 1,
        minOrderAmount: 0,
        isFirstPurchaseOnly: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCoupon(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = user?.token || JSON.parse(localStorage.getItem("user"))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        ...formData,
        usageLimit: formData.usageLimit === "" ? null : Number(formData.usageLimit),
        discountPercentage: Number(formData.discountPercentage),
        minOrderAmount: Number(formData.minOrderAmount),
        limitPerUser: Number(formData.limitPerUser),
      };

      if (editingCoupon) {
        await axios.put(`${API_URL}/api/coupons/${editingCoupon._id}`, payload, config);
      } else {
        await axios.post(`${API_URL}/api/coupons`, payload, config);
      }

      fetchCoupons();
      handleCloseDialog();
    } catch (error) {
      alert(error.response?.data?.message || "Error al guardar el cupón");
    }
  };

  const handleDelete = (id) => {
    setCouponIdToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCouponIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!couponIdToDelete) return;

    try {
      setIsDeleting(true);
      const token = user?.token || JSON.parse(localStorage.getItem("user"))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/api/coupons/${couponIdToDelete}`, config);
      toast.success("Cupón eliminado exitosamente");
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error(error.response?.data?.message || "Error al eliminar el cupón");
    } finally {
      setIsDeleting(false);
      handleCloseDeleteDialog();
    }
  };

  const { columns, rows } = couponsTableData(coupons, handleOpenDialog, handleDelete);

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
                flexDirection={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={2}
              >
                <MDTypography variant="h6" color="white">
                  Gestión de Cupones
                </MDTypography>
                <MDButton
                  variant="gradient"
                  color="dark"
                  onClick={() => handleOpenDialog()}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                  &nbsp;Nuevo Cupón
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <Box display="flex" justifyContent="center" p={5}>
                    <CircularProgress color="info" />
                  </Box>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={true}
                    entriesPerPage={true}
                    showTotalEntries={true}
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCoupon ? "Editar Cupón" : "Nuevo Cupón"}</DialogTitle>
        <DialogContent>
          <MDBox pt={2} display="flex" flexDirection="column" gap={2}>
            <MDInput
              label="Código"
              name="code"
              value={formData.code}
              onChange={handleChange}
              fullWidth
            />
            <MDInput
              label="Porcentaje de Descuento (%)"
              name="discountPercentage"
              type="number"
              value={formData.discountPercentage}
              onChange={handleChange}
              fullWidth
            />
            <MDInput
              label="Monto Mínimo de Pedido"
              name="minOrderAmount"
              type="number"
              value={formData.minOrderAmount}
              onChange={handleChange}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Fecha Inicio"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Fecha Expiración"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Límite de Uso Global"
                  name="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Dejar vacío para ilimitado"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDInput
                  label="Límite Por Usuario"
                  name="limitPerUser"
                  type="number"
                  value={formData.limitPerUser}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <MDBox display="flex" flexDirection="column">
              <FormControlLabel
                control={
                  <Switch checked={formData.isActive} onChange={handleChange} name="isActive" />
                }
                label="Cupón Activo"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isFirstPurchaseOnly}
                    onChange={handleChange}
                    name="isFirstPurchaseOnly"
                  />
                }
                label="Solo para Primera Compra"
              />
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseDialog} color="secondary">
            Cancelar
          </MDButton>
          <MDButton onClick={handleSubmit} variant="gradient" color="info">
            {editingCoupon ? "Actualizar" : "Crear"}
          </MDButton>
        </DialogActions>
      </Dialog>
      <MDConfirmationModal
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        content="¿Estás seguro de que quieres eliminar este cupón? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={isDeleting}
      />
      <Footer />
    </DashboardLayout>
  );
}

export default Coupons;
