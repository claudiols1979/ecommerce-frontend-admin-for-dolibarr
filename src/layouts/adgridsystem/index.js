import React, { useState, useEffect, useMemo } from "react";

// @mui material components
import { Grid, Icon, MenuItem, InputAdornment, IconButton } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDPagination from "components/MDPagination";
import MDInput from "components/MDInput";

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
import { useMaterialUIController } from "context";

function AdGridSystem() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const { gridItems, loading, error, fetchAllGridItems, reorderGridItems } = useAdGrid();
  const [showForm, setShowForm] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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

  // Filter and Pagination logic
  const filteredItems = useMemo(() => {
    if (!searchTerm) return gridItems;
    const lowerSearch = searchTerm.toLowerCase();
    return gridItems.filter(
      (item) =>
        item.title?.toLowerCase().includes(lowerSearch) ||
        item.department?.toLowerCase().includes(lowerSearch)
    );
  }, [gridItems, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedItems = useMemo(() => {
    return filteredItems.slice(startIndex, startIndex + limit);
  }, [filteredItems, startIndex, limit]);

  const handlePageChange = (p) => setPage(p);

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(1);
  };
  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
    setPage(1);
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
            Grid de Departamentos
          </MDTypography>
          <MDBox
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={1}
            width={{ xs: "100%", sm: "auto" }}
          >
            <MDButton
              variant="outlined"
              color="info"
              onClick={handleReorder}
              disabled={loading || gridItems.length === 0}
              fullWidth
              sx={{ width: { sm: "auto" } }}
            >
              Reordenar
            </MDButton>
            <MDButton
              variant="gradient"
              color="info"
              onClick={handleCreateItem}
              disabled={loading}
              fullWidth
              sx={{ width: { sm: "auto" } }}
            >
              Nuevo Item
            </MDButton>
          </MDBox>
        </MDBox>

        {!showForm && (
          <MDBox mb={3}>
            <MDInput
              label="Buscar item..."
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {searchTerm && (
                      <IconButton onClick={handleClearSearch} size="small" sx={{ mr: 1 }}>
                        <Icon sx={{ color: darkMode ? "white.main" : "inherit" }}>close</Icon>
                      </IconButton>
                    )}
                    <Icon sx={{ color: darkMode ? "white.main" : "inherit" }}>search</Icon>
                  </InputAdornment>
                ),
              }}
            />
          </MDBox>
        )}

        {error && (
          <MDBox
            mb={3}
            p={2}
            sx={{ border: "1px solid", borderColor: "error.main", borderRadius: 1 }}
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
          <>
            <SlidesTable
              gridItems={paginatedItems}
              loading={loading}
              onEdit={handleEditItem}
              onReorder={handleReorder}
            />
            <MDBox display="flex" justifyContent="center" alignItems="center" p={3}>
              {totalPages > 1 && (
                <MDPagination variant="gradient" color="info">
                  <MDPagination
                    item
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
                  </MDPagination>
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= page - 2 && pageNumber <= page + 2)
                    ) {
                      return (
                        <MDPagination
                          item
                          key={pageNumber}
                          active={pageNumber === page}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </MDPagination>
                      );
                    } else if (pageNumber === page - 3 || pageNumber === page + 3) {
                      return (
                        <MDTypography key={pageNumber} variant="button" color="secondary" px={1}>
                          ...
                        </MDTypography>
                      );
                    }
                    return null;
                  })}
                  <MDPagination
                    item
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
                  </MDPagination>
                </MDPagination>
              )}
            </MDBox>
            <MDBox display="flex" justifyContent="space-between" alignItems="left" p={2}>
              <MDTypography variant="caption" color="text">
                {`Mostrando ${paginatedItems.length} de ${filteredItems.length} items`}
              </MDTypography>
            </MDBox>
          </>
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
