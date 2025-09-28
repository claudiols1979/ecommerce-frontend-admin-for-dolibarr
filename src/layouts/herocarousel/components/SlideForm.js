import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Context
import { useHeroCarousel } from "contexts/HeroCarouselContext";

function SlideForm({ slide, onClose, onSuccess }) {
  const { createSlide, updateSlide, loading, error } = useHeroCarousel();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    alt: "",
    buttonText: "Ver Productos",
    buttonLink: "/products",
    order: 0,
    isActive: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formLoading, setFormLoading] = useState(false); // Local loading state

  useEffect(() => {
    if (slide) {
      setFormData({
        title: slide.title || "",
        description: slide.description || "",
        alt: slide.alt || "",
        buttonText: slide.buttonText || "Ver Productos",
        buttonLink: slide.buttonLink || "/products",
        order: slide.order || 0,
        isActive: slide.isActive !== undefined ? slide.isActive : true,
      });
      setImagePreview(slide.image || "");
    }
  }, [slide]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    if (!formData.title || !formData.description || !formData.alt) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    if (!slide && !imageFile) {
      alert("Por favor selecciona una imagen para el slide");
      return;
    }

    setFormLoading(true);

    try {
      if (slide) {
        await updateSlide(slide._id, formData, imageFile);
      } else {
        await createSlide(formData, imageFile);
      }
      onSuccess();
    } catch (error) {
      // Error is handled by context, we just need to reset local loading state
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
        {slide ? "Edit Slide" : "Create New Slide"}
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
          Image Upload {!slide && "*"}
        </MDTypography>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ marginTop: "8px" }}
          required={!slide} // Required only for new slides
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
          label="Title *"
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
          label="Description *"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          multiline
          rows={3}
          required
          disabled={formLoading}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Alt Text *"
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
          label="Button Text"
          name="buttonText"
          value={formData.buttonText}
          onChange={handleInputChange}
          disabled={formLoading}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Button Link"
          name="buttonLink"
          value={formData.buttonLink}
          onChange={handleInputChange}
          disabled={formLoading}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          type="number"
          label="Order"
          name="order"
          value={formData.order}
          onChange={handleInputChange}
          disabled={formLoading}
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
          Active Slide
        </MDTypography>
      </MDBox>

      <MDBox display="flex" gap={1}>
        <MDButton variant="gradient" color="info" type="submit" disabled={formLoading}>
          {formLoading ? "Saving..." : slide ? "Update Slide" : "Create Slide"}
        </MDButton>
        <MDButton variant="outlined" color="secondary" onClick={onClose} disabled={formLoading}>
          Cancel
        </MDButton>
      </MDBox>
    </MDBox>
  );
}

SlideForm.propTypes = {
  slide: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    alt: PropTypes.string,
    buttonText: PropTypes.string,
    buttonLink: PropTypes.string,
    order: PropTypes.number,
    isActive: PropTypes.bool,
    image: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

SlideForm.defaultProps = {
  slide: null,
};

export default SlideForm;
