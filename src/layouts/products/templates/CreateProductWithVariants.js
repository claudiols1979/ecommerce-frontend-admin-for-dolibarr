/* eslint-disable */
import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { CircularProgress, Checkbox, ListItemText } from "@mui/material";

// @mui icons
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Contexts
import { useMaterialUIController } from "context";
import { useProducts } from "contexts/ProductContext";
import { useLabels } from "contexts/LabelContext"; // Importar el contexto de etiquetas
import { useVariants } from "contexts/VariantContext"; // Importar el contexto de variantes
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import API_URL from "../../../config";

const EMPTY_VARIANT = {
  codeSuffix: "",
  name: "",
  countInStock: 0,
  volume: "",
  colors: [],
  sizes: [],
  materials: [],
  features: [],
  cost: 0, // NEW: Cost field
  description: "", // NEW: Individual description
  resellerPrices: { cat1: 0, cat2: 0, cat3: 0, cat4: 0, cat5: 0 },
};

function CreateProductWithVariants() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const navigate = useNavigate();
  const location = useLocation();
  const templateRow = location.state?.templateProduct;

  const { createProductBatch, getNextBaseCode, loading } = useProducts();
  const { labels, fetchLabels, assignLabelsToProduct, loading: labelsLoading } = useLabels();
  const { attributes, fetchAttributes } = useVariants();

  // Base product shared fields
  const [baseProduct, setBaseProduct] = useState(() => {
    if (templateRow) {
      // Extraer código base si tiene "_"
      const baseCode = templateRow.code ? templateRow.code.split("_")[0] : "";
      return {
        code: baseCode,
        name: templateRow.name || "",
        description: templateRow.description || "",
        department: templateRow.department || "",
        brand: templateRow.brand || "",
        category: templateRow.category || "",
        subcategory: templateRow.subcategory || "",
        iva: templateRow.iva || "13",
        codigoCabys: templateRow.codigoCabys || "",
        gender: templateRow.gender || "unisex",
        tags: templateRow.tags
          ? templateRow.tags.filter((t) => t && t !== "[]" && t.trim() !== "").join(", ")
          : "",
        searchTags: templateRow.searchTags
          ? templateRow.searchTags.filter((t) => t && t !== "[]" && t.trim() !== "").join(", ")
          : "",
        resellerPrices: templateRow.resellerPrices
          ? { ...templateRow.resellerPrices }
          : { cat1: 0, cat2: 0, cat3: 0, cat4: 0, cat5: 0 },
        descriptionImages: templateRow.descriptionImages || [],
        cost: templateRow.cost || 0, // NEW: Cost field
      };
    }
    return {
      code: "",
      name: "",
      description: "",
      department: "",
      brand: "",
      category: "",
      subcategory: "",
      iva: "13",
      codigoCabys: "",
      gender: "unisex",
      tags: "",
      searchTags: "",
      cost: 0, // NEW: Cost field
      resellerPrices: { cat1: 0, cat2: 0, cat3: 0, cat4: 0, cat5: 0 },
      descriptionImages: [],
    };
  });

  // Array of variants
  const [variants, setVariants] = useState([{ ...EMPTY_VARIANT }]);

  // Labels selected
  const [selectedLabelIds, setSelectedLabelIds] = useState([]);

  // Rich Text Editor Modules
  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "clean"],
        ],
        handlers: {
          image: function () {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.click();

            input.onchange = async () => {
              const file = input.files[0];
              if (file) {
                const formData = new FormData();
                formData.append("image", file);

                try {
                  const storedUser = localStorage.getItem("user");
                  const token = storedUser ? JSON.parse(storedUser).token : "";

                  const res = await fetch(`${API_URL}/api/products/upload-description-image`, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                  });
                  const data = await res.json();

                  if (data.success) {
                    const quill = this.quill;
                    const range = quill.getSelection();
                    quill.insertEmbed(range.index, "image", data.secure_url);

                    setBaseProduct((prev) => ({
                      ...prev,
                      descriptionImages: [
                        ...(prev.descriptionImages || []),
                        { public_id: data.public_id, secure_url: data.secure_url },
                      ],
                    }));
                  } else {
                    toast.error(data.message || "Error al subir la imagen.");
                  }
                } catch (err) {
                  console.error("Error upload quill image:", err);
                  toast.error("Error de conexión al subir la imagen.");
                }
              }
            };
          },
        },
      },
    }),
    []
  );

  React.useEffect(() => {
    // Pre-seleccionar etiquetas promocionales si viene de template
    if (templateRow && templateRow.promotionalLabels && templateRow.promotionalLabels.length > 0) {
      setSelectedLabelIds(templateRow.promotionalLabels.map((l) => l._id));
    }
  }, [templateRow]);

  React.useEffect(() => {
    fetchLabels();
    fetchAttributes();

    // Solo generar uno nuevo si NO ES UN CLON (es decir, producto nuevo desde cero)
    if (!templateRow) {
      const fetchNextCode = async () => {
        try {
          const nextCode = await getNextBaseCode();
          if (nextCode) {
            setBaseProduct((prev) => ({ ...prev, code: nextCode }));
          }
        } catch (error) {
          console.error("Error fetching next base code:", error);
        }
      };
      fetchNextCode();
    }
  }, [fetchLabels, fetchAttributes, getNextBaseCode, templateRow]);

  const handleLabelToggle = (labelId) => {
    setSelectedLabelIds((prevSelected) =>
      prevSelected.includes(labelId)
        ? prevSelected.filter((id) => id !== labelId)
        : [...prevSelected, labelId]
    );
  };

  const handleBaseChange = (field) => (e) => {
    const value =
      field === "cost" || field === "weight" || field === "countInStock"
        ? parseFloat(e.target.value) || 0
        : e.target.value;
    setBaseProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleBaseDescriptionChange = (content) => {
    setBaseProduct((prev) => ({ ...prev, description: content }));
  };

  const handleBasePriceChange = (cat) => (e) => {
    setBaseProduct((prev) => ({
      ...prev,
      resellerPrices: { ...prev.resellerPrices, [cat]: parseFloat(e.target.value) || 0 },
    }));
  };

  const handleVariantChange = (index, field) => (e) => {
    const value =
      field === "cost" || field === "weight" || field === "countInStock"
        ? parseFloat(e.target.value) || 0
        : e.target.value;
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleVariantDescriptionChange = (index, content) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], description: content };
      return updated;
    });
  };

  const handleVariantPriceChange = (index, cat) => (e) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        resellerPrices: {
          ...updated[index].resellerPrices,
          [cat]: parseFloat(e.target.value) || 0,
        },
      };
      return updated;
    });
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { ...EMPTY_VARIANT }]);
  };

  const removeVariant = (index) => {
    if (variants.length <= 1) {
      toast.warning("Debe haber al menos una variante.");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const duplicateVariant = (index) => {
    const source = variants[index];
    setVariants((prev) => [
      ...prev,
      {
        ...source,
        codeSuffix: "",
        name: source.name ? `${source.name} (copia)` : "",
      },
    ]);
  };

  const applyBasePricesToAll = () => {
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        resellerPrices: { ...baseProduct.resellerPrices },
      }))
    );
    toast.info("Precios base aplicados a todas las variantes.");
  };

  const getPreviewCode = (variant) => {
    if (!baseProduct.code) return "—";
    const suffix = getAutoSuffix(variant);
    if (!suffix) return baseProduct.code;
    return `${baseProduct.code}_${suffix}`;
  };

  const getAutoSuffix = (variant) => {
    // Build suffix from selected attributes in a specific order: colors -> sizes -> etc.
    const parts = [];
    if (variant.colors && variant.colors.length > 0)
      parts.push(variant.colors.join("-").replace(/\s+/g, "-").toUpperCase());
    if (variant.sizes && variant.sizes.length > 0)
      parts.push(variant.sizes.join("-").replace(/\s+/g, "-").toUpperCase());
    if (variant.materials && variant.materials.length > 0)
      parts.push(variant.materials.join("-").replace(/\s+/g, "-").toUpperCase());
    if (variant.features && variant.features.length > 0)
      parts.push(variant.features.join("-").replace(/\s+/g, "-").toUpperCase());

    return parts.join("_");
  };

  const getAutoName = (variant) => {
    return baseProduct.name || "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!baseProduct.code) {
      toast.error("El código base del producto es requerido.");
      return;
    }
    if (!baseProduct.name) {
      toast.error("El nombre del producto es requerido.");
      return;
    }

    // Validate all variants have auto generated suffix
    const invalidVariants = variants.filter((v, i) => !getAutoSuffix(v) && variants.length > 1);
    if (invalidVariants.length > 0) {
      toast.error(
        "Todas las variantes deben tener al menos un atributo (color, talla, etc.) seleccionado."
      );
      return;
    }

    // Validate all variants have prices
    const missingPrices = variants.filter(
      (v) => !v.resellerPrices?.cat1 && !baseProduct.resellerPrices?.cat1
    );
    if (missingPrices.length > 0) {
      toast.error("Todas las variantes deben tener precios (asigne precios base o individuales).");
      return;
    }

    const batchData = {
      baseProduct: {
        ...baseProduct,
        tags: baseProduct.tags
          ? baseProduct.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        searchTags: baseProduct.searchTags
          ? baseProduct.searchTags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      },
      variants: variants.map((v) => ({
        ...v,
        codeSuffix: getAutoSuffix(v), // Auto override just before saving
        name: getAutoName(v),
        description: v.description || baseProduct.description, // Use variant description or fallback to base
        resellerPrices: v.resellerPrices?.cat1 ? v.resellerPrices : baseProduct.resellerPrices,
        cost: v.cost || baseProduct.cost || 0, // NEW: Use variant cost or fallback to base cost
        countInStock: parseInt(v.countInStock) || 0,
      })),
    };

    try {
      const result = await createProductBatch(batchData);

      // Asignar etiquetas a los productos creados
      if (selectedLabelIds.length > 0 && result.products && result.products.length > 0) {
        for (const prod of result.products) {
          await assignLabelsToProduct(prod._id, selectedLabelIds);
        }
      }

      toast.success(result.message || `${result.created} productos creados exitosamente.`);
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((err) => toast.warning(err));
      }
      navigate("/products");
    } catch (error) {
      toast.error(error.message || "Error al crear productos en lote.");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
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
              >
                <MDTypography variant="h6" color="white">
                  Crear Producto con Variantes
                </MDTypography>
                <MDTypography variant="caption" color="white" opacity={0.8}>
                  Nomenclatura: CÓDIGO-BASE_ATRIBUTO1_ATRIBUTO2 (ej: PERF-2025-01-000001_100ml_Rojo)
                </MDTypography>
              </MDBox>

              <MDBox p={3} component="form" onSubmit={handleSubmit}>
                {/* ===== SECCIÓN: DATOS BASE ===== */}
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  📦 Datos del Producto Base
                </MDTypography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <MDInput
                      label="Código Base *"
                      value={baseProduct.code}
                      onChange={handleBaseChange("code")}
                      fullWidth
                      placeholder="PERF-2025-01-000001"
                      helperText="Sin guiones bajos (_)"
                      sx={{
                        "& .MuiFormHelperText-root": {
                          color: darkMode
                            ? "rgba(255, 255, 255, 0.9) !important"
                            : "text.secondary",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <MDInput
                      label="Nombre del Producto *"
                      value={baseProduct.name}
                      onChange={handleBaseChange("name")}
                      fullWidth
                      placeholder="Perfume Eros Versace"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDTypography variant="caption" color="text" fontWeight="bold">
                      Descripción *
                    </MDTypography>
                    <MDBox
                      mt={1}
                      sx={{
                        "& .quill": {
                          backgroundColor: darkMode ? "#344767" : "#fff",
                          color: darkMode ? "#fff" : "inherit",
                          borderRadius: "8px",
                        },
                        "& .ql-toolbar": {
                          borderColor: darkMode
                            ? "rgba(255, 255, 255, 0.2)"
                            : "rgba(0, 0, 0, 0.23)",
                          borderTopLeftRadius: "8px",
                          borderTopRightRadius: "8px",
                        },
                        "& .ql-container": {
                          borderColor: darkMode
                            ? "rgba(255, 255, 255, 0.2)"
                            : "rgba(0, 0, 0, 0.23)",
                          borderBottomLeftRadius: "8px",
                          borderBottomRightRadius: "8px",
                          minHeight: "150px",
                        },
                        "& .ql-editor": {
                          minHeight: "150px",
                        },
                        "& .ql-stroke": {
                          stroke: darkMode ? "#fff" : "#444",
                        },
                        "& .ql-fill": {
                          fill: darkMode ? "#fff" : "#444",
                        },
                        "& .ql-picker": {
                          color: darkMode ? "#fff !important" : "#444 !important",
                        },
                        "& .ql-picker-options": {
                          backgroundColor: darkMode ? "#344767 !important" : "#fff !important",
                          borderColor: darkMode
                            ? "rgba(255, 255, 255, 0.2) !important"
                            : "rgba(0, 0, 0, 0.23) !important",
                        },
                        "& .ql-picker-item": {
                          color: darkMode ? "#fff !important" : "#444 !important",
                        },
                        "& .ql-picker-item:hover": {
                          color: darkMode ? "#1A73E8 !important" : "#000 !important",
                        },
                      }}
                    >
                      <ReactQuill
                        theme="snow"
                        value={baseProduct.description}
                        onChange={handleBaseDescriptionChange}
                        modules={quillModules}
                      />
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput
                      label="Departamento"
                      value={baseProduct.department}
                      onChange={handleBaseChange("department")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput
                      label="Marca"
                      value={baseProduct.brand}
                      onChange={handleBaseChange("brand")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput
                      label="Categoría"
                      value={baseProduct.category}
                      onChange={handleBaseChange("category")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput
                      label="Subcategoría"
                      value={baseProduct.subcategory}
                      onChange={handleBaseChange("subcategory")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput
                      label="IVA %"
                      value={baseProduct.iva}
                      onChange={handleBaseChange("iva")}
                      fullWidth
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput
                      label="Código CABYS"
                      value={baseProduct.codigoCabys}
                      onChange={handleBaseChange("codigoCabys")}
                      fullWidth
                      placeholder="Código Hacienda"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput
                      select
                      label="Género"
                      value={baseProduct.gender}
                      onChange={handleBaseChange("gender")}
                      fullWidth
                    >
                      <MenuItem value="unisex">Unisex</MenuItem>
                      <MenuItem value="hombre">Hombre</MenuItem>
                      <MenuItem value="mujer">Mujer</MenuItem>
                    </MDInput>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput
                      label="Tags (separados por coma)"
                      value={baseProduct.tags}
                      onChange={handleBaseChange("tags")}
                      fullWidth
                      placeholder="fragancia, lujo, regalo"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput
                      label="Tags Búsqueda (opcional)"
                      value={baseProduct.searchTags}
                      onChange={handleBaseChange("searchTags")}
                      fullWidth
                      placeholder="pantalon, men"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput
                      label="Costo Base (Opcional)"
                      type="number"
                      value={baseProduct.cost}
                      onChange={handleBaseChange("cost")}
                      fullWidth
                      inputProps={{ min: 0, step: "0.01" }}
                    />
                  </Grid>
                </Grid>

                {/* Precios Base */}
                <MDTypography variant="subtitle2" fontWeight="medium" mt={3} mb={1}>
                  💰 Precios Base (se aplican a variantes sin precios propios)
                </MDTypography>
                <Grid container spacing={2}>
                  {["cat1", "cat2", "cat3", "cat4", "cat5"].map((cat) => (
                    <Grid item xs={6} sm={4} md={2.4} key={cat}>
                      <MDInput
                        label={cat.toUpperCase()}
                        type="number"
                        value={baseProduct.resellerPrices[cat]}
                        onChange={handleBasePriceChange(cat)}
                        fullWidth
                        inputProps={{ min: 0, step: "100" }}
                      />
                    </Grid>
                  ))}
                </Grid>

                <MDBox display="flex" justifyContent="flex-end" mt={1}>
                  <MDButton
                    variant="outlined"
                    color="info"
                    size="small"
                    onClick={applyBasePricesToAll}
                  >
                    Aplicar precios a todas las variantes
                  </MDButton>
                </MDBox>

                {/* --- Etiquetas Promocionales --- */}
                <MDTypography variant="subtitle2" fontWeight="medium" mt={3} mb={1}>
                  🏷️ Etiquetas Promocionales (se aplican a todas las variantes)
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

                <Divider sx={{ my: 3 }} />

                {/* ===== SECCIÓN: VARIANTES ===== */}
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <MDTypography variant="h6" fontWeight="medium">
                    🎨 Variantes ({variants.length})
                  </MDTypography>
                  <MDButton
                    variant="gradient"
                    color="success"
                    size="small"
                    onClick={addVariant}
                    startIcon={<AddCircleOutlineIcon />}
                  >
                    Agregar Variante
                  </MDButton>
                </MDBox>

                {variants.map((variant, index) => (
                  <Accordion
                    key={index}
                    defaultExpanded={index === 0}
                    sx={(theme) => ({
                      mb: 1,
                      backgroundColor: `${
                        theme.palette.background.card || theme.palette.background.default
                      } !important`,
                      backgroundImage: "none !important",
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: "none",
                      "&:before": { display: "none" },
                      "& .MuiAccordionSummary-root": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    })}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <MDBox display="flex" alignItems="center" gap={2} width="100%">
                        <MDTypography
                          variant="subtitle2"
                          fontWeight="medium"
                          color={darkMode ? "white" : "dark"}
                        >
                          Variante {index + 1}
                        </MDTypography>
                        <Chip
                          label={getPreviewCode(variant)}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                        {variant.name && (
                          <MDTypography variant="caption" color={darkMode ? "white" : "text"}>
                            {variant.name}
                          </MDTypography>
                        )}
                      </MDBox>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <MDInput
                            label="Sufijo Auto-generado"
                            value={getAutoSuffix(variant)}
                            disabled
                            fullWidth
                            placeholder="Sufijo generado automático..."
                            helperText={`Código final: ${getPreviewCode(variant)}`}
                            sx={{
                              "& .MuiFormHelperText-root": {
                                color: darkMode
                                  ? "rgba(255, 255, 255, 0.9) !important"
                                  : "text.secondary",
                                fontWeight: 500,
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={5}>
                          <MDInput
                            label="Nombre Auto-generado"
                            value={getAutoName(variant)}
                            disabled
                            fullWidth
                            placeholder="Nombre sugerido..."
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <MDInput
                            label="Stock"
                            type="number"
                            value={variant.countInStock}
                            onChange={handleVariantChange(index, "countInStock")}
                            fullWidth
                            inputProps={{ min: 0 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <MDInput
                            label="Costo Variante"
                            type="number"
                            value={variant.cost}
                            onChange={handleVariantChange(index, "cost")}
                            fullWidth
                            placeholder="Dejar 0 para usar base"
                            inputProps={{ min: 0, step: "0.01" }}
                          />
                        </Grid>

                        {/* Dynamic Attributes from Backend (colors, sizes, materials, features) */}
                        {attributes &&
                          attributes.map((attr) => {
                            const refLower = attr.ref ? attr.ref.toLowerCase() : "";
                            let targetRef = refLower;

                            if (refLower.includes("color") || refLower.includes("colores")) {
                              targetRef = "colors";
                            } else if (refLower.includes("size") || refLower.includes("talla")) {
                              targetRef = "sizes";
                            } else if (refLower.includes("material")) {
                              targetRef = "materials";
                            } else {
                              targetRef = "features"; // Atributos extraños van a la lista genérica `features`
                            }

                            return (
                              <Grid item xs={12} md={4} key={attr._id}>
                                <MDInput
                                  select
                                  SelectProps={{
                                    displayEmpty: true,
                                    MenuProps: { PaperProps: { style: { maxHeight: 350 } } },
                                  }}
                                  label={`Seleccionar ${attr.name}`}
                                  value={
                                    variant[targetRef] && variant[targetRef].length > 0
                                      ? variant[targetRef][0]
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const { value } = e.target;
                                    setVariants((prev) => {
                                      const updated = [...prev];
                                      updated[index] = {
                                        ...updated[index],
                                        [targetRef]: value ? [value] : [],
                                      };
                                      return updated;
                                    });
                                  }}
                                  fullWidth
                                  InputLabelProps={{
                                    shrink: true, // Esto fuerza el label a estar siempre arriba
                                  }}
                                >
                                  <MenuItem value="">
                                    {/* <em>Seleccione una opción...</em> */}
                                  </MenuItem>
                                  {Array.isArray(attr.values) &&
                                    attr.values.map((v) => (
                                      <MenuItem key={v._id || v.value} value={v.value}>
                                        {v.value}
                                      </MenuItem>
                                    ))}
                                </MDInput>
                              </Grid>
                            );
                          })}

                        {/* Variant-specific prices */}
                        <Grid item xs={12}>
                          <MDTypography
                            variant="caption"
                            color={darkMode ? "white" : "text"}
                            fontWeight="medium"
                          >
                            Precios específicos (dejar en 0 para usar precios base):
                          </MDTypography>
                        </Grid>
                        {["cat1", "cat2", "cat3", "cat4", "cat5"].map((cat) => (
                          <Grid item xs={6} sm={4} md={2.4} key={cat}>
                            <MDInput
                              label={cat.toUpperCase()}
                              type="number"
                              value={variant.resellerPrices[cat]}
                              onChange={handleVariantPriceChange(index, cat)}
                              fullWidth
                              inputProps={{ min: 0, step: "100" }}
                            />
                          </Grid>
                        ))}

                        {/* Descripción Individual de la Variante */}
                        <Grid item xs={12} mt={2}>
                          <MDBox display="flex" justifyContent="space-between" alignItems="center">
                            <MDTypography variant="caption" color="text" fontWeight="bold">
                              Descripción de la Variante (Opcional)
                            </MDTypography>
                            {baseProduct.description && (
                              <MDButton
                                variant="text"
                                color="info"
                                size="small"
                                onClick={() =>
                                  handleVariantDescriptionChange(index, baseProduct.description)
                                }
                              >
                                <ContentCopyIcon sx={{ mr: 1 }} /> Copiar descripción base
                              </MDButton>
                            )}
                          </MDBox>
                          <MDTypography variant="caption" color="text" display="block" mb={1}>
                            Si se deja vacío, se usará la descripción del producto base
                            automáticamente.
                          </MDTypography>
                          <MDBox
                            sx={{
                              "& .quill": {
                                backgroundColor: darkMode ? "#344767" : "#fff",
                                color: darkMode ? "#fff" : "inherit",
                                borderRadius: "8px",
                              },
                              "& .ql-toolbar": {
                                borderColor: darkMode
                                  ? "rgba(255, 255, 255, 0.2)"
                                  : "rgba(0, 0, 0, 0.23)",
                                borderTopLeftRadius: "8px",
                                borderTopRightRadius: "8px",
                              },
                              "& .ql-container": {
                                borderColor: darkMode
                                  ? "rgba(255, 255, 255, 0.2)"
                                  : "rgba(0, 0, 0, 0.23)",
                                borderBottomLeftRadius: "8px",
                                borderBottomRightRadius: "8px",
                                minHeight: "100px",
                              },
                              "& .ql-editor": {
                                minHeight: "100px",
                              },
                              "& .ql-stroke": {
                                stroke: darkMode ? "#fff" : "#444",
                              },
                              "& .ql-fill": {
                                fill: darkMode ? "#fff" : "#444",
                              },
                              "& .ql-stroke.ql-thin, & .ql-stroke.ql-round": {
                                stroke: darkMode ? "#fff" : "#444",
                              },
                            }}
                          >
                            <ReactQuill
                              theme="snow"
                              value={variant.description || ""}
                              onChange={(content) => handleVariantDescriptionChange(index, content)}
                              modules={quillModules}
                              placeholder="Escribe una descripción específica para esta variante o deja vacío para usar la base..."
                            />
                          </MDBox>
                        </Grid>
                      </Grid>

                      {/* Actions */}
                      <MDBox display="flex" justifyContent="flex-end" gap={1} mt={2}>
                        <MDButton
                          variant="outlined"
                          color="info"
                          size="small"
                          onClick={() => duplicateVariant(index)}
                          startIcon={<ContentCopyIcon />}
                        >
                          Duplicar
                        </MDButton>
                        <MDButton
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => removeVariant(index)}
                          startIcon={<RemoveCircleOutlineIcon />}
                          disabled={variants.length <= 1}
                        >
                          Eliminar
                        </MDButton>
                      </MDBox>
                    </AccordionDetails>
                  </Accordion>
                ))}

                <Divider sx={{ my: 3 }} />

                {/* ===== ACCIONES ===== */}
                <MDBox
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  gap={2}
                >
                  <MDButton
                    variant="outlined"
                    color="dark"
                    onClick={() => navigate("/products")}
                    disabled={loading}
                    fullWidth
                    sx={{ width: { sm: "auto" } }}
                  >
                    Cancelar
                  </MDButton>
                  <MDButton
                    variant="gradient"
                    color="info"
                    type="submit"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    fullWidth
                    sx={{ width: { sm: "auto" } }}
                  >
                    {loading
                      ? "Creando..."
                      : `Crear ${variants.length} Producto${variants.length > 1 ? "s" : ""}`}
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CreateProductWithVariants;
