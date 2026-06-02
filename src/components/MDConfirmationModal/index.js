import React from "react";
import PropTypes from "prop-types";

// @mui material components
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function MDConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  content,
  confirmText,
  cancelText,
  loading,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background:
            "linear-gradient(135deg, rgba(49, 0, 138, 0.95) 0%, rgba(49, 0, 138, 0.95) 35%, rgba(168, 85, 247, 0.95) 65%, rgba(247, 37, 133, 0.95) 100%) !important",
          color: "#ffffff",
          borderRadius: { xs: "10px", sm: "15px" },
          padding: { xs: "6px", sm: "10px" },
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          margin: { xs: 2, sm: "auto" },
        },
      }}
    >
      <DialogTitle id="confirmation-dialog-title">
        <MDTypography variant="h5" color="white" fontWeight="medium">
          {title}
        </MDTypography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          <MDTypography variant="body2" color="white" opacity={0.8}>
            {content}
          </MDTypography>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: "20px" }}>
        <MDButton
          onClick={onClose}
          variant="text"
          sx={{
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
          disabled={loading}
        >
          {cancelText || "Cancelar"}
        </MDButton>
        <MDButton
          onClick={onConfirm}
          variant="contained"
          autoFocus
          disabled={loading}
          sx={{
            background: "linear-gradient(90deg, #A855F7 0%, #F72585 100%) !important",
            color: "#ffffff !important",
            fontWeight: "bold",
            textTransform: "uppercase",
            padding: "10px 25px",
            borderRadius: "8px",
            boxShadow: "0 4px 15px rgba(247, 37, 133, 0.3)",
            "&:hover": {
              opacity: 0.9,
              boxShadow: "0 6px 20px rgba(247, 37, 133, 0.4)",
            },
          }}
        >
          {confirmText || "Eliminar"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

MDConfirmationModal.defaultProps = {
  title: "Confirmar Acción",
  content: "¿Estás seguro de que quieres realizar esta acción?",
  confirmText: "Confirmar",
  cancelText: "Cancelar",
  loading: false,
};

MDConfirmationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  content: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  loading: PropTypes.bool,
};

export default MDConfirmationModal;
