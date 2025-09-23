import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";

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
import { useAuth } from "contexts/AuthContext";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, loading } = useProducts();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  console.log("Product: ", product);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setInitialLoading(true);
        setFetchError(null);
        if (typeof getProductById !== "function") {
          throw new Error("La función para obtener el producto no está disponible.");
        }
        const fetchedProduct = await getProductById(id);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          setCurrentImageIndex(0);
        } else {
          setFetchError("Detalles del producto no encontrados.");
          toast.error("Detalles del producto no encontrados.");
        }
      } catch (err) {
        setFetchError(err.message || "Error al cargar los detalles del producto.");
        toast.error(err.message || "Error al cargar los detalles del producto.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, getProductById]);

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

  // Helper function para mostrar valor o N/A
  const displayValue = (value, isArray = false) => {
    if (isArray) {
      return value && value.length > 0 ? value : "N/A";
    }
    return value || "N/A";
  };

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

  const userResellerCategory =
    user?.role === "Administrador" || user?.role === "Editor" ? "cat1" : user?.resellerCategory;
  const displayPrice =
    product.resellerPrices?.[userResellerCategory] || product.resellerPrices?.cat1;
  const formattedPrice =
    displayPrice?.toLocaleString("es-CR", { style: "currency", currency: "CRC" }) || "N/A";

  const stripHtmlWithBreaks = (html) => {
    if (!html) return "";
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]*>/g, "")
      .trim();
  };

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
                  <MDButton onClick={() => navigate("/products")} variant="gradient" color="dark">
                    Volver a Productos
                  </MDButton>
                </MDBox>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={5}>
                    <MDBox
                      position="relative"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minHeight: "250px",
                        justifyContent: "center",
                        borderRadius: "lg",
                        overflow: "hidden",
                        boxShadow: 3,
                        p: 2,
                      }}
                    >
                      {product.imageUrls && product.imageUrls.length > 0 ? (
                        <>
                          <MDBox
                            component="img"
                            src={product.imageUrls[currentImageIndex]?.secure_url}
                            alt={`Product ${product.name} image ${currentImageIndex + 1}`}
                            sx={{
                              width: "100%",
                              maxWidth: "400px",
                              height: "auto",
                              maxHeight: "350px",
                              objectFit: "contain",
                              borderRadius: "md",
                            }}
                          />
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
                                  minWidth: "unset",
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
                                      bgColor:
                                        index === currentImageIndex ? "info.main" : "grey.400",
                                      mx: 0.5,
                                      cursor: "pointer",
                                      transition: "background-color 0.3s ease",
                                    }}
                                    onClick={() => setCurrentImageIndex(index)}
                                  />
                                ))}
                              </MDBox>
                            </>
                          )}
                        </>
                      ) : (
                        <MDTypography variant="body2" color="text">
                          No hay imágenes disponibles.
                        </MDTypography>
                      )}
                    </MDBox>
                  </Grid>

                  <Grid item xs={12} md={7}>
                    <MDTypography variant="h6" mb={1}>
                      Información General:
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Nombre:
                      </MDTypography>{" "}
                      {displayValue(product.name)}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Código:
                      </MDTypography>{" "}
                      {displayValue(product.code)}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Departamento:
                      </MDTypography>{" "}
                      {displayValue(product.department)}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Marca:
                      </MDTypography>{" "}
                      {displayValue(product.brand)}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Categoría:
                      </MDTypography>{" "}
                      {displayValue(product.category)}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Subcategoría:
                      </MDTypography>{" "}
                      {displayValue(product.subcategory)}
                    </MDTypography>
                    {/* <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Volumen:
                      </MDTypography>{" "}
                      {displayValue(product.volume)}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Género:
                      </MDTypography>{" "}
                      {displayValue(product.gender)}
                    </MDTypography> */}
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        En Inventario:
                      </MDTypography>{" "}
                      {product.countInStock || 0}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Estado:
                      </MDTypography>{" "}
                      {product.active ? "Activo" : "Inactivo"}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Precio ({userResellerCategory.toUpperCase()}):
                      </MDTypography>{" "}
                      {formattedPrice}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mt={1} mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Etiquetas:
                      </MDTypography>{" "}
                      {product.tags && product.tags.length > 0 ? product.tags.join(", ") : "N/A"}
                    </MDTypography>

                    {/* Etiquetas Promocionales */}
                    {product.promotionalLabels && product.promotionalLabels.length > 0 && (
                      <MDBox mt={2}>
                        <MDTypography variant="h6" mb={1}>
                          Etiquetas Promocionales:
                        </MDTypography>
                        <MDBox display="flex" flexWrap="wrap" gap={1}>
                          {product.promotionalLabels.map((label) => (
                            <Chip
                              key={label._id}
                              label={label.name}
                              color="info"
                              variant="filled"
                            />
                          ))}
                        </MDBox>
                      </MDBox>
                    )}

                    <MDTypography variant="h6" mt={3} mb={1}>
                      Descripción:
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={2}>
                      {stripHtmlWithBreaks(product.description) || "No description available."}
                    </MDTypography>

                    <Divider sx={{ my: 2 }} />

                    {/* NUEVOS ATRIBUTOS FLEXIBLES */}
                    <MDTypography variant="h6" mb={2} color="primary">
                      Atributos Flexibles
                    </MDTypography>

                    {/* Colores */}
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Volumen:
                      </MDTypography>{" "}
                      {displayValue(product.volume)}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Género:
                      </MDTypography>{" "}
                      {displayValue(product.gender)}
                    </MDTypography>
                    <MDBox mb={2}>
                      <MDTypography variant="button" fontWeight="bold" mb={1}>
                        Colores:
                      </MDTypography>
                      {product.colors && product.colors.length > 0 ? (
                        <MDBox display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                          {product.colors.map((color, index) => (
                            <Chip
                              key={index}
                              label={color}
                              color="primary"
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </MDBox>
                      ) : (
                        <MDTypography variant="body2" color="text">
                          N/A
                        </MDTypography>
                      )}
                    </MDBox>

                    {/* Tamaños */}
                    <MDBox mb={2}>
                      <MDTypography variant="button" fontWeight="bold" mb={1}>
                        Tamaños:
                      </MDTypography>
                      {product.sizes && product.sizes.length > 0 ? (
                        <MDBox display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                          {product.sizes.map((size, index) => (
                            <Chip
                              key={index}
                              label={size}
                              color="secondary"
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </MDBox>
                      ) : (
                        <MDTypography variant="body2" color="text">
                          N/A
                        </MDTypography>
                      )}
                    </MDBox>

                    {/* Materiales */}
                    <MDBox mb={2}>
                      <MDTypography variant="button" fontWeight="bold" mb={1}>
                        Materiales:
                      </MDTypography>
                      {product.materials && product.materials.length > 0 ? (
                        <MDBox display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                          {product.materials.map((material, index) => (
                            <Chip
                              key={index}
                              label={material}
                              color="success"
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </MDBox>
                      ) : (
                        <MDTypography variant="body2" color="text">
                          N/A
                        </MDTypography>
                      )}
                    </MDBox>

                    {/* Características */}
                    <MDBox mb={2}>
                      <MDTypography variant="button" fontWeight="bold" mb={1}>
                        Características Especiales:
                      </MDTypography>
                      {product.features && product.features.length > 0 ? (
                        <MDBox display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                          {product.features.map((feature, index) => (
                            <Chip
                              key={index}
                              label={feature}
                              color="warning"
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </MDBox>
                      ) : (
                        <MDTypography variant="body2" color="text">
                          N/A
                        </MDTypography>
                      )}
                    </MDBox>

                    {/* Información adicional */}
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Rango Etario:
                      </MDTypography>{" "}
                      {displayValue(product.ageRange)}
                    </MDTypography>

                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Voltaje:
                      </MDTypography>{" "}
                      {displayValue(product.voltage)}
                    </MDTypography>

                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Garantía:
                      </MDTypography>{" "}
                      {displayValue(product.warranty)}
                    </MDTypography>

                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Tipo de Batería:
                      </MDTypography>{" "}
                      {displayValue(product.batteryType)}
                    </MDTypography>

                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Incluye Baterías:
                      </MDTypography>{" "}
                      {product.includesBatteries ? "Sí" : "No"}
                    </MDTypography>

                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Ubicación Recomendada:
                      </MDTypography>{" "}
                      {displayValue(product.recommendedLocation)}
                    </MDTypography>

                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Peso:
                      </MDTypography>{" "}
                      {product.weight ? `${product.weight} kg` : "N/A"}
                    </MDTypography>

                    {/* Dimensiones */}
                    <MDTypography variant="body2" color="text" mb={2}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Dimensiones:
                      </MDTypography>{" "}
                      {product.dimensions &&
                      (product.dimensions.width ||
                        product.dimensions.height ||
                        product.dimensions.depth)
                        ? `${product.dimensions.width || 0} x ${product.dimensions.height || 0} x ${
                            product.dimensions.depth || 0
                          } cm`
                        : "N/A"}
                    </MDTypography>

                    <Divider sx={{ my: 2 }} />

                    <MDTypography variant="h6" mt={2} mb={1}>
                      Precios de Revendedor:
                    </MDTypography>
                    {Object.keys(product.resellerPrices).map((cat) => (
                      <MDTypography variant="body2" color="text" key={cat} mb={0.5}>
                        <MDTypography component="span" variant="button" fontWeight="bold">
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
                        Creado el:
                      </MDTypography>{" "}
                      {new Date(product.createdAt).toLocaleDateString("es-CR")}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      <MDTypography component="span" variant="button" fontWeight="bold">
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
    </DashboardLayout>
  );
}

export default ProductDetail;
