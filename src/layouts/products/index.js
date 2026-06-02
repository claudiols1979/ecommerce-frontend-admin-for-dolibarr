/* eslint-disable */

import React, { useState, useEffect, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import {
  Grid,
  Card,
  CircularProgress,
  Box,
  Pagination,
  MenuItem,
  Icon,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDProgress from "components/MDProgress";
import MDPagination from "components/MDPagination";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Custom components (from your project)
import MDAlert from "components/MDAlert";
import MDConfirmationModal from "components/MDConfirmationModal";

// Contexts
import { useProducts } from "contexts/ProductContext";
import { useAuth } from "contexts/AuthContext";
import { useMaterialUIController } from "context";

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
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const canManageProducts = user?.role === "Administrador" || user?.role === "Editor";
  const canViewAllProducts =
    user?.role === "Administrador" || user?.role === "Editor" || user?.role === "Revendedor";

  // --- MODIFICATION: ADD USEEFFECT FOR DATA FETCHING ---
  useEffect(() => {
    getProducts(searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, fetchTrigger]);

  // --- MODIFIED AND NEW HANDLERS ---
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    if (page !== 1) {
      setPage(1); // This will naturally trigger the useEffect
    } else {
      setFetchTrigger((prev) => prev + 1); // Force fetch on the exact same page 1
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    if (page !== 1) {
      setPage(1);
    } else {
      setFetchTrigger((prev) => prev + 1);
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
                : "/placeholder.png"
            }
            alt={row.original.name}
            width="40px"
            height="40px"
            borderRadius="md"
            mr={2}
            sx={{ objectFit: "cover" }}
            onError={(e) => {
              e.target.src = "/placeholder.png";
            }}
          />
          <MDBox>
            <Tooltip title={row.original.name} placement="top" arrow>
              <MDTypography
                component={Link}
                to={`/products/details/${row.original._id}`}
                variant="button"
                fontWeight="medium"
                color="info"
                sx={{ "&:hover": { textDecoration: "underline" } }}
              >
                {row.original.name?.length > 30
                  ? `${row.original.name.substring(0, 30)}...`
                  : row.original.name}
              </MDTypography>
            </Tooltip>
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
      Header: "Precio (Sin iva)",
      accessor: "resellerPrices.cat1",
      Cell: ({ cell: { value } }) =>
        value ? value.toLocaleString("es-CR", { style: "currency", currency: "CRC" }) : "N/A",
    },
    {
      Header: "Stock",
      accessor: "countInStock",
      Cell: ({ value }) => (
        <MDBox width="8rem">
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {value} unidades
          </MDTypography>
          <MDProgress
            variant="gradient"
            value={value >= 100 ? 100 : value}
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
              {row.original.code?.includes("_") && (
                <MDTypography
                  component={Link}
                  to={`/products/create-batch`}
                  state={{ templateProduct: row.original }}
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                  title="Añadir variante a este modelo"
                  sx={{ cursor: "pointer", marginRight: 1 }}
                >
                  <Icon color="success" sx={{ fontSize: "24px" }}>
                    library_add
                  </Icon>
                </MDTypography>
              )}
              <MDTypography
                component={Link}
                to={`/products/edit/${row.original._id}`}
                variant="caption"
                color="text"
                fontWeight="medium"
                title="Editar este producto"
                sx={{ cursor: "pointer", marginRight: 1 }}
              >
                <Icon color="info" sx={{ fontSize: "24px" }}>
                  edit
                </Icon>
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteProduct(row.original._id);
                }}
                variant="caption"
                color="text"
                fontWeight="medium"
                title="Eliminar producto"
                sx={{ cursor: "pointer" }}
              >
                <Icon color="error" sx={{ fontSize: "24px" }}>
                  delete
                </Icon>
              </MDTypography>
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
                flexDirection={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={2}
              >
                <MDTypography variant="h6" color="white">
                  Gestión de Productos
                </MDTypography>
                {canManageProducts && (
                  <MDBox
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={1}
                    width={{ xs: "100%", sm: "auto" }}
                  >
                    <MDButton
                      component={Link}
                      to="/products/create-batch"
                      variant="outlined"
                      fullWidth
                      sx={{
                        color: "#fff !important",
                        borderColor: "rgba(255,255,255,0.7) !important",
                        width: { sm: "auto" },
                        "&:hover": {
                          borderColor: "#fff !important",
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                        },
                      }}
                    >
                      <Icon sx={{ fontWeight: "bold" }}>layers</Icon>
                      &nbsp;Producto Múltiple
                    </MDButton>
                    <MDButton
                      component={Link}
                      to="/products/create"
                      variant="gradient"
                      fullWidth
                      sx={{
                        backgroundColor: "#333",
                        color: "#FFFFFF",
                        width: { sm: "auto" },
                        "&:hover": {
                          backgroundColor: "#333",
                        },
                      }}
                    >
                      <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                      &nbsp;Producto Simple
                    </MDButton>
                  </MDBox>
                )}
              </MDBox>
              <MDBox p={3}>
                <MDBox mb={3}>
                  {/* --- CORRECTED MDINPUT --- */}
                  <MDInput
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
                          {searchTerm && (
                            <IconButton onClick={handleClearSearch} size="small" sx={{ mr: 1 }}>
                              <CloseIcon
                                sx={{ color: darkMode ? "#ffffff !important" : "inherit" }}
                              />
                            </IconButton>
                          )}
                          <IconButton onClick={handleSearch} edge="end">
                            <SearchIcon
                              sx={{ color: darkMode ? "#ffffff !important" : "inherit" }}
                            />
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

                <MDBox display="flex" justifyContent="center" alignItems="center" p={3}>
                  {pages > 1 && (
                    <MDPagination variant="gradient" color="info">
                      <MDPagination
                        item
                        onClick={(e) => handlePageChange(e, page - 1)}
                        disabled={page === 1}
                      >
                        <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
                      </MDPagination>
                      {[...Array(pages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === pages ||
                          (pageNumber >= page - 2 && pageNumber <= page + 2)
                        ) {
                          return (
                            <MDPagination
                              item
                              key={pageNumber}
                              active={pageNumber === page}
                              onClick={(e) => handlePageChange(e, pageNumber)}
                            >
                              {pageNumber}
                            </MDPagination>
                          );
                        } else if (pageNumber === page - 3 || pageNumber === page + 3) {
                          return (
                            <MDTypography
                              key={pageNumber}
                              variant="button"
                              color="secondary"
                              px={1}
                            >
                              ...
                            </MDTypography>
                          );
                        }
                        return null;
                      })}
                      <MDPagination
                        item
                        onClick={(e) => handlePageChange(e, page + 1)}
                        disabled={page === pages}
                      >
                        <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
                      </MDPagination>
                    </MDPagination>
                  )}
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" alignItems="left" p={2}>
                  <MDTypography variant="caption" color="text">
                    {`Mostrando ${products.length} de ${total} productos`}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <MDConfirmationModal
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        content="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        loading={loading}
      />
    </DashboardLayout>
  );
}

export default Products;
