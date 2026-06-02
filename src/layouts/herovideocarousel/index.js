// layouts/herovideocarousel/index.js
import React, { useState, useEffect } from "react";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Material UI components
// (None needed)

// Hero Video Carousel components
import VideosTable from "layouts/herovideocarousel/components/VideosTable";
import VideoForm from "layouts/herovideocarousel/components/VideoForm";
import MDConfirmationModal from "components/MDConfirmationModal";

// Context
import { useVideo } from "contexts/VideoContext";

function HeroVideoCarousel() {
  const {
    videos,
    loading,
    error,
    fetchAllVideos,
    deleteVideo,
    activateVideo, // ← Asegúrate de obtener activateVideo del contexto
  } = useVideo();

  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, videoId: null, videoTitle: "" });

  useEffect(() => {
    fetchAllVideos();
  }, []);

  const handleCreateVideo = () => {
    setEditingVideo(null);
    setShowForm(true);
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setShowForm(true);
  };

  const handleOpenDeleteDialog = (videoId, videoTitle) => {
    setDeleteDialog({
      open: true,
      videoId,
      videoTitle,
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, videoId: null, videoTitle: "" });
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.videoId) {
      try {
        await deleteVideo(deleteDialog.videoId);
        handleCloseDeleteDialog();
      } catch (error) {
        console.error("Error deleting video:", error);
      }
    }
  };

  const handleActivateVideo = async (videoId) => {
    try {
      console.log("🎯 Activando video:", videoId);
      await activateVideo(videoId);
      console.log("✅ Video activado exitosamente");
    } catch (error) {
      console.error("💥 Error activando video:", error);
      // El error ya se maneja en el contexto
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVideo(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingVideo(null);
    fetchAllVideos();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          mb={3}
          gap={2}
        >
          <MDTypography variant="h4" fontWeight="medium">
            Administrador Video Carousel
          </MDTypography>
          <MDButton
            variant="gradient"
            color="info"
            onClick={handleCreateVideo}
            disabled={loading}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Subir Video
          </MDButton>
        </MDBox>

        {error && !error.includes("fetching") && (
          <MDBox
            mb={3}
            p={2}
            sx={{ border: "1px solid", borderColor: "error.main", borderRadius: 1 }}
          >
            <MDTypography color="error" variant="body2">
              Error: {error}
            </MDTypography>
          </MDBox>
        )}

        {showForm ? (
          <VideoForm video={editingVideo} onClose={handleFormClose} onSuccess={handleFormSuccess} />
        ) : (
          <VideosTable
            videos={videos}
            loading={loading}
            onEditVideo={handleEditVideo}
            onDeleteVideo={handleOpenDeleteDialog}
            onActivateVideo={handleActivateVideo}
          />
        )}

        <MDConfirmationModal
          open={deleteDialog.open}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Confirmar Eliminación"
          content={`¿Estás seguro de que quieres eliminar el video "${deleteDialog.videoTitle}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          loading={loading}
        />
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default HeroVideoCarousel;
