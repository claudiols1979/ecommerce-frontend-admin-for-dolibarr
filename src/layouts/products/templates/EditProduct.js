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
import { useTheme, useMediaQuery, Chip, FormControlLabel, Checkbox, Divider } from "@mui/material";

// @mui icons
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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
import { useLabels } from "contexts/LabelContext";

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getProductById, updateProduct, loading: productLoading } = useProducts();
  const { user } = useAuth();
  const { labels, fetchLabels, assignLabelsToProduct, loading: labelsLoading } = useLabels();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [productData, setProductData] = useState({
    name: "",
    code: "",
    description: "",
    department: "",
    subcategory: "",
    brand: "",
    category: "",
    volume: "",
    gender: "",
    tags: "",
    countInStock: 0,
    active: true,
    resellerPrices: { cat1: 0, cat2: 0, cat3: 0, cat4: 0, cat5: 0 },
    // Nuevos campos flexibles
    colors: [],
    sizes: [],
    materials: [],
    ageRange: "",
    features: [],
    voltage: "",
    warranty: "",
    includesBatteries: false,
    batteryType: "",
    dimensions: { width: 0, height: 0, depth: 0 },
    weight: 0,
    recommendedLocation: "",
  });

  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [selectedNewFiles, setSelectedNewFiles] = useState([]);
  const [newFilePreviews, setNewFilePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedLabelIds, setSelectedLabelIds] = useState([]);
  const [currentColorInput, setCurrentColorInput] = useState("");
  const [currentSizeInput, setCurrentSizeInput] = useState("");
  const [currentMaterialInput, setCurrentMaterialInput] = useState("");
  const [currentFeatureInput, setCurrentFeatureInput] = useState("");

  const genderOptions = [
    { value: "Hombre", label: "Hombre" },
    { value: "Mujer", label: "Mujer" },
    { value: "Unisex", label: "Unisex" },
    { value: "Niño", label: "Niño" },
    { value: "Niña", label: "Niña" },
  ];

  const ageRangeOptions = [
    { value: "Bebé", label: "Bebé" },
    { value: "Infantil", label: "Infantil" },
    { value: "Adolescente", label: "Adolescente" },
    { value: "Adulto", label: "Adulto" },
  ];

  const voltageOptions = [
    { value: "110V", label: "110V" },
    { value: "220V", label: "220V" },
    { value: "Bivoltaje", label: "Bivoltaje" },
  ];

  const warrantyOptions = [
    { value: "3 meses", label: "3 meses" },
    { value: "6 meses", label: "6 meses" },
    { value: "1 año", label: "1 año" },
    { value: "2 años", label: "2 años" },
  ];

  const batteryTypeOptions = [
    { value: "AA", label: "AA" },
    { value: "AAA", label: "AAA" },
    { value: "Recargable", label: "Recargable" },
    { value: "Litio", label: "Litio" },
  ];

  const locationOptions = [
    { value: "Interior", label: "Interior" },
    { value: "Exterior", label: "Exterior" },
  ];

  useEffect(() => {
    const fetchProductAndLabels = async () => {
      try {
        setInitialLoading(true);
        setFetchError(null);

        await fetchLabels();

        if (typeof getProductById !== "function") {
          throw new Error("La función para obtener el producto no está disponible.");
        }
        const fetchedProduct = await getProductById(id);

        if (fetchedProduct) {
          setProductData({
            name: fetchedProduct.name || "",
            code: fetchedProduct.code || "",
            description: fetchedProduct.description || "",
            department: fetchedProduct.department || "",
            subcategory: fetchedProduct.subcategory || "",
            brand: fetchedProduct.brand || "",
            category: fetchedProduct.category || "",
            volume: fetchedProduct.volume || "",
            gender: fetchedProduct.gender || "Unisex",
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
            // Nuevos campos
            colors: fetchedProduct.colors || [],
            sizes: fetchedProduct.sizes || [],
            materials: fetchedProduct.materials || [],
            ageRange: fetchedProduct.ageRange || "",
            features: fetchedProduct.features || [],
            voltage: fetchedProduct.voltage || "",
            warranty: fetchedProduct.warranty || "",
            includesBatteries: fetchedProduct.includesBatteries || false,
            batteryType: fetchedProduct.batteryType || "",
            dimensions: fetchedProduct.dimensions || { width: 0, height: 0, depth: 0 },
            weight: fetchedProduct.weight || 0,
            recommendedLocation: fetchedProduct.recommendedLocation || "",
          });
          setExistingImageUrls(fetchedProduct.imageUrls || []);

          if (fetchedProduct.promotionalLabels && Array.isArray(fetchedProduct.promotionalLabels)) {
            setSelectedLabelIds(fetchedProduct.promotionalLabels.map((label) => label._id));
          }
        } else {
          setFetchError("Producto no encontrado.");
          toast.error("Producto no encontrado.");
          navigate("/products");
        }
      } catch (err) {
        setFetchError(err.message || "Error al cargar los datos.");
        toast.error(err.message || "Error al cargar los datos.");
      } finally {
        setInitialLoading(false);
      }
    };
    if (id) {
      fetchProductAndLabels();
    }
  }, [id, getProductById, navigate, fetchLabels]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("dimensions.")) {
      const dimension = name.split(".")[1];
      setProductData((prev) => ({
        ...prev,
        dimensions: { ...prev.dimensions, [dimension]: parseFloat(value) || 0 },
      }));
    } else if (name.startsWith("resellerPrices.")) {
      const cat = name.split(".")[1];
      setProductData((prev) => ({
        ...prev,
        resellerPrices: { ...prev.resellerPrices, [cat]: parseFloat(value) || 0 },
      }));
    } else if (name === "countInStock" || name === "weight") {
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

  const handleAddItem = (field, inputValue, setInputValue) => {
    if (inputValue.trim() && !productData[field].includes(inputValue.trim())) {
      setProductData((prev) => ({
        ...prev,
        [field]: [...prev[field], inputValue.trim()],
      }));
      setInputValue("");
    }
  };

  const handleRemoveItem = (field, item) => {
    setProductData((prev) => ({
      ...prev,
      [field]: prev[field].filter((i) => i !== item),
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

  const handleLabelToggle = (labelId) => {
    setSelectedLabelIds((prevSelected) =>
      prevSelected.includes(labelId)
        ? prevSelected.filter((id) => id !== labelId)
        : [...prevSelected, labelId]
    );
  };

  const validateForm = () => {
    const errors = {};
    if (!productData.name) errors.name = "El nombre es requerido.";
    if (!productData.code) errors.code = "El código es requerido.";
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

    // Agregar todos los campos al formData
    Object.keys(productData).forEach((key) => {
      if (key === "resellerPrices") {
        Object.keys(productData.resellerPrices).forEach((cat) =>
          formData.append(`resellerPrices[${cat}]`, productData.resellerPrices[cat])
        );
      } else if (key === "dimensions") {
        Object.keys(productData.dimensions).forEach((dim) =>
          formData.append(`dimensions[${dim}]`, productData.dimensions[dim])
        );
      } else if (Array.isArray(productData[key])) {
        productData[key].forEach((item) => formData.append(`${key}[]`, item));
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
      await assignLabelsToProduct(id, selectedLabelIds);
      toast.success("Producto y etiquetas actualizados exitosamente!");
      navigate("/products");
    } catch (err) {
      toast.error(err?.message || "Error al actualizar el producto o las etiquetas.");
    }
  };

  const stripHtml = (html) => html?.replace(/<[^>]*>/g, "") || "";

  const stripHtmlWithBreaks = (html) => {
    if (!html) return "";
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]*>/g, "")
      .trim();
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
              >
                <MDTypography variant="h6" color="white">
                  Editar Producto
                </MDTypography>
              </MDBox>
              <MDBox p={3} component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Campos básicos del producto */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Nombre del Producto"
                      name="name"
                      disabled
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
                      disabled
                      value={productData.code}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!formErrors.code}
                      helperText={formErrors.code}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDTypography variant="caption" color="text" fontWeight="bold" sx={{ mb: 1 }}>
                      Descripción
                    </MDTypography>
                    <MDTypography
                      variant="body2"
                      color="text"
                      disabled
                      sx={{
                        whiteSpace: "pre-line",
                        p: 1,
                        border: "1px solid",
                        borderColor: "grey.300",
                        borderRadius: 1,
                        bgcolor: "grey.50",
                        minHeight: "80px",
                      }}
                    >
                      {stripHtmlWithBreaks(productData.description) ||
                        "No hay descripción disponible."}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Departamento"
                      name="department"
                      value={productData.department || ""}
                      onChange={handleChange}
                      fullWidth
                      error={!!formErrors.department}
                      helperText={formErrors.department}
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
                      label="Subcategoría"
                      name="subcategory"
                      value={productData.subcategory || ""}
                      onChange={handleChange}
                      fullWidth
                      error={!!formErrors.subcategory}
                      helperText={formErrors.subcategory}
                    />
                  </Grid>
                  {/* <Grid item xs={12} sm={6}>
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
                    >
                      {genderOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid> */}
                  <Grid item xs={12} sm={6} mb={2}>
                    <MDInput
                      label="Notas aromáticas (separadas por coma)"
                      name="tags"
                      value={productData.tags}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} mt={-5}>
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
                          //disabled={productData.countInStock <= 0}
                          disabled
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
                        <IconButton onClick={() => handleStockChange(1)} disabled>
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </MDBox>
                    ) : (
                      <MDInput
                        name="countInStock"
                        type="number"
                        value={productData.countInStock}
                        disabled
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

                  {/* --- NUEVOS ATRIBUTOS FLEXIBLES --- */}
                  <Grid item xs={12}>
                    <Divider>
                      <MDTypography variant="h5" color="primary">
                        Atributos Flexibles
                      </MDTypography>
                    </Divider>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <MDTypography variant="h6" mb={1}>
                      Volúmen
                    </MDTypography>
                    <MDInput
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
                    <MDTypography variant="h6" mb={1}>
                      Género
                    </MDTypography>
                    <MDInput
                      name="gender"
                      value={productData.gender}
                      onChange={handleChange}
                      select
                      fullWidth
                      required
                    >
                      {genderOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDTypography variant="h6" mb={1}>
                      Colores
                    </MDTypography>
                    <MDBox display="flex" alignItems="center" mb={1}>
                      <MDInput
                        value={currentColorInput}
                        onChange={(e) => setCurrentColorInput(e.target.value)}
                        placeholder="Agregar color"
                        fullWidth
                      />
                      <MDButton
                        variant="gradient"
                        color="info"
                        size="small"
                        onClick={() =>
                          handleAddItem("colors", currentColorInput, setCurrentColorInput)
                        }
                        sx={{ ml: 1 }}
                      >
                        Agregar
                      </MDButton>
                    </MDBox>
                    <MDBox display="flex" flexWrap="wrap" gap={0.5}>
                      {productData.colors.map((color, index) => (
                        <Chip
                          key={index}
                          label={color}
                          onDelete={() => handleRemoveItem("colors", color)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </MDBox>
                  </Grid>

                  {/* Tamaños */}
                  <Grid item xs={12} sm={6}>
                    <MDTypography variant="h6" mb={1}>
                      Tamaños
                    </MDTypography>
                    <MDBox display="flex" alignItems="center" mb={1}>
                      <MDInput
                        value={currentSizeInput}
                        onChange={(e) => setCurrentSizeInput(e.target.value)}
                        placeholder="Agregar tamaño"
                        fullWidth
                      />
                      <MDButton
                        variant="gradient"
                        color="info"
                        size="small"
                        onClick={() =>
                          handleAddItem("sizes", currentSizeInput, setCurrentSizeInput)
                        }
                        sx={{ ml: 1 }}
                      >
                        Agregar
                      </MDButton>
                    </MDBox>
                    <MDBox display="flex" flexWrap="wrap" gap={0.5}>
                      {productData.sizes.map((size, index) => (
                        <Chip
                          key={index}
                          label={size}
                          onDelete={() => handleRemoveItem("sizes", size)}
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </MDBox>
                  </Grid>

                  {/* Materiales */}
                  <Grid item xs={12} sm={6}>
                    <MDTypography variant="h6" mb={1}>
                      Materiales
                    </MDTypography>
                    <MDBox display="flex" alignItems="center" mb={1}>
                      <MDInput
                        value={currentMaterialInput}
                        onChange={(e) => setCurrentMaterialInput(e.target.value)}
                        placeholder="Agregar material"
                        fullWidth
                      />
                      <MDButton
                        variant="gradient"
                        color="info"
                        size="small"
                        onClick={() =>
                          handleAddItem("materials", currentMaterialInput, setCurrentMaterialInput)
                        }
                        sx={{ ml: 1 }}
                      >
                        Agregar
                      </MDButton>
                    </MDBox>
                    <MDBox display="flex" flexWrap="wrap" gap={0.5}>
                      {productData.materials.map((material, index) => (
                        <Chip
                          key={index}
                          label={material}
                          onDelete={() => handleRemoveItem("materials", material)}
                          color="success"
                          variant="outlined"
                        />
                      ))}
                    </MDBox>
                  </Grid>

                  {/* Características especiales */}
                  <Grid item xs={12} sm={6}>
                    <MDTypography variant="h6" mb={1}>
                      Características Especiales
                    </MDTypography>
                    <MDBox display="flex" alignItems="center" mb={1}>
                      <MDInput
                        value={currentFeatureInput}
                        onChange={(e) => setCurrentFeatureInput(e.target.value)}
                        placeholder="Agregar característica"
                        fullWidth
                      />
                      <MDButton
                        variant="gradient"
                        color="info"
                        size="small"
                        onClick={() =>
                          handleAddItem("features", currentFeatureInput, setCurrentFeatureInput)
                        }
                        sx={{ ml: 1 }}
                      >
                        Agregar
                      </MDButton>
                    </MDBox>
                    <MDBox display="flex" flexWrap="wrap" gap={0.5}>
                      {productData.features.map((feature, index) => (
                        <Chip
                          key={index}
                          label={feature}
                          onDelete={() => handleRemoveItem("features", feature)}
                          color="warning"
                          variant="outlined"
                        />
                      ))}
                    </MDBox>
                  </Grid>

                  {/* Rango etario */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Rango Etario"
                      name="ageRange"
                      value={productData.ageRange}
                      onChange={handleChange}
                      select
                      fullWidth
                    >
                      <MenuItem value="">Seleccionar rango etario</MenuItem>
                      {ageRangeOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>

                  {/* Voltaje */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Voltaje"
                      name="voltage"
                      value={productData.voltage}
                      onChange={handleChange}
                      select
                      fullWidth
                    >
                      <MenuItem value="">Seleccionar voltaje</MenuItem>
                      {voltageOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>

                  {/* Garantía */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Garantía"
                      name="warranty"
                      value={productData.warranty}
                      onChange={handleChange}
                      select
                      fullWidth
                    >
                      <MenuItem value="">Seleccionar garantía</MenuItem>
                      {warrantyOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>

                  {/* Tipo de batería */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Tipo de Batería"
                      name="batteryType"
                      value={productData.batteryType}
                      onChange={handleChange}
                      select
                      fullWidth
                    >
                      <MenuItem value="">Seleccionar tipo de batería</MenuItem>
                      {batteryTypeOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>

                  {/* Incluye baterías */}
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={productData.includesBatteries}
                          onChange={handleChange}
                          name="includesBatteries"
                        />
                      }
                      label="Incluye baterías"
                    />
                  </Grid>

                  {/* Ubicación recomendada */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Ubicación Recomendada"
                      name="recommendedLocation"
                      value={productData.recommendedLocation}
                      onChange={handleChange}
                      select
                      fullWidth
                    >
                      <MenuItem value="">Seleccionar ubicación</MenuItem>
                      {locationOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </MDInput>
                  </Grid>

                  {/* Dimensiones */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mb={1}>
                      Dimensiones (cm)
                    </MDTypography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <MDInput
                          label="Ancho"
                          name="dimensions.width"
                          type="number"
                          value={productData.dimensions.width}
                          onChange={handleChange}
                          fullWidth
                          inputProps={{ min: 0, step: "0.1" }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <MDInput
                          label="Alto"
                          name="dimensions.height"
                          type="number"
                          value={productData.dimensions.height}
                          onChange={handleChange}
                          fullWidth
                          inputProps={{ min: 0, step: "0.1" }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <MDInput
                          label="Profundidad"
                          name="dimensions.depth"
                          type="number"
                          value={productData.dimensions.depth}
                          onChange={handleChange}
                          fullWidth
                          inputProps={{ min: 0, step: "0.1" }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Peso */}
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="Peso (kg)"
                      name="weight"
                      type="number"
                      value={productData.weight}
                      onChange={handleChange}
                      fullWidth
                      inputProps={{ min: 0, step: "0.1" }}
                    />
                  </Grid>

                  {/* Precios de revendedor */}
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
                            disabled
                            type="number"
                            value={productData.resellerPrices[cat]}
                            onChange={handleChange}
                            fullWidth
                            required
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Etiquetas promocionales */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={2} mb={1}>
                      Etiquetas Promocionales
                    </MDTypography>
                    <MDBox display="flex" flexWrap="wrap" gap={1}>
                      {labelsLoading ? (
                        <CircularProgress size={24} />
                      ) : (
                        labels.map((label) => {
                          const isSelected = selectedLabelIds.includes(label._id);
                          return (
                            <Chip
                              key={label._id}
                              icon={isSelected ? <CheckCircleIcon /> : undefined}
                              label={label.name}
                              clickable
                              onClick={() => handleLabelToggle(label._id)}
                              color={isSelected ? "info" : "secondary"}
                              variant={isSelected ? "filled" : "outlined"}
                              sx={{ fontWeight: "bold" }}
                            />
                          );
                        })
                      )}
                    </MDBox>
                  </Grid>

                  {/* Manejo de imágenes */}
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
                        disabled={productLoading || labelsLoading}
                      >
                        Cancelar
                      </MDButton>
                      <MDButton
                        variant="gradient"
                        color="info"
                        type="submit"
                        disabled={productLoading || labelsLoading}
                        sx={{ ml: 2 }}
                      >
                        {productLoading || labelsLoading
                          ? "Actualizando..."
                          : "Actualizar Producto"}
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
