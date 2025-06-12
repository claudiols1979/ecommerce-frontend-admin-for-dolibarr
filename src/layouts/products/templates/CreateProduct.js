// frontend/src/layouts/products/templates/CreateProduct.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Switch from "@mui/material/Switch";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Context
import { useProducts } from "contexts/ProductContext";
import { useAuth } from "contexts/AuthContext";

// Default product image if no images are uploaded (uncomment if you use it)
// import defaultProductImage from "assets/images/default-product.png";

function CreateProduct() {
  const navigate = useNavigate();
  const { createProduct, loading, error } = useProducts();
  const { user } = useAuth();

  const [productData, setProductData] = useState({
    name: "",
    code: "",
    description: "",
    brand: "", // String input
    category: "", // String input
    volume: "", // String input
    gender: "unisex", // Default from model enum
    tags: "",
    countInStock: 0, // Number input
    active: true,
    resellerPrices: {
      // Nested number inputs
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

  // Gender options with Spanish display names and corresponding enum values from your model
  const genderOptions = [
    { value: "men", label: "Hombre" },
    { value: "women", label: "Mujer" },
    { value: "unisex", label: "Unisex" },
    { value: "children", label: "Niño/a" },
    { value: "elderly", label: "Adulto Mayor" },
    { value: "other", label: "Otro" },
  ];

  // Handle changes for all inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested resellerPrices correctly as numbers
    if (name.startsWith("resellerPrices.")) {
      const cat = name.split(".")[1];
      setProductData((prevData) => ({
        ...prevData,
        resellerPrices: {
          ...prevData.resellerPrices,
          [cat]: parseFloat(value) || 0, // Ensure it's a number, default to 0 if invalid
        },
      }));
    }
    // Handle countInStock correctly as an integer number
    else if (name === "countInStock") {
      setProductData((prevData) => ({
        ...prevData,
        [name]: parseInt(value, 10) || 0, // Ensure it's an integer, default to 0
      }));
    }
    // Handle boolean for active switch
    else if (type === "checkbox") {
      setProductData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
    }
    // Handle all other text/string inputs
    else {
      setProductData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
    // Clear validation error for the field being changed
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  // Handle file selection for image uploads and create previews
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Limit to 5 files as per your backend (multer config)
    if (files.length > 5) {
      toast.error("Solo se permiten hasta 5 imágenes por producto.");
      setSelectedFiles([]);
      setFilePreviews([]);
      return;
    }
    setSelectedFiles(files);

    // Create and store image previews (URLs for display)
    const previews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  // Client-side validation logic
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

    // Validate all reseller prices
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
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform client-side validation before sending to backend
    if (!validateForm()) {
      toast.error("Por favor, corrija los errores en el formulario.");
      return;
    }

    // Check user role for authorization (though ProtectedRoute should handle this for navigation)
    if (!user || !["Administrador", "Editor"].includes(user.role)) {
      toast.error("No tienes permiso para crear productos.");
      return;
    }

    // Create FormData object for sending multipart/form-data (required for file uploads)
    const formData = new FormData();

    // Append all product text/number data to FormData
    Object.keys(productData).forEach((key) => {
      if (key === "resellerPrices") {
        // Append individual reseller prices with bracket notation for Multer
        Object.keys(productData.resellerPrices).forEach((cat) => {
          formData.append(`resellerPrices[${cat}]`, productData.resellerPrices[cat]);
        });
      } else if (key === "tags") {
        // Split tags string by comma, trim whitespace, filter empty tags, and append each
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

    // Append all selected image files to FormData
    selectedFiles.forEach((file) => {
      formData.append("images", file); // 'images' must match the field name Multer expects on backend
    });

    try {
      // Call the createProduct function from ProductContext
      // It handles setting loading/error states and making the axios call
      await createProduct(formData);
      toast.success("Producto creado exitosamente!");
      navigate("/products"); // Redirect to product list after successful creation
    } catch (err) {
      // Error message is already set by the context and re-thrown by it.
      // We catch it here to prevent uncaught promise rejection and display a toast.
      toast.error(error?.message || "Error al crear el producto.");
      console.error("Frontend: Error during product creation:", err);
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
                  {/* Product Details Section */}
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

                  {/* Brand - NOW A TEXT INPUT */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Marca"
                      name="brand"
                      value={productData.brand}
                      onChange={handleChange}
                      fullWidth // No 'select' prop
                      required
                      error={!!formErrors.brand}
                      helperText={formErrors.brand}
                    />
                  </Grid>

                  {/* Category - NOW A TEXT INPUT */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Categoría"
                      name="category"
                      value={productData.category}
                      onChange={handleChange}
                      fullWidth // No 'select' prop
                      required
                      error={!!formErrors.category}
                      helperText={formErrors.category}
                    />
                  </Grid>

                  {/* Volume - NOW A TEXT INPUT */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Volumen"
                      name="volume"
                      value={productData.volume}
                      onChange={handleChange}
                      fullWidth // No 'select' prop
                      required
                      error={!!formErrors.volume}
                      helperText={formErrors.volume}
                      placeholder="ej: 100ml, 50ml, 1oz" // Suggest format
                    />
                  </Grid>

                  {/* Gender - REMAINS A DROPDOWN (ENUM) */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Género"
                      name="gender"
                      value={productData.gender}
                      onChange={handleChange}
                      select // Keep as select for enum
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

                  {/* Tags and CountInStock (already correct as number input) */}
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
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Cantidad en Inventario" // This is countInStock
                      name="countInStock"
                      type="number"
                      value={productData.countInStock}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.countInStock}
                      helperText={formErrors.countInStock}
                      inputProps={{ min: 0, step: "1" }} // Fixed step to "1"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDBox display="flex" alignItems="center">
                      <MDTypography variant="body2" mr={1}>
                        Activo:
                      </MDTypography>
                      <Switch
                        checked={productData.active}
                        onChange={handleChange}
                        name="active"
                        inputProps={{ "aria-label": "active switch" }}
                      />
                    </MDBox>
                  </Grid>

                  {/* Reseller Prices Section */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={2} mb={1}>
                      Precios de Revendedor (mín. 0)
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
                            inputProps={{ min: 0, step: "1" }} // Fixed step to "1" for whole Colones
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Image Upload Section */}
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
                              alt={`Product Preview ${index + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </MDBox>
                        ))}
                        {filePreviews.length === 0 && (
                          <MDBox
                            width="100px"
                            height="100px"
                            mr={1}
                            mb={1}
                            borderRadius="lg"
                            overflow="hidden"
                            sx={{
                              border: ({ borders }) =>
                                `${borders.borderWidth[1]} dashed ${borders.borderColor}`,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <MDTypography variant="caption" color="text" textAlign="center">
                              No hay imágenes seleccionadas
                            </MDTypography>
                            {/* Uncomment if you have a default image to show: */}
                            {/* <img src={defaultProductImage} alt="Default Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> */}
                          </MDBox>
                        )}
                      </MDBox>
                    </MDBox>
                  </Grid>

                  {/* Submit and Cancel Buttons */}
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
