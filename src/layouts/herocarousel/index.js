/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

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

// Hero Carousel components
import SlidesTable from "layouts/herocarousel/components/SlidesTable";
import SlideForm from "layouts/herocarousel/components/SlideForm";

// Context
import { useHeroCarousel } from "contexts/HeroCarouselContext";
import { useMaterialUIController } from "context";

function HeroCarousel() {
  const { slides, loading, error, fetchAllSlides } = useHeroCarousel();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchAllSlides();
  }, []);

  const handleCreateSlide = () => {
    setEditingSlide(null);
    setShowForm(true);
  };

  const handleEditSlide = (slide) => {
    setEditingSlide(slide);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSlide(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSlide(null);
    fetchAllSlides();
  };

  const handleRetry = () => {
    fetchAllSlides().catch(() => {});
  };

  // Filter and Pagination logic
  const filteredSlides = useMemo(() => {
    if (!searchTerm) return slides;
    const lowerSearch = searchTerm.toLowerCase();
    return slides.filter(
      (s) =>
        s.title?.toLowerCase().includes(lowerSearch) ||
        s.description?.toLowerCase().includes(lowerSearch)
    );
  }, [slides, searchTerm]);

  const totalPages = Math.ceil(filteredSlides.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedSlides = useMemo(() => {
    return filteredSlides.slice(startIndex, startIndex + limit);
  }, [filteredSlides, startIndex, limit]);

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
            Administrador Hero Carousel
          </MDTypography>
          <MDButton
            variant="gradient"
            color="info"
            onClick={handleCreateSlide}
            disabled={loading}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Agregar nuevo
          </MDButton>
        </MDBox>

        {!showForm && (
          <MDBox mb={3}>
            <MDInput
              label="Buscar diapositiva..."
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
              Please check if the backend server is running and the API endpoints are correct.
            </MDTypography>
            <MDBox mt={1}>
              <MDButton variant="outlined" color="error" size="small" onClick={handleRetry}>
                Retry
              </MDButton>
            </MDBox>
          </MDBox>
        )}

        {showForm ? (
          <SlideForm slide={editingSlide} onClose={handleFormClose} onSuccess={handleFormSuccess} />
        ) : (
          <>
            <SlidesTable slides={paginatedSlides} loading={loading} onEditSlide={handleEditSlide} />
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
                {`Mostrando ${paginatedSlides.length} de ${filteredSlides.length} diapositivas`}
              </MDTypography>
            </MDBox>
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default HeroCarousel;
