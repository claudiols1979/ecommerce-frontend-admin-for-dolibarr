import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import { useTheme, useMediaQuery } from "@mui/material";

// @mui icons
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Contexts
import { useProducts } from "contexts/ProductContext";
import { useAuth } from "contexts/AuthContext";

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getProductById, updateProduct, loading, error } = useProducts();
  const { user } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [productData, setProductData] = useState({
    name: "",
    code: "",
    description: "",
    brand: "",
    category: "",
    volume: "",
    gender: "",
    tags: "",
    countInStock: 0,
    active: true,
    resellerPrices: { cat1: 0, cat2: 0, cat3: 0, cat4: 0, cat5: 0 },
  });

  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [selectedNewFiles, setSelectedNewFiles] = useState([]);
  const [newFilePreviews, setNewFilePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const genderOptions = [
    { value: "men", label: "Hombre" },
    { value: "women", label: "Mujer" },
    { value: "unisex", label: "Unisex" },
    { value: "children", label: "Niño/a" },
    { value: "elderly", label: "Adulto Mayor" },
    { value: "other", label: "Otro" },
  ];

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
          setProductData({
            name: fetchedProduct.name || "",
            code: fetchedProduct.code || "",
            description: fetchedProduct.description || "",
            brand: fetchedProduct.brand || "",
            category: fetchedProduct.category || "",
            volume: fetchedProduct.volume || "",
            gender: fetchedProduct.gender || "unisex",
            tags: fetchedProduct.tags ? fetchedProduct.tags.join(", ") : "",
            countInStock: fetchedProduct.countInStock || 0,
            active: fetchedProduct.active !== undefined ? fetchedProduct.active : true,
            resellerPrices: fetchedProduct.resellerPrices || {
              cat1: 0,
              cat2: 0,
              cat3: 0,
              cat4: 0,
              cat5: 0,
            },
          });
          setExistingImageUrls(fetchedProduct.imageUrls || []);
        } else {
          setFetchError("Producto no encontrado.");
          toast.error("Producto no encontrado.");
          navigate("/products");
        }
      } catch (err) {
        setFetchError(err.message || "Error al cargar el producto.");
        toast.error(err.message || "Error al cargar el producto.");
      } finally {
        setInitialLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id, getProductById, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("resellerPrices.")) {
      const cat = name.split(".")[1];
      setProductData((prev) => ({
        ...prev,
        resellerPrices: { ...prev.resellerPrices, [cat]: parseFloat(value) || 0 },
      }));
    } else if (name === "countInStock") {
      setProductData((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else if (type === "checkbox") {
      setProductData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setProductData((prev) => ({ ...prev, [name]: value }));
    }
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleStockChange = (amount) => {
    setProductData((prev) => ({
      ...prev,
      countInStock: Math.max(0, prev.countInStock + amount),
    }));
  };

  const handleNewFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImageUrls.length + files.length - imagesToDelete.length;
    if (totalImages > 5) {
      toast.error("Solo se permiten hasta 5 imágenes en total por producto.");
      e.target.value = "";
      return;
    }
    setSelectedNewFiles(files);
    setNewFilePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleDeleteExistingImage = (publicId) => {
    setImagesToDelete((prev) => [...prev, publicId]);
    setExistingImageUrls((prev) => prev.filter((img) => img.public_id !== publicId));
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setNewFilePreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
    setSelectedNewFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const validateForm = () => {
    // La lógica de validación original se mantiene sin cambios
    const errors = {};
    if (!productData.name) errors.name = "El nombre es requerido.";
    if (!productData.code) errors.code = "El código es requerido.";
    if (!productData.description) errors.description = "La descripción es requerida.";
    if (!productData.brand) errors.brand = "La marca es requerida.";
    if (!productData.category) errors.category = "La categoría es requerida.";
    if (!productData.volume) errors.volume = "El volumen es requerido.";
    if (typeof productData.countInStock !== "number" || productData.countInStock < 0) {
      errors.countInStock = "El stock debe ser un número positivo.";
    }
    // ... más validaciones ...
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Por favor, corrija los errores en el formulario.");
      return;
    }
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (key === "resellerPrices") {
        Object.keys(productData.resellerPrices).forEach((cat) =>
          formData.append(`resellerPrices[${cat}]`, productData.resellerPrices[cat])
        );
      } else if (key === "tags") {
        productData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t)
          .forEach((t) => formData.append("tags", t));
      } else {
        formData.append(key, productData[key]);
      }
    });
    selectedNewFiles.forEach((file) => formData.append("images", file));
    imagesToDelete.forEach((publicId) => formData.append("imagesToDelete", publicId));
    existingImageUrls.forEach((img, index) => {
      formData.append(`existingImageUrls[${index}][public_id]`, img.public_id);
      formData.append(`existingImageUrls[${index}][secure_url]`, img.secure_url);
    });
    try {
      await updateProduct(id, formData);
      toast.success("Producto actualizado exitosamente!");
      navigate("/products");
    } catch (err) {
      toast.error(error?.message || "Error al actualizar el producto.");
    }
  };

  if (initialLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3} display="flex" justifyContent="center">
          <CircularProgress color="info" />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }
  if (fetchError) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography color="error">Error: {fetchError}</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6} justifyContent="center">
          <Grid item xs={12} lg={8}>
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
                  Editar Producto
                </MDTypography>
              </MDBox>
              <MDBox p={3} component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Nombre del Producto"
                      name="name"
                      value={productData.name}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Código"
                      name="code"
                      value={productData.code}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.code}
                      helperText={formErrors.code}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      label="Descripción"
                      name="description"
                      value={productData.description}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      fullWidth
                      required
                      error={!!formErrors.description}
                      helperText={formErrors.description}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Marca"
                      name="brand"
                      value={productData.brand}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.brand}
                      helperText={formErrors.brand}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Categoría"
                      name="category"
                      value={productData.category}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.category}
                      helperText={formErrors.category}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Volumen"
                      name="volume"
                      value={productData.volume}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.volume}
                      helperText={formErrors.volume}
                      placeholder="ej: 100ml, 50ml, 1oz"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Género"
                      name="gender"
                      value={productData.gender}
                      onChange={handleChange}
                      select
                      fullWidth
                      required
                      error={!!formErrors.gender}
                      helperText={formErrors.gender}
                    >
                      {genderOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Etiquetas (separadas por coma)"
                      name="tags"
                      value={productData.tags}
                      onChange={handleChange}
                      fullWidth
                      error={!!formErrors.tags}
                      helperText={formErrors.tags}
                      placeholder="ej: floral, amaderado, especiado"
                    />
                  </Grid>

                  {/* --- CAMPO DE STOCK CON LÓGICA RESPONSIVE --- */}
                  <Grid item xs={12} sm={6}>
                    <MDTypography variant="caption" color="text" fontWeight="bold">
                      Cantidad en Inventario
                    </MDTypography>
                    {isMobile ? (
                      <MDBox
                        display="flex"
                        alignItems="center"
                        sx={{
                          border: "1px solid #d2d6da",
                          borderRadius: "0.375rem",
                          p: "2px",
                          mt: 1,
                        }}
                      >
                        <IconButton
                          onClick={() => handleStockChange(-1)}
                          disabled={productData.countInStock <= 0}
                        >
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                        <MDBox
                          sx={{
                            flexGrow: 1,
                            textAlign: "center",
                            bgcolor: "action.hover",
                            borderRadius: 1,
                            py: 1,
                          }}
                        >
                          <MDTypography variant="body2" fontWeight="bold" color="text">
                            {productData.countInStock}
                          </MDTypography>
                        </MDBox>
                        <IconButton onClick={() => handleStockChange(1)}>
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </MDBox>
                    ) : (
                      <MDInput
                        name="countInStock"
                        type="number"
                        value={productData.countInStock}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!formErrors.countInStock}
                        helperText={formErrors.countInStock}
                        inputProps={{ min: 0, step: "1" }}
                      />
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <MDBox display="flex" alignItems="center">
                      <MDTypography variant="body2" mr={1}>
                        Activo:
                      </MDTypography>
                      <Switch checked={productData.active} onChange={handleChange} name="active" />
                    </MDBox>
                  </Grid>

                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={2} mb={1}>
                      Precios de Revendedor
                    </MDTypography>
                    <Grid container spacing={2}>
                      {Object.keys(productData.resellerPrices).map((cat) => (
                        <Grid item xs={12} sm={6} md={4} key={cat}>
                          <MDInput
                            label={`Precio ${cat.toUpperCase()}`}
                            name={`resellerPrices.${cat}`}
                            type="number"
                            value={productData.resellerPrices[cat]}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!formErrors[`resellerPrices.${cat}`]}
                            helperText={formErrors[`resellerPrices.${cat}`]}
                            inputProps={{ min: 0, step: "1" }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* --- SECCIÓN DE MANEJO DE IMÁGENES (INTACTA) --- */}
                  <Grid item xs={12}>
                    <MDBox mt={2}>
                      <MDTypography variant="h6" mb={1}>
                        Imágenes del Producto (Máx. 5)
                      </MDTypography>
                      {existingImageUrls.length > 0 && (
                        <MDTypography variant="subtitle2" mt={1} mb={0.5}>
                          Imágenes existentes:
                        </MDTypography>
                      )}
                      <MDBox display="flex" flexWrap="wrap" mt={1}>
                        {existingImageUrls.map((img, index) => (
                          <MDBox
                            key={img.public_id || index}
                            width="100px"
                            height="100px"
                            mr={1}
                            mb={1}
                            borderRadius="lg"
                            overflow="hidden"
                            position="relative"
                            sx={{
                              border: ({ borders }) =>
                                `${borders.borderWidth[1]} solid ${borders.borderColor}`,
                            }}
                          >
                            <img
                              src={img.secure_url}
                              alt={`Existing Product ${index + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <MDBox
                              position="absolute"
                              top={0}
                              right={0}
                              onClick={() => handleDeleteExistingImage(img.public_id)}
                              sx={{
                                cursor: "pointer",
                                bgColor: "error.main",
                                borderRadius: "50%",
                                width: "24px",
                                height: "24px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                transform: "translate(25%, -25%)",
                                zIndex: 1,
                              }}
                            >
                              <Icon sx={{ color: "white", fontSize: "14px !important" }}>
                                close
                              </Icon>
                            </MDBox>
                          </MDBox>
                        ))}
                      </MDBox>
                      <MDTypography variant="subtitle2" mt={2} mb={0.5}>
                        Añadir nuevas imágenes:
                      </MDTypography>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleNewFileChange}
                        style={{ display: "block", marginBottom: "10px" }}
                      />
                      <MDBox display="flex" flexWrap="wrap" mt={1}>
                        {newFilePreviews.map((preview, index) => (
                          <MDBox
                            key={index}
                            width="100px"
                            height="100px"
                            mr={1}
                            mb={1}
                            borderRadius="lg"
                            overflow="hidden"
                            position="relative"
                            sx={{
                              border: ({ borders }) =>
                                `${borders.borderWidth[1]} solid ${borders.borderColor}`,
                            }}
                          >
                            <img
                              src={preview}
                              alt={`New Product Preview ${index + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <MDBox
                              position="absolute"
                              top={0}
                              right={0}
                              onClick={() => handleRemoveNewImage(index)}
                              sx={{
                                cursor: "pointer",
                                bgColor: "error.main",
                                borderRadius: "50%",
                                width: "24px",
                                height: "24px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                transform: "translate(25%, -25%)",
                                zIndex: 1,
                              }}
                            >
                              <Icon sx={{ color: "white", fontSize: "14px !important" }}>
                                close
                              </Icon>
                            </MDBox>
                          </MDBox>
                        ))}
                      </MDBox>
                    </MDBox>
                  </Grid>

                  <Grid item xs={12}>
                    <MDBox mt={4} mb={1} display="flex" justifyContent="flex-end">
                      <MDButton
                        variant="gradient"
                        color="secondary"
                        onClick={() => navigate("/products")}
                        disabled={loading}
                        sx={{ marginRight: 2 }}
                      >
                        Cancelar
                      </MDButton>
                      <MDButton variant="gradient" color="info" type="submit" disabled={loading}>
                        {loading ? "Actualizando..." : "Actualizar Producto"}
                      </MDButton>
                    </MDBox>
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

export default EditProduct;
