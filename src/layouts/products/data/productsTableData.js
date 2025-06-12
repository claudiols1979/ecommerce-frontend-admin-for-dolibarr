// frontend/src/layouts/products/data/productsTableData.js

/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */

import React, { useState } from "react"; // Import useState for dialog state
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate
import { toast } from "react-toastify"; // Import toast for notifications

// @mui material components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";
import Dialog from "@mui/material/Dialog"; // For confirmation dialog
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MDButton from "components/MDButton"; // For dialog buttons

// @mui icons
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";

// Contexts
import { useProducts } from "contexts/ProductContext"; // To access deleteProduct
import { useAuth } from "contexts/AuthContext"; // To get user role for permissions

// You might need a default image if products don't have one
import defaultProductImage from "assets/images/default-product.png";

// Helper component for product info (Name, Brand, and now a Link to details)
const ProductCell = ({ image, name, brand, productId }) => (
  <MDBox display="flex" alignItems="center" lineHeight={1}>
    <MDAvatar src={image || defaultProductImage} name={name} size="xs" />
    <MDBox ml={2} lineHeight={1}>
      {/* Make the product name a Link to the details page */}
      <MDTypography
        component={Link}
        to={`/products/details/${productId}`}
        display="block"
        variant="button"
        fontWeight="medium"
        color="info"
        sx={{ "&:hover": { textDecoration: "underline" } }}
      >
        {name}
      </MDTypography>
      <MDTypography variant="caption">{brand}</MDTypography>
    </MDBox>
  </MDBox>
);

// Helper for Status Badge - Now incorporates stock logic
const StatusBadge = ({ active, countInStock }) => {
  const isActive = active && countInStock > 0;
  const badgeText = isActive ? "Activo" : "Inactivo";
  const badgeColor = isActive ? "success" : "dark";

  return (
    <MDBox ml={-1}>
      <MDBadge badgeContent={badgeText} color={badgeColor} variant="gradient" size="sm" />
    </MDBox>
  );
};

// Standalone ActionButtons component to handle edit and delete actions
const ActionButtons = ({ productId }) => {
  const navigate = useNavigate();
  const { deleteProduct, loading, error } = useProducts(); // Get deleteProduct, loading, error from context
  const { user } = useAuth(); // Get authenticated user for role check

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Handle delete confirmation dialog
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    setOpenDeleteDialog(false); // Close dialog immediately
    try {
      if (user?.role !== "Administrador") {
        toast.error("No tienes permiso para eliminar productos.");
        return;
      }
      if (typeof deleteProduct !== "function") {
        toast.error("Error interno: la función de eliminación de producto no está disponible.");
        return;
      }
      await deleteProduct(productId); // Call the delete function from context
      toast.success("Producto eliminado exitosamente!");
      // No need to navigate here, getProducts in ProductContext will refresh the table.
    } catch (err) {
      toast.error(error?.message || "Error al eliminar el producto.");
      console.error("Error deleting product from table:", err);
    }
  };

  const isAdmin = user?.role === "Administrador";

  return (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      {/* Edit Icon */}
      <MDTypography
        component={Link}
        to={`/products/edit/${productId}`}
        variant="caption"
        color="text"
        fontWeight="medium"
        sx={{ cursor: "pointer", marginRight: 1 }}
      >
        <Edit color="info" sx={{ fontSize: "24px" }} />
      </MDTypography>

      {/* Delete Icon (only visible to Admin) */}
      {isAdmin && (
        <MDTypography
          component="a"
          href="#"
          variant="caption"
          color="text"
          fontWeight="medium"
          onClick={handleDeleteClick} // Open dialog on click
          sx={{ cursor: "pointer" }}
        >
          <Delete color="error" sx={{ fontSize: "24px" }} />
        </MDTypography>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: (theme) => ({
            // Force a very obvious dark background if in dark mode
            backgroundColor:
              theme.palette.mode === "dark" ? "#1A2027" : theme.palette.background.paper, // A very dark gray/black
            // Force a very obvious light text color if in dark mode
            color: theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary, // A light gray
          }),
        }}
      >
        <DialogTitle id="alert-dialog-title">
          <MDTypography
            variant="h6"
            color={(theme) =>
              theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary
            }
          >
            {"Confirmar Eliminación"}
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <MDTypography
              variant="body2"
              color={(theme) =>
                theme.palette.mode === "dark" ? "#E0E0E0" : theme.palette.text.primary
              }
            >
              ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
            </MDTypography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton
            onClick={handleCloseDeleteDialog}
            color="dark"
            variant="text"
            disabled={loading}
          >
            Cancelar
          </MDButton>
          <MDButton
            onClick={handleConfirmDelete}
            color="error"
            variant="gradient"
            autoFocus
            disabled={loading}
          >
            Eliminar
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
};

// Main productsTableData function
export default function productsTableData(products, userResellerCategory = "cat1") {
  return {
    columns: [
      { Header: "producto", accessor: "product", width: "30%", align: "left" },
      { Header: "categoría", accessor: "category", align: "left" },
      { Header: "volumen", accessor: "volume", align: "center" },
      { Header: "precio", accessor: "price", align: "right" },
      { Header: "en inventario", accessor: "inStock", align: "center" },
      { Header: "estado", accessor: "status", align: "center" },
      { Header: "acción", accessor: "action", align: "center" },
    ],

    rows: products.map((product) => {
      const displayPrice =
        product.resellerPrices?.[userResellerCategory] || product.resellerPrices?.cat1;
      const formattedPrice =
        displayPrice?.toLocaleString("es-CR", {
          style: "currency",
          currency: "CRC",
        }) || "N/A";

      return {
        product: (
          <ProductCell
            image={
              product.imageUrls && product.imageUrls.length > 0
                ? product.imageUrls[0].secure_url
                : null
            }
            name={product.name}
            brand={product.brand}
            productId={product._id}
          />
        ),
        category: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {product.category}
          </MDTypography>
        ),
        volume: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {product.volume}
          </MDTypography>
        ),
        price: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {formattedPrice}
          </MDTypography>
        ),
        inStock: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {product.countInStock}
          </MDTypography>
        ),
        status: <StatusBadge active={product.active} countInStock={product.countInStock} />,
        action: <ActionButtons productId={product._id} />, // Render the new ActionButtons component
      };
    }),
  };
}
