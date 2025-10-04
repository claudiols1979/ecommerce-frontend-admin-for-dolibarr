// layouts/herovideocarousel/components/VideosTable.js
import React from "react";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React components
import Card from "@mui/material/Card";

function VideosTable({ videos, loading, onEditVideo, onDeleteVideo, onActivateVideo }) {
  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography>Loading videos...</MDTypography>
        </MDBox>
      </Card>
    );
  }

  if (videos.length === 0) {
    return (
      <Card>
        <MDBox p={3} textAlign="center">
          <MDTypography variant="h6" color="text">
            No videos uploaded yet
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={1}>
            Click &quot;Upload Video&quot; to add your first video
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" gutterBottom>
          Video Management
        </MDTypography>
        {videos.map((video) => (
          <MDBox
            key={video._id}
            p={2}
            mb={2}
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: video.isActive ? "transparent" : "transparent",
            }}
          >
            <MDBox display="flex" alignItems="center" flex={1}>
              <video
                style={{
                  width: "120px",
                  height: "80px",
                  borderRadius: "4px",
                  objectFit: "cover",
                  marginRight: "16px",
                }}
                controls
              >
                <source src={video.video} type="video/mp4" />
              </video>
              <MDBox flex={1}>
                <MDBox display="flex" alignItems="center" mb={1}>
                  <MDTypography variant="h6" fontWeight="medium">
                    {video.title}
                  </MDTypography>
                  {video.isActive && (
                    <MDTypography
                      variant="caption"
                      color="white"
                      fontWeight="medium"
                      sx={{
                        ml: 1,
                        px: 1,
                        py: 0.5,
                        backgroundColor: "success.main",
                        color: "primary",
                        borderRadius: 1,
                      }}
                    >
                      ACTIVO
                    </MDTypography>
                  )}
                </MDBox>
                <MDTypography variant="body2" color="text">
                  {video.subtitle}
                </MDTypography>
                <MDBox display="flex" alignItems="center" mt={1}>
                  <MDTypography variant="caption" color="text">
                    Duration: {video.duration ? Math.round(video.duration) + "s" : "N/A"}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
            <MDBox display="flex" gap={1} flexDirection="column">
              {!video.isActive && (
                <MDButton
                  variant="gradient"
                  color="success"
                  size="small"
                  onClick={() => onActivateVideo(video._id)}
                >
                  Activar
                </MDButton>
              )}
              <MDBox display="flex" gap={1}>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() => onEditVideo(video)}
                >
                  Editar
                </MDButton>
                <MDButton
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => onDeleteVideo(video._id, video.title)}
                >
                  Eliminar
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        ))}
      </MDBox>
    </Card>
  );
}

VideosTable.propTypes = {
  videos: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  onEditVideo: PropTypes.func.isRequired,
  onDeleteVideo: PropTypes.func.isRequired,
  onActivateVideo: PropTypes.func.isRequired,
};

export default VideosTable;
