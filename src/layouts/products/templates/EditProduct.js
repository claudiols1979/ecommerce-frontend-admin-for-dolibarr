// frontend/src/layouts/products/templates/EditProduct.js

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams to get ID from URL
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress"; // For loading spinner

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import Switch from "@mui/material/Switch";
import Icon from "@mui/material/Icon"; // For delete icon on images

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Contexts
import { useProducts } from "contexts/ProductContext";
import { useAuth } from "contexts/AuthContext";

// Default product image if no images are uploaded
// import defaultProductImage from "assets/images/default-product.png";

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get product ID from URL
  const { getProductById, updateProduct, loading, error } = useProducts(); // Get functions from ProductContext
  const { user } = useAuth();

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
    resellerPrices: {
      cat1: 0,
      cat2: 0,
      cat3: 0,
      cat4: 0,
      cat5: 0,
    },
    // imageUrls will be handled separately as existing images
  });

  const [existingImageUrls, setExistingImageUrls] = useState([]); // To store images already on the product
  const [selectedNewFiles, setSelectedNewFiles] = useState([]); // To store newly selected files for upload
  const [newFilePreviews, setNewFilePreviews] = useState([]); // Previews for new files
  const [imagesToDelete, setImagesToDelete] = useState([]); // public_ids of images to delete
  const [formErrors, setFormErrors] = useState({});
  const [initialLoading, setInitialLoading] = useState(true); // Separate loading for initial fetch
  const [fetchError, setFetchError] = useState(null); // Separate error for initial fetch

  // Form field options (same as CreateProduct, can be centralized later)
  const genderOptions = [
    { value: "men", label: "Hombre" },
    { value: "women", label: "Mujer" },
    { value: "unisex", label: "Unisex" },
    { value: "children", label: "Niño/a" },
    { value: "elderly", label: "Adulto Mayor" },
    { value: "other", label: "Otro" },
  ];

  // Effect to fetch product data when component mounts or ID changes
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setInitialLoading(true);
        setFetchError(null);

        if (typeof getProductById !== "function") {
          console.error("getProductById is not a function in ProductContext. This is unexpected.");
          setFetchError("Error interno: la función de carga del producto no está disponible.");
          toast.error("Error al cargar el producto: función no disponible.");
          setInitialLoading(false);
          return; // Exit early
        }

        const fetchedProduct = await getProductById(id); // Use context function to fetch
        if (fetchedProduct) {
          // Populate productData state
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
          // Set existing images
          setExistingImageUrls(fetchedProduct.imageUrls || []);
        } else {
          setFetchError("Producto no encontrado.");
          toast.error("Producto no encontrado.");
          navigate("/products"); // Redirect if product not found
        }
      } catch (err) {
        setFetchError(err.message || "Error al cargar el producto.");
        toast.error(err.message || "Error al cargar el producto.");
        console.error("Error fetching product for edit:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, getProductById, navigate]); // Depend on ID, getProductById and navigate

  // Handle changes for all inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("resellerPrices.")) {
      const cat = name.split(".")[1];
      setProductData((prevData) => ({
        ...prevData,
        resellerPrices: {
          ...prevData.resellerPrices,
          [cat]: parseFloat(value) || 0,
        },
      }));
    } else if (name === "countInStock") {
      setProductData((prevData) => ({
        ...prevData,
        [name]: parseInt(value, 10) || 0,
      }));
    } else if (type === "checkbox") {
      setProductData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      setProductData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  // Handle new file selection for image uploads
  const handleNewFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImageUrls.length + files.length - imagesToDelete.length;
    if (totalImages > 5) {
      toast.error("Solo se permiten hasta 5 imágenes en total por producto.");
      e.target.value = ""; // Clear selected files from input
      setSelectedNewFiles([]);
      setNewFilePreviews([]);
      return;
    }
    setSelectedNewFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewFilePreviews(previews);
  };

  // Handle deleting an existing image (marks for deletion)
  const handleDeleteExistingImage = (publicId) => {
    setImagesToDelete((prev) => [...prev, publicId]);
    setExistingImageUrls((prev) => prev.filter((img) => img.public_id !== publicId));
  };

  // Handle removing a newly selected image (before upload)
  const handleRemoveNewImage = (indexToRemove) => {
    setNewFilePreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
    setSelectedNewFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrija los errores en el formulario.");
      return;
    }

    if (!user || !["Administrador", "Editor"].includes(user.role)) {
      toast.error("No tienes permiso para editar productos.");
      return;
    }

    const formData = new FormData();

    // Append product text/number data
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

    // Append new selected image files
    selectedNewFiles.forEach((file) => {
      formData.append("images", file); // 'images' is the field name Multer expects
    });

    // Append public_ids of images to delete
    imagesToDelete.forEach((publicId) => {
      formData.append("imagesToDelete", publicId); // Backend needs to know which images to delete
    });

    // FIX: Append existing image URLs with explicit indices for backend parsing
    existingImageUrls.forEach((img, index) => {
      formData.append(`existingImageUrls[${index}][public_id]`, img.public_id);
      formData.append(`existingImageUrls[${index}][secure_url]`, img.secure_url);
    });

    try {
      await updateProduct(id, formData); // Pass ID and FormData to update function
      toast.success("Producto actualizado exitosamente!");
      navigate("/products"); // Redirect to product list after successful update
    } catch (err) {
      toast.error(error?.message || "Error al actualizar el producto.");
      console.error("Frontend Product Update Error:", err);
    }
  };

  // Display loading spinner while fetching initial product data
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
            Cargando producto...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Display fetch error if initial loading failed
  if (fetchError) {
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
            Error: {fetchError}
          </MDTypography>
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
                  {/* Product Details Section - Replicated from CreateProduct */}
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
                      label="Cantidad en Inventario"
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
                            inputProps={{ min: 0, step: "1" }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Image Management Section */}
                  <Grid item xs={12}>
                    <MDBox mt={2}>
                      <MDTypography variant="h6" mb={1}>
                        Imágenes del Producto (Máx. 5)
                      </MDTypography>
                      {/* Display Existing Images */}
                      {existingImageUrls.length > 0 && (
                        <MDTypography variant="subtitle2" mt={1} mb={0.5}>
                          Imágenes existentes:
                        </MDTypography>
                      )}
                      <MDBox display="flex" flexWrap="wrap" mt={1}>
                        {existingImageUrls.map((img, index) => (
                          <MDBox
                            key={img.public_id || index} // Use public_id as key if available
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
                            {/* Delete button for existing images */}
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
                        {/* Placeholder for no existing images and no new files */}
                        {existingImageUrls.length === 0 && newFilePreviews.length === 0 && (
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
                              No hay imágenes
                            </MDTypography>
                          </MDBox>
                        )}
                      </MDBox>

                      {/* Add New Images Input */}
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
                            {/* Delete button for newly selected images */}
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
