// layouts/herovideocarousel/components/VideoForm.js
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Context
import { useVideo } from "contexts/VideoContext";

// Configuración de Cloudinary
const CLOUDINARY_CONFIG = {
  cloudName: "dl4k0gqfv",
  uploadPreset: "video_hero_upload",
};

function VideoForm({ video, onClose, onSuccess }) {
  const { createVideo, updateVideo, loading, error } = useVideo();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    alt: "",
    buttonText: "Ver Productos",
    buttonLink: "/products",
    order: 0,
    isActive: true,
  });

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || "",
        description: video.subtitle || "", // subtitle se convierte en description
        buttonText: video.buttonText || "Explorar Productos",
        buttonLink: video.buttonLink || "/products",
        isActive: video.isActive !== undefined ? video.isActive : true,
      });
      setVideoPreview(video.video || ""); // El campo se llama 'video' no 'videoUrl'
    }
  }, [video]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("📁 Archivo seleccionado:", file.name, file.size, file.type);

      if (!file.type.startsWith("video/")) {
        alert("Por favor selecciona un archivo de video válido");
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        alert("El video no puede ser mayor a 100MB");
        return;
      }

      setVideoFile(file);
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
    }
  };

  const uploadToCloudinary = async (file) => {
    console.log("🚀 Iniciando upload a Cloudinary...");
    console.log("📊 Config:", CLOUDINARY_CONFIG);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("resource_type", "video");
    formData.append("tags", "ecommerce,video_hero,perfumes");

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded * 100) / e.total);
          console.log(`📤 Progreso: ${progress}%`);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        console.log("📨 Respuesta de Cloudinary - Status:", xhr.status);

        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          console.log("✅ Upload exitoso:", response);
          resolve({
            url: response.secure_url,
            publicId: response.public_id,
            duration: response.duration,
            format: response.format,
            bytes: response.bytes,
          });
        } else {
          console.error("❌ Error en upload:", xhr.responseText);
          let errorMessage = "Error subiendo a Cloudinary";
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.error?.message || errorMessage;
          } catch (e) {
            errorMessage = xhr.responseText || errorMessage;
          }
          reject(new Error(errorMessage));
        }
      });

      xhr.addEventListener("error", () => {
        console.error("❌ Error de conexión con Cloudinary");
        reject(new Error("Error de conexión con Cloudinary"));
      });

      xhr.addEventListener("abort", () => {
        console.error("❌ Upload cancelado");
        reject(new Error("Upload cancelado"));
      });

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/video/upload`;
      console.log("🌐 URL de upload:", uploadUrl);

      xhr.open("POST", uploadUrl);
      xhr.send(formData);
    });
  };

  // En el handleSubmit del VideoForm.js - busca esta parte y reemplázala:
  // En el handleSubmit del VideoForm.js - REEMPLAZA esta parte:
  // En VideoForm.js - ACTUALIZA el handleSubmit:
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🎯 Iniciando submit...");

    // Validaciones específicas para el backend
    if (!formData.title) {
      alert("El título es requerido");
      return;
    }

    if (!formData.description) {
      alert("El subtítulo es requerido (se usará como subtitle)");
      return;
    }

    if (!video && !videoFile) {
      alert("Por favor selecciona un video");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let videoUrl = video?.video;
      let publicId = video?.publicId;
      let videoMetadata = {};

      // Subir video si es nuevo o se está reemplazando
      if (videoFile) {
        console.log("📤 Subiendo video file:", videoFile.name);
        videoMetadata = await uploadToCloudinary(videoFile);
        videoUrl = videoMetadata.url;
        publicId = videoMetadata.publicId;
        console.log("✅ Video subido exitosamente:", videoMetadata);
      }

      // FORMATO EXACTO que espera el backend
      const videoData = {
        videoUrl: videoUrl, // REQUERIDO
        title: formData.title, // REQUERIDO
        subtitle: formData.description, // REQUERIDO - description se convierte en subtitle
        buttonText: formData.buttonText || "Explorar Productos",
        buttonLink: formData.buttonLink || "/products",
        isActive: formData.isActive, // Para mantener o cambiar el estado activo
      };

      console.log("📤 Enviando datos al backend:", videoData);

      if (video) {
        await updateVideo(video._id, videoData);
      } else {
        await createVideo(videoData);
      }

      console.log("🎉 Proceso completado exitosamente");
      onSuccess();
    } catch (error) {
      console.error("💥 Error en el proceso:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
        {video ? "Editar Video" : "Subir Nuevo Video"}
      </MDTypography>

      {/* Info de Cloudinary configurado - SIN LA ALERTA ESTÚPIDA */}
      {/* <MDBox mb={2} p={2} sx={{ border: "1px solid #4caf50", borderRadius: 1, bgcolor: "#e8f5e8" }}>
        <MDTypography color="success" variant="body2" fontWeight="medium">
          ✅ Cloudinary Configurado
        </MDTypography>
        <MDTypography variant="caption" color="text">
          Cloud Name: {CLOUDINARY_CONFIG.cloudName}
          <br />
          Upload Preset: {CLOUDINARY_CONFIG.uploadPreset}
        </MDTypography>
      </MDBox> */}

      {error && (
        <MDBox
          mb={2}
          p={1}
          sx={{ border: "1px solid #f44336", borderRadius: 1, bgcolor: "#ffebee" }}
        >
          <MDTypography color="error" variant="body2">
            Error: {error}
          </MDTypography>
        </MDBox>
      )}

      <MDBox mb={3}>
        <MDTypography variant="button" fontWeight="medium">
          Video {!video && "*"}
        </MDTypography>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          style={{
            marginTop: "8px",
            padding: "8px",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            width: "100%",
          }}
          required={!video}
          disabled={isUploading}
        />

        {/* Progress Bar */}
        {isUploading && (
          <MDBox mt={1}>
            <MDTypography variant="caption" color="text">
              Subiendo a Cloudinary: {uploadProgress}%
            </MDTypography>
            <MDBox
              sx={{
                width: "100%",
                height: "8px",
                backgroundColor: "#f0f0f0",
                borderRadius: "4px",
                overflow: "hidden",
                mt: 0.5,
              }}
            >
              <MDBox
                sx={{
                  width: `${uploadProgress}%`,
                  height: "100%",
                  backgroundColor: "info.main",
                  transition: "width 0.3s ease",
                }}
              />
            </MDBox>
          </MDBox>
        )}

        {videoPreview && (
          <MDBox mt={2}>
            <video
              controls
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
              }}
            >
              <source src={videoPreview} type="video/mp4" />
              Tu navegador no soporta videos.
            </video>
          </MDBox>
        )}
      </MDBox>

      {/* Resto del formulario... */}
      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Título *"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          disabled={isUploading}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Descripción *"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          multiline
          rows={3}
          required
          disabled={isUploading}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Texto Alternativo *"
          name="alt"
          value={formData.title}
          onChange={handleInputChange}
          required
          disabled={isUploading}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Texto del Botón"
          name="buttonText"
          value={formData.buttonText}
          onChange={handleInputChange}
          disabled={isUploading}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Enlace del Botón"
          name="buttonLink"
          value={formData.buttonLink}
          onChange={handleInputChange}
          disabled={isUploading}
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
          disabled={isUploading}
        />
      </MDBox>

      <MDBox mb={3} display="flex" alignItems="center">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleInputChange}
          style={{ marginRight: "8px" }}
          disabled={isUploading}
        />
        <MDTypography variant="button" fontWeight="medium">
          Video Activo
        </MDTypography>
      </MDBox>

      <MDBox display="flex" gap={1}>
        <MDButton variant="gradient" color="info" type="submit" disabled={isUploading || loading}>
          {isUploading
            ? "Subiendo..."
            : loading
            ? "Guardando..."
            : video
            ? "Actualizar Video"
            : "Subir Video"}
        </MDButton>
        <MDButton variant="outlined" color="secondary" onClick={onClose} disabled={isUploading}>
          Cancelar
        </MDButton>
      </MDBox>
    </MDBox>
  );
}

VideoForm.propTypes = {
  video: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string, // Cambiado de description a subtitle
    buttonText: PropTypes.string,
    buttonLink: PropTypes.string,
    isActive: PropTypes.bool,
    video: PropTypes.string, // Cambiado de videoUrl a video
    publicId: PropTypes.string,
    duration: PropTypes.number,
    format: PropTypes.string,
    size: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default VideoForm;
