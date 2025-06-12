// frontend/src/layouts/products/index.js

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Corrected import statement
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField"; // Import TextField for search input
import Dialog from "@mui/material/Dialog"; // NEW: For confirmation dialog
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

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
import MDAlert from "components/MDAlert"; // Assuming you have an MDAlert component for showing error messages

// Contexts
import { useProducts } from "contexts/ProductContext";
import { useAuth } from "contexts/AuthContext";

function Products() {
  const navigate = useNavigate();
  // Removed restoreProduct from destructuring as it's no longer used directly in this component's UI
  const { products, loading, error, deleteProduct, updateProductStatus } = useProducts();
  const { user } = useAuth(); // Get user for role-based access

  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [filteredProducts, setFilteredProducts] = useState([]); // State for filtered products
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // NEW: State for opening delete dialog
  const [productIdToDelete, setProductIdToDelete] = useState(null); // NEW: State to store product ID to delete

  // Determine if the current user can create/edit/delete products
  const canManageProducts = user?.role === "Administrador" || user?.role === "Editor";
  const canViewAllProducts =
    user?.role === "Administrador" || user?.role === "Editor" || user?.role === "Revendedor";

  // Effect to filter products whenever `products` or `searchTerm` changes
  useEffect(() => {
    if (products.length > 0) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      const newFilteredProducts = products.filter((product) => {
        // Filter by product name, code, brand, or labels
        const matchesName = product.name?.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesCode = product.code?.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesBrand = product.brand?.toLowerCase().includes(lowerCaseSearchTerm); // ADDED: Filter by brand
        const matchesLabels = product.labels?.some((label) =>
          label.toLowerCase().includes(lowerCaseSearchTerm)
        );

        return matchesName || matchesCode || matchesBrand || matchesLabels; // UPDATED: Include matchesBrand
      });
      setFilteredProducts(newFilteredProducts);
    } else {
      setFilteredProducts([]); // If no products, clear filtered list
    }
  }, [products, searchTerm]);

  // Modified handleDeleteProduct to open MUI dialog
  const handleDeleteProduct = (id) => {
    setProductIdToDelete(id);
    setOpenDeleteDialog(true);
  };

  // NEW: Handle closing the delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setProductIdToDelete(null); // Clear the ID
  };

  // NEW: Handle confirming the delete action
  const handleConfirmDelete = async () => {
    setOpenDeleteDialog(false); // Close dialog immediately
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
        setProductIdToDelete(null); // Clear the ID after action
      }
    }
  };

  // Removed handleRestoreProduct function as it's no longer needed

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
            {/* Make the product name a Link to the details page */}
            <MDTypography
              component={Link}
              to={`/products/details/${row.original._id}`}
              variant="button"
              fontWeight="medium"
              color="info" // Added color for link appearance
              sx={{ "&:hover": { textDecoration: "underline" } }} // Underline on hover
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
    { Header: "Categoría", accessor: "category" },
    { Header: "Marca", accessor: "brand" },
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
              {/* Edit Icon */}
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
              {/* Delete Icon - Always visible if canManageProducts is true */}
              <MDTypography
                component="a" // Use anchor tag for onClick
                href="#" // Prevent default navigation
                onClick={() => handleDeleteProduct(row.original._id)} // Calls the new handleDeleteProduct
                variant="caption"
                color="text"
                fontWeight="medium"
                sx={{ cursor: "pointer" }}
              >
                <Icon color="error" sx={{ fontSize: "24px" }}>
                  delete
                </Icon>
              </MDTypography>
            </>
          )}
          {/* Removed the 'ver' button as functionality moved to product name link */}
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
                {canManageProducts && (
                  <MDButton
                    component={Link}
                    to="/products/create"
                    variant="gradient"
                    bgColor="info" // Changed from "dark" to "info" for better visibility
                  >
                    <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                    &nbsp;añadir producto
                  </MDButton>
                )}
              </MDBox>
              <MDBox p={3}>
                {/* Search Input */}
                <MDBox mb={3}>
                  <TextField
                    label="Buscar por nombre, código o marca"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </MDBox>

                {/* Removed Bulk Actions section */}

                <DataTable
                  table={{ columns, rows: filteredProducts }}
                  isSorted={false}
                  entriesPerPage={true}
                  showTotalEntries={true}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* NEW: Delete Confirmation Dialog */}
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
