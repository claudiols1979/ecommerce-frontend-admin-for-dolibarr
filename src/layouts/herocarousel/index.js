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

// @mui material components
import React, { useState, useEffect } from "react";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Hero Carousel components
import SlidesTable from "layouts/herocarousel/components/SlidesTable";
import SlideForm from "layouts/herocarousel/components/SlideForm";

// Context
import { useHeroCarousel } from "contexts/HeroCarouselContext";

function HeroCarousel() {
  const { slides, loading, error, fetchAllSlides } = useHeroCarousel();
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);

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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Hero Carousel Management
          </MDTypography>
          <MDButton variant="gradient" color="info" onClick={handleCreateSlide} disabled={loading}>
            Add New Slide
          </MDButton>
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
          <SlidesTable slides={slides} loading={loading} onEditSlide={handleEditSlide} />
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default HeroCarousel;
