/* eslint-disable */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Pagination from "@mui/material/Pagination";
import MenuItem from "@mui/material/MenuItem";
// --- IMPORTS (UNCHANGED) ---
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDProgress from "components/MDProgress";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Custom components (from your project)
import MDAlert from "components/MDAlert";

// Contexts
import { useProducts } from "contexts/ProductContext";
import { useAuth } from "contexts/AuthContext";

function Products() {
  const navigate = useNavigate();
  const {
    products,
    loading,
    error,
    deleteProduct,
    searchTerm,
    setSearchTerm,
    page,
    pages,
    total,
    limit,
    setPage,
    setLimit,
    getProducts,
  } = useProducts();
  const { user } = useAuth();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState(null);

  const canManageProducts = user?.role === "Administrador" || user?.role === "Editor";
  const canViewAllProducts =
    user?.role === "Administrador" || user?.role === "Editor" || user?.role === "Revendedor";

  // --- MODIFICATION: ADD USEEFFECT FOR DATA FETCHING ---
  useEffect(() => {
    // This effect runs on initial mount and whenever page or limit changes.
    // On mount, searchTerm is "", so it fetches all products for the first page.
    // When paginating, it re-fetches with the correct page number,
    // still respecting any active searchTerm.
    getProducts(searchTerm);
  }, [page, limit]); // It runs when page or limit changes.

  // --- MODIFIED AND NEW HANDLERS ---
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    setPage(1);
    getProducts(searchTerm);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // --- EXISTING HANDLERS (UNCHANGED) ---
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleDeleteProduct = (id) => {
    setProductIdToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setProductIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    setOpenDeleteDialog(false);
    if (productIdToDelete) {
      try {
        if (user?.role !== "Administrador") {
          toast.error("No tienes permiso para eliminar productos.");
          return;
        }
        await deleteProduct(productIdToDelete);
        toast.success("Producto eliminado exitosamente.");
      } catch (err) {
        toast.error(err.message || "Error al eliminar el producto.");
      } finally {
        setProductIdToDelete(null);
      }
    }
  };

  // The rest of your component remains exactly the same...
  const columns = [
    {
      Header: "Producto",
      accessor: "productInfo",
      width: "30%",
      Cell: ({ row }) => (
        <MDBox display="flex" alignItems="center">
          <MDBox
            component="img"
            src={
              row.original.imageUrls && row.original.imageUrls.length > 0
                ? row.original.imageUrls[0].secure_url
                : "https://placehold.co/40x40/cccccc/000000?text=No+Image"
            }
            alt={row.original.name}
            width="40px"
            height="40px"
            borderRadius="md"
            mr={2}
            sx={{ objectFit: "cover" }}
          />
          <MDBox>
            <MDTypography
              component={Link}
              to={`/products/details/${row.original._id}`}
              variant="button"
              fontWeight="medium"
              color="info"
              sx={{ "&:hover": { textDecoration: "underline" } }}
            >
              {row.original.name}
            </MDTypography>
            <MDTypography variant="caption" display="block" color="text">
              Cód: {row.original.code}
            </MDTypography>
          </MDBox>
        </MDBox>
      ),
    },
    { Header: "Departmento", accessor: "department" },
    { Header: "Marca", accessor: "brand" },
    { Header: "Categoría", accessor: "category" },
    { Header: "Subcategoría", accessor: "subcategory" },
    {
      Header: "Precio (Cat1)",
      accessor: "resellerPrices.cat1",
      Cell: ({ cell: { value } }) =>
        value ? value.toLocaleString("es-CR", { style: "currency", currency: "CRC" }) : "N/A",
    },
    {
      Header: "Stock",
      accessor: "countInStock",
      Cell: ({ value }) => (
        <MDBox>
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {value} unidades
          </MDTypography>
          <MDProgress
            variant="gradient"
            value={(value / 100) * 100}
            color={value > 20 ? "success" : value > 5 ? "warning" : "error"}
          />
        </MDBox>
      ),
    },
    {
      Header: "Estado",
      accessor: "active",
      Cell: ({ value }) => (
        <MDTypography variant="caption" color={value ? "success" : "error"} fontWeight="medium">
          {value ? "Activo" : "Inactivo"}
        </MDTypography>
      ),
    },
    {
      Header: "Acciones",
      accessor: "actions",
      Cell: ({ row }) => (
        <MDBox display="flex">
          {canManageProducts && (
            <>
              <MDTypography
                component={Link}
                to={`/products/edit/${row.original._id}`}
                variant="caption"
                color="text"
                fontWeight="medium"
                sx={{ cursor: "pointer", marginRight: 1 }}
              >
                <Icon color="info" sx={{ fontSize: "24px" }}>
                  edit
                </Icon>
              </MDTypography>
              {/* <MDTypography
                component="a"
                href="#"
                onClick={() => handleDeleteProduct(row.original._id)}
                variant="caption"
                color="text"
                fontWeight="medium"
                sx={{ cursor: "pointer" }}
              >
                <Icon color="error" sx={{ fontSize: "24px" }}>
                  delete
                </Icon>
              </MDTypography> */}
            </>
          )}
        </MDBox>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="info" />
          <MDTypography variant="h5" ml={2}>
            Cargando productos...
          </MDTypography>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDAlert color="error" dismissible>
            <MDTypography variant="body2" color="white">
              {error.message || "Error al cargar los productos."}
            </MDTypography>
          </MDAlert>
          <MDButton
            onClick={() => navigate("/dashboard")}
            variant="gradient"
            color="info"
            sx={{ mt: 2 }}
          >
            Volver al Dashboard
          </MDButton>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (!canViewAllProducts) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDAlert color="error" dismissible>
            <MDTypography variant="body2" color="white">
              No tienes permiso para ver esta página.
            </MDTypography>
          </MDAlert>
          <MDButton
            onClick={() => navigate("/dashboard")}
            variant="gradient"
            color="info"
            sx={{ mt: 2 }}
          >
            Volver al Dashboard
          </MDButton>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

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
                  Gestión de Productos
                </MDTypography>
                {/* {canManageProducts && (
                  <MDButton
                    component={Link}
                    to="/products/create"
                    variant="gradient"
                    sx={{
                      backgroundColor: "#333",
                      color: "#FFFFFF",
                      "&:hover": {
                        backgroundColor: "#333",
                      },
                    }}
                  >
                    <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                    &nbsp;añadir producto
                  </MDButton>
                )} */}
              </MDBox>
              <MDBox p={3}>
                <MDBox mb={3}>
                  {/* --- CORRECTED TEXTFIELD --- */}
                  <TextField
                    label="Buscar por nombre, código o marca"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyPress={handleKeyPress}
                    InputProps={{
                      placeholder: "Ej: Perfume Eros, Cód: PERF001, Marca: Versace",
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleSearch} edge="end">
                            <Icon>search</Icon>
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </MDBox>

                <DataTable
                  table={{ columns, rows: products }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={true}
                  noEndBorder
                />

                {pages > 1 && (
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                    <MDTypography variant="button" color="text">
                      Página {page} de {pages} (Total: {total} productos)
                    </MDTypography>
                    <Pagination
                      count={pages}
                      page={page}
                      onChange={handlePageChange}
                      color="info"
                      size="large"
                      siblingCount={1}
                      boundaryCount={1}
                    />
                    <TextField
                      select
                      label="Productos por página"
                      value={limit}
                      onChange={handleLimitChange}
                      variant="outlined"
                      size="small"
                      sx={{ width: "150px" }}
                    >
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={20}>20</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                    </TextField>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: (theme) => ({
            backgroundColor:
              theme.palette.mode === "dark" ? "#1A2027" : theme.palette.background.paper,
            color: theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary,
          }),
        }}
      >
        <DialogTitle id="delete-dialog-title">
          <MDTypography
            variant="h6"
            color={(theme) =>
              theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary
            }
          >
            {"Confirmar Eliminación"}
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            <MDTypography
              variant="body2"
              color={(theme) =>
                theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary
              }
            >
              ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
            </MDTypography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton
            onClick={handleCloseDeleteDialog}
            color="dark"
            variant="text"
            disabled={loading}
          >
            Cancelar
          </MDButton>
          <MDButton
            onClick={handleConfirmDelete}
            color="error"
            variant="gradient"
            autoFocus
            disabled={loading}
          >
            Eliminar
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Products;
