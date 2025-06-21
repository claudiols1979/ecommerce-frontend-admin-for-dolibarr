import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
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

// Context
import { useProducts } from "contexts/ProductContext";
import { useAuth } from "contexts/AuthContext";

function CreateProduct() {
  const navigate = useNavigate();
  const { createProduct, loading, error } = useProducts();
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
    gender: "unisex",
    tags: "",
    countInStock: 0,
    active: true,
    resellerPrices: {
      cat1: 0,
      cat2: 0,
      cat3: 0,
      cat4: 0,
      cat5: 0,
    },
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const genderOptions = [
    { value: "men", label: "Hombre" },
    { value: "women", label: "Mujer" },
    { value: "unisex", label: "Unisex" },
    { value: "children", label: "Niño/a" },
    { value: "elderly", label: "Adulto Mayor" },
    { value: "other", label: "Otro" },
  ];

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("Solo se permiten hasta 5 imágenes por producto.");
      return;
    }
    setSelectedFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  const validateForm = () => {
    const errors = {};
    if (!productData.name) errors.name = "El nombre es requerido.";
    if (!productData.code) errors.code = "El código es requerido.";
    if (!productData.description) errors.description = "La descripción es requerida.";
    if (!productData.brand) errors.brand = "La marca es requerida.";
    if (!productData.category) errors.category = "La categoría es requerida.";
    if (!productData.volume) errors.volume = "El volumen es requerido.";
    if (!productData.gender) errors.gender = "El género es requerido.";
    if (
      typeof productData.countInStock !== "number" ||
      productData.countInStock < 0 ||
      isNaN(productData.countInStock)
    ) {
      errors.countInStock = "El stock debe ser un número positivo o cero.";
    }
    const requiredCategories = ["cat1", "cat2", "cat3", "cat4", "cat5"];
    requiredCategories.forEach((cat) => {
      const price = productData.resellerPrices[cat];
      if (typeof price !== "number" || price < 0 || isNaN(price)) {
        errors[
          `resellerPrices.${cat}`
        ] = `El precio para ${cat.toUpperCase()} debe ser un número positivo.`;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Por favor, corrija los errores en el formulario.");
      return;
    }
    if (!user || !["Administrador", "Editor"].includes(user.role)) {
      toast.error("No tienes permiso para crear productos.");
      return;
    }
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (key === "resellerPrices") {
        Object.keys(productData.resellerPrices).forEach((cat) => {
          formData.append(`resellerPrices[${cat}]`, productData.resellerPrices[cat]);
        });
      } else if (key === "tags") {
        productData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "")
          .forEach((tag) => {
            formData.append("tags", tag);
          });
      } else {
        formData.append(key, productData[key]);
      }
    });
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });
    try {
      await createProduct(formData);
      toast.success("Producto creado exitosamente!");
      navigate("/products");
    } catch (err) {
      toast.error(err?.message || "Error al crear el producto.");
    }
  };

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
                  Crear Nuevo Producto
                </MDTypography>
              </MDBox>
              <MDBox p={3} component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* --- OTROS CAMPOS DEL FORMULARIO (SIN CAMBIOS) --- */}
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
                      {genderOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>
                  <Grid item xs={12} sm={6} mb={2}>
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

                  {/* --- CAMPO DE STOCK CON LÓGICA RESPONSIVE Y ESTILO CORREGIDO --- */}
                  <Grid item xs={12} sm={6} mt={-4}>
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
                      // <MDInput
                      //   name="countInStock"
                      //   type="number"
                      //   value={productData.countInStock}
                      //   onChange={handleChange}
                      //   fullWidth
                      //   required
                      //   error={!!formErrors.countInStock}
                      //   helperText={formErrors.countInStock}
                      //   inputProps={{ min: 0, step: "1" }}
                      // />
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

                  {/* --- SECCIÓN DE PRECIOS Y OTROS (SIN CAMBIOS) --- */}
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
                  <Grid item xs={12}>
                    <MDBox mt={2}>
                      <MDTypography variant="h6" mb={1}>
                        Imágenes del Producto (Máx. 5)
                      </MDTypography>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: "block", marginBottom: "10px" }}
                      />
                      <MDBox display="flex" flexWrap="wrap" mt={2}>
                        {filePreviews.map((preview, index) => (
                          <MDBox
                            key={index}
                            width="100px"
                            height="100px"
                            mr={1}
                            mb={1}
                            borderRadius="lg"
                            overflow="hidden"
                            sx={{
                              border: ({ borders }) =>
                                `${borders.borderWidth[1]} solid ${borders.borderColor}`,
                            }}
                          >
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
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
                        {loading ? "Creando..." : "Crear Producto"}
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

export default CreateProduct;
