import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Context
import { useAdGrid } from "contexts/AdGridContext";

function SlideForm({ itemToEdit, onCancel, onSuccess }) {
  const { createGridItem, updateGridItem, loading, error } = useAdGrid();

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    alt: "",
    order: 0,
    isActive: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        title: itemToEdit.title || "",
        department: itemToEdit.department || "",
        alt: itemToEdit.alt || "",
        order: itemToEdit.order || 0,
        isActive: itemToEdit.isActive !== undefined ? itemToEdit.isActive : true,
      });
      setImagePreview(itemToEdit.image || "");
    }
  }, [itemToEdit]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Auto-generate alt text from title
    if (name === "title" && !formData.alt) {
      setFormData((prev) => ({
        ...prev,
        alt: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no debe exceder los 5MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title || !formData.department || !formData.alt) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    if (!itemToEdit && !imageFile) {
      alert("Por favor selecciona una imagen para el item");
      return;
    }

    if (formData.order < 0) {
      alert("El orden debe ser un número positivo");
      return;
    }

    setFormLoading(true);

    try {
      if (itemToEdit) {
        await updateGridItem(itemToEdit._id, formData, imageFile);
      } else {
        await createGridItem(formData, imageFile);
      }
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <MDBox
      component="form"
      onSubmit={handleSubmit}
      p={3}
      sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}
    >
      <MDTypography variant="h5" fontWeight="medium" mb={3}>
        {itemToEdit ? "Editar Item del Grid" : "Nuevo Item del Grid"}
      </MDTypography>

      {error && (
        <MDBox
          mb={2}
          p={1}
          sx={{ border: "1px solid #f44336", borderRadius: 1, bgcolor: "#ffebee" }}
        >
          <MDTypography color="error" variant="body2">
            Error: {typeof error === "object" ? error.message : error}
          </MDTypography>
        </MDBox>
      )}

      <MDBox mb={2}>
        <MDTypography variant="button" fontWeight="medium">
          Subir Imagen {!itemToEdit && "*"}
        </MDTypography>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ marginTop: "8px" }}
          required={!itemToEdit}
        />
        {imagePreview && (
          <MDBox mt={1}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: "200px",
                maxHeight: "150px",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
              }}
            />
          </MDBox>
        )}
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Título *"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          disabled={formLoading}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Departamento *"
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          required
          disabled={formLoading}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Texto Alternativo (Alt) *"
          name="alt"
          value={formData.alt}
          onChange={handleInputChange}
          required
          disabled={formLoading}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          type="number"
          label="Orden"
          name="order"
          value={formData.order}
          onChange={handleInputChange}
          disabled={formLoading}
          inputProps={{ min: 0, max: 6 }}
        />
      </MDBox>

      <MDBox mb={3} display="flex" alignItems="center">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleInputChange}
          style={{ marginRight: "8px" }}
          disabled={formLoading}
        />
        <MDTypography variant="button" fontWeight="medium">
          Item Activo
        </MDTypography>
      </MDBox>

      <MDBox display="flex" gap={1}>
        <MDButton variant="gradient" color="info" type="submit" disabled={formLoading}>
          {formLoading ? "Guardando..." : itemToEdit ? "Actualizar Item" : "Crear Item"}
        </MDButton>
        <MDButton variant="outlined" color="secondary" onClick={onCancel} disabled={formLoading}>
          Cancelar
        </MDButton>
      </MDBox>
    </MDBox>
  );
}

SlideForm.propTypes = {
  itemToEdit: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    department: PropTypes.string,
    alt: PropTypes.string,
    order: PropTypes.number,
    isActive: PropTypes.bool,
    image: PropTypes.string,
  }),
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

SlideForm.defaultProps = {
  itemToEdit: null,
};

export default SlideForm;
