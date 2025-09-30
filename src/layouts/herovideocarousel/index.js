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
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Hero Video Carousel components
import VideosTable from "layouts/herovideocarousel/components/VideosTable";
import VideoForm from "layouts/herovideocarousel/components/VideoForm";

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
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Video Carousel Management
          </MDTypography>
          <MDButton variant="gradient" color="info" onClick={handleCreateVideo} disabled={loading}>
            Upload Video
          </MDButton>
        </MDBox>

        {error && !error.includes("fetching") && (
          <MDBox
            mb={3}
            p={2}
            sx={{ border: "1px solid #f44336", borderRadius: 1, bgcolor: "#ffebee" }}
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

        {/* Dialog de confirmación para eliminar */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              ¿Estás seguro de que quieres eliminar el video &quot;{deleteDialog.videoTitle}&quot;?
              Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCloseDeleteDialog} color="secondary">
              Cancelar
            </MDButton>
            <MDButton onClick={handleConfirmDelete} color="error" autoFocus>
              Eliminar
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default HeroVideoCarousel;
