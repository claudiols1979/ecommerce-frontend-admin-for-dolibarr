// layouts/herovideocarousel/components/VideosTable.js
import React from "react";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React components
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Icon from "@mui/material/Icon";

function MDActionMenu({ video, onEdit, onDelete, onActivate }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="medium" onClick={handleOpen} color="info" sx={{ color: "info.main" }}>
        <MoreVertIcon fontSize="medium" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={(e) => {
            handleClose(e);
            onEdit(video);
          }}
        >
          <MDBox display="flex" alignItems="center">
            <Icon sx={{ mr: 1, color: "info.main" }}>edit</Icon>
            <MDTypography variant="button">Editar</MDTypography>
          </MDBox>
        </MenuItem>
        {!video.isActive && (
          <MenuItem
            onClick={(e) => {
              handleClose(e);
              onActivate(video._id);
            }}
          >
            <MDBox display="flex" alignItems="center">
              <Icon sx={{ mr: 1, color: "success.main" }}>check_circle</Icon>
              <MDTypography variant="button">Activar</MDTypography>
            </MDBox>
          </MenuItem>
        )}
        <MenuItem
          onClick={(e) => {
            handleClose(e);
            onDelete(video._id, video.title);
          }}
        >
          <MDBox display="flex" alignItems="center">
            <Icon sx={{ mr: 1, color: "error.main" }}>delete</Icon>
            <MDTypography variant="button">Eliminar</MDTypography>
          </MDBox>
        </MenuItem>
      </Menu>
    </>
  );
}

MDActionMenu.propTypes = {
  video: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onActivate: PropTypes.func.isRequired,
};

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
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: video.isActive ? "transparent" : "transparent",
            }}
          >
            <MDBox display="flex" alignItems="center" flex={1}>
              <video
                controls
                muted
                preload="metadata"
                poster={`https://placehold.co/120x80/263C5C/FFFFFF?text=Check+Cloudinary`}
                style={{
                  width: "120px",
                  height: "80px",
                  borderRadius: "4px",
                  objectFit: "cover",
                  marginRight: "16px",
                  backgroundColor: "#000",
                }}
              >
                <source
                  src={video.video ? video.video.replace(/^http:\/\//i, "https://") : ""}
                  type="video/mp4"
                />
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
            <MDBox display="flex" alignItems="center">
              <MDActionMenu
                video={video}
                onEdit={onEditVideo}
                onDelete={onDeleteVideo}
                onActivate={onActivateVideo}
              />
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
