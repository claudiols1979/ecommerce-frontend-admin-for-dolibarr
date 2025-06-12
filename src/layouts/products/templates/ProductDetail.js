// frontend/src/layouts/products/templates/ProductDetail.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress"; // For loading spinner
import Box from "@mui/material/Box"; // Generic Box for layout
import Icon from "@mui/material/Icon"; // For carousel navigation icons
// Removed Dialog related imports:
// import Dialog from "@mui/material/Dialog";
// import DialogActions from "@mui/material/DialogActions";
// import DialogContent from "@mui/material/DialogContent";
// import DialogContentText from "@mui/material/DialogContentText";
// import DialogTitle from "@mui/material/DialogTitle";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Contexts
import { useProducts } from "contexts/ProductContext";
import { useAuth } from "contexts/AuthContext"; // To determine user role for permissions

function ProductDetail() {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();
  // Removed deleteProduct from useProducts destructuring:
  const { getProductById, loading, error } = useProducts();
  const { user } = useAuth(); // Get authenticated user details

  const [product, setProduct] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // State for carousel image index
  // Removed openDeleteDialog state:
  // const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setInitialLoading(true);
        setFetchError(null);
        if (typeof getProductById !== "function") {
          console.error(
            "getProductById is not a function in ProductContext. Cannot fetch product details."
          );
          setFetchError("Error interno: la función de carga de detalles no está disponible.");
          toast.error("Error al cargar detalles del producto: función no disponible.");
          setInitialLoading(false);
          return;
        }

        const fetchedProduct = await getProductById(id);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          setCurrentImageIndex(0); // Reset to first image when a new product is loaded
        } else {
          setFetchError("Detalles del producto no encontrados.");
          toast.error("Detalles del producto no encontrados.");
        }
      } catch (err) {
        setFetchError(err.message || "Error al cargar los detalles del producto.");
        toast.error(err.message || "Error al cargar los detalles del producto.");
        console.error("Error fetching product details:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, getProductById]);

  // Carousel navigation handlers
  const handleNextImage = () => {
    if (product && product.imageUrls && product.imageUrls.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.imageUrls.length);
    }
  };

  const handlePrevImage = () => {
    if (product && product.imageUrls && product.imageUrls.length > 0) {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex - 1 + product.imageUrls.length) % product.imageUrls.length
      );
    }
  };

  // Removed delete confirmation dialog handlers:
  // const handleDeleteClick = () => {
  //   setOpenDeleteDialog(true);
  // };

  // const handleCloseDeleteDialog = () => {
  //   setOpenDeleteDialog(false);
  // };

  // const handleConfirmDelete = async () => {
  //   setOpenDeleteDialog(false);
  //   try {
  //     if (typeof deleteProduct !== 'function') {
  //       toast.error("Error interno: la función de eliminación de producto no está disponible.");
  //       return;
  //     }
  //     await deleteProduct(id);
  //     toast.success("Producto eliminado exitosamente!");
  //     navigate("/products"); // Redirect after successful deletion
  //   } catch (err) {
  //     toast.error(error?.message || "Error al eliminar el producto.");
  //     console.error("Error deleting product:", err);
  //   }
  // };

  // Loading and Error States
  if (initialLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          pt={6}
          pb={3}
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress color="info" />
          <MDTypography variant="h5" ml={2}>
            Cargando detalles del producto...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (fetchError || !product) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          pt={6}
          pb={3}
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <MDTypography variant="h5" color="error">
            Error: {fetchError || "Producto no encontrado."}
          </MDTypography>
          <MDButton
            onClick={() => navigate("/products")}
            variant="gradient"
            color="info"
            sx={{ ml: 2 }}
          >
            Volver a Productos
          </MDButton>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Determine the reseller category for the current user to display correct prices
  const userResellerCategory =
    user?.role === "Administrador" || user?.role === "Editor"
      ? "cat1" // Admins/Editors see cat1 prices
      : user?.resellerCategory; // Resellers see their assigned category prices

  const displayPrice =
    product.resellerPrices?.[userResellerCategory] || product.resellerPrices?.cat1;
  const formattedPrice =
    displayPrice?.toLocaleString("es-CR", { style: "currency", currency: "CRC" }) || "N/A";

  // const isAdmin = user?.role === "Administrador"; // No longer needed as delete button is removed

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={10}>
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
                  {product.name}
                </MDTypography>
                <MDBox display="flex" alignItems="center">
                  {/* Removed delete button: */}
                  {/* {isAdmin && (
                    <MDButton
                      variant="gradient"
                      color="error"
                      onClick={handleDeleteClick}
                      sx={{ mr: 2 }}
                      disabled={loading}
                    >
                      Eliminar Producto
                    </MDButton>
                  )} */}
                  <MDButton onClick={() => navigate("/products")} variant="gradient" color="dark">
                    Volver a Productos
                  </MDButton>
                </MDBox>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={3}>
                  {/* Product Images Carousel */}
                  <Grid item xs={12} md={5}>
                    {/* <MDTypography variant="h6" mb={1}>
                      Imágenes:
                    </MDTypography> */}
                    <MDBox
                      position="relative"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minHeight: "250px", // Min height for consistency
                        justifyContent: "center",
                        borderRadius: "lg",
                        overflow: "hidden",
                        boxShadow: 3,
                        p: 2, // Padding around the image
                      }}
                    >
                      {product.imageUrls && product.imageUrls.length > 0 ? (
                        <>
                          {/* Main Image Display */}
                          <MDBox
                            component="img"
                            src={product.imageUrls[currentImageIndex]?.secure_url}
                            alt={`Product ${product.name} image ${currentImageIndex + 1}`}
                            sx={{
                              width: "100%",
                              maxWidth: "400px", // Max width for image within carousel
                              height: "auto",
                              maxHeight: "350px", // Max height for image
                              objectFit: "contain",
                              borderRadius: "md",
                            }}
                          />

                          {/* Navigation Buttons (Only if more than one image) */}
                          {product.imageUrls.length > 1 && (
                            <>
                              <MDButton
                                variant="contained"
                                color="info"
                                onClick={handlePrevImage}
                                sx={{
                                  position: "absolute",
                                  left: 10,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  minWidth: "unset", // Allow smaller button size
                                  padding: "8px 10px",
                                  borderRadius: "50%",
                                  zIndex: 1,
                                }}
                              >
                                <Icon>arrow_back_ios</Icon>
                              </MDButton>
                              <MDButton
                                variant="contained"
                                color="info"
                                onClick={handleNextImage}
                                sx={{
                                  position: "absolute",
                                  right: 10,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  minWidth: "unset",
                                  padding: "8px 10px",
                                  borderRadius: "50%",
                                  zIndex: 1,
                                }}
                              >
                                <Icon>arrow_forward_ios</Icon>
                              </MDButton>
                            </>
                          )}

                          {/* Dots Indicator (Only if more than one image) */}
                          {product.imageUrls.length > 1 && (
                            <MDBox
                              display="flex"
                              justifyContent="center"
                              mt={2}
                              sx={{
                                position: "absolute",
                                bottom: 10,
                                left: "50%",
                                transform: "translateX(-50%)",
                                zIndex: 1,
                              }}
                            >
                              {product.imageUrls.map((_, index) => (
                                <MDBox
                                  key={index}
                                  sx={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    bgColor: index === currentImageIndex ? "info.main" : "grey.400",
                                    mx: 0.5,
                                    cursor: "pointer",
                                    transition: "background-color 0.3s ease",
                                  }}
                                  onClick={() => setCurrentImageIndex(index)}
                                />
                              ))}
                            </MDBox>
                          )}
                        </>
                      ) : (
                        <MDTypography variant="body2" color="text">
                          No hay imágenes disponibles.
                        </MDTypography>
                      )}
                    </MDBox>
                  </Grid>

                  {/* Product Details */}
                  <Grid item xs={12} md={7}>
                    <MDTypography variant="h6" mb={1}>
                      Información General:
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        {" "}
                        {/* Changed variant to "button" */}
                        Nombre:
                      </MDTypography>{" "}
                      {product.name}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        {" "}
                        {/* Changed variant to "button" */}
                        Código:
                      </MDTypography>{" "}
                      {product.code}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        {" "}
                        {/* Changed variant to "button" */}
                        Marca:
                      </MDTypography>{" "}
                      {product.brand}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        {" "}
                        {/* Changed variant to "button" */}
                        Categoría:
                      </MDTypography>{" "}
                      {product.category}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        {" "}
                        {/* Changed variant to "button" */}
                        Volumen:
                      </MDTypography>{" "}
                      {product.volume}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        {" "}
                        {/* Changed variant to "button" */}
                        Género:
                      </MDTypography>{" "}
                      {product.gender}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        {" "}
                        {/* Changed variant to "button" */}
                        En Inventario:
                      </MDTypography>{" "}
                      {product.countInStock}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        {" "}
                        {/* Changed variant to "button" */}
                        Estado:
                      </MDTypography>{" "}
                      {product.active ? "Activo" : "Inactivo"}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        {" "}
                        {/* Changed variant to "button" */}
                        Precio ({userResellerCategory.toUpperCase()}):
                      </MDTypography>{" "}
                      {formattedPrice}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mt={1} mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        {" "}
                        {/* Changed variant to "button" */}
                        Etiquetas:
                      </MDTypography>{" "}
                      {product.tags && product.tags.length > 0 ? product.tags.join(", ") : "N/A"}
                    </MDTypography>

                    <MDTypography variant="h6" mt={2} mb={1}>
                      Descripción:
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      {product.description}
                    </MDTypography>

                    <MDTypography variant="h6" mt={2} mb={1}>
                      Precios de Revendedor:
                    </MDTypography>
                    {Object.keys(product.resellerPrices).map((cat) => (
                      <MDTypography variant="body2" color="text" key={cat} mb={0.5}>
                        <MDTypography component="span" variant="button" fontWeight="bold">
                          {" "}
                          {/* Changed variant to "button" */}
                          {cat.toUpperCase()}:
                        </MDTypography>{" "}
                        {product.resellerPrices[cat]?.toLocaleString("es-CR", {
                          style: "currency",
                          currency: "CRC",
                        }) || "N/A"}
                      </MDTypography>
                    ))}

                    <MDTypography variant="body2" color="text" mt={2} mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        {" "}
                        {/* Changed variant to "button" */}
                        Creado el:
                      </MDTypography>{" "}
                      {new Date(product.createdAt).toLocaleDateString("es-CR")}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        {" "}
                        {/* Changed variant to "button" */}
                        Última Actualización:
                      </MDTypography>{" "}
                      {new Date(product.updatedAt).toLocaleDateString("es-CR")}
                    </MDTypography>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Removed Delete Confirmation Dialog */}
      {/*
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar Eliminación"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que quieres eliminar el producto "{product?.name}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseDeleteDialog} color="dark" variant="text">
            Cancelar
          </MDButton>
          <MDButton onClick={handleConfirmDelete} color="error" variant="gradient" autoFocus>
            Eliminar
          </MDButton>
        </DialogActions>
      </Dialog>
      */}
    </DashboardLayout>
  );
}

export default ProductDetail;
