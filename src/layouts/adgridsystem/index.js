import React, { useState, useEffect } from "react";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Ad Grid System components
import SlidesTable from "./components/SlidesTable";
import SlideForm from "./components/SlideForm";
import ReorderDialog from "./components/ReorderDialog";

// Context
import { useAdGrid } from "contexts/AdGridContext";

function AdGridSystem() {
  const { gridItems, loading, error, fetchAllGridItems, reorderGridItems } = useAdGrid();
  const [showForm, setShowForm] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchAllGridItems();
  }, [fetchAllGridItems]);

  const handleCreateItem = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchAllGridItems();
  };

  const handleReorder = () => {
    setShowReorder(true);
  };

  const handleReorderClose = () => {
    setShowReorder(false);
  };

  const handleReorderSave = async (reorderedItems) => {
    try {
      const itemsOrder = reorderedItems.map((item, index) => ({
        id: item._id,
        order: index,
      }));

      await reorderGridItems(itemsOrder);
      setShowReorder(false);
      fetchAllGridItems();
    } catch (error) {
      console.error("Error saving reorder:", error);
    }
  };

  const handleRetry = () => {
    fetchAllGridItems().catch(() => {});
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Grid de Departamentos
          </MDTypography>
          <MDBox display="flex" gap={1}>
            <MDButton
              variant="outlined"
              color="info"
              onClick={handleReorder}
              disabled={loading || gridItems.length === 0}
            >
              Reordenar
            </MDButton>
            <MDButton variant="gradient" color="info" onClick={handleCreateItem} disabled={loading}>
              Nuevo Item
            </MDButton>
          </MDBox>
        </MDBox>

        {error && (
          <MDBox
            mb={3}
            p={2}
            sx={{ border: "1px solid #f44336", borderRadius: 1, bgcolor: "#ffebee" }}
          >
            <MDTypography color="error" variant="body2" gutterBottom>
              Error: {typeof error === "object" ? error.message : error}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Por favor verifica que el servidor backend esté ejecutándose y los endpoints de API
              sean correctos.
            </MDTypography>
            <MDBox mt={1}>
              <MDButton variant="outlined" color="error" size="small" onClick={handleRetry}>
                Reintentar
              </MDButton>
            </MDBox>
          </MDBox>
        )}

        {showForm ? (
          <SlideForm
            itemToEdit={editingItem}
            onCancel={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        ) : (
          <SlidesTable onEdit={handleEditItem} onReorder={handleReorder} />
        )}

        {/* Reorder Dialog */}
        <ReorderDialog
          open={showReorder}
          onClose={handleReorderClose}
          onSave={handleReorderSave}
          items={gridItems}
          loading={loading}
        />
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AdGridSystem;
