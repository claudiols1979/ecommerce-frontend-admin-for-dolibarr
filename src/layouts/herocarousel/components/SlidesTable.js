import React from "react";
import PropTypes from "prop-types"; // Add this import
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDButton from "components/MDButton";

// Material Dashboard 2 React examples
import DataTable from "examples/Tables/DataTable";

// Context
import { useHeroCarousel } from "contexts/HeroCarouselContext";

function SlidesTable({ slides, loading, onEditSlide }) {
  const { deleteSlide, toggleSlideActive } = useHeroCarousel();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this slide?")) {
      try {
        await deleteSlide(id);
      } catch (error) {
        // Error handled by context
      }
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await toggleSlideActive(id, isActive);
    } catch (error) {
      // Error handled by context
    }
  };

  const columns = [
    { Header: "Imagen", accessor: "imagen", width: "10%", align: "left" },
    { Header: "Título", accessor: "título", width: "25%", align: "left" },
    { Header: "Descripción", accessor: "descripción", width: "30%", align: "left" },
    { Header: "Órden", accessor: "órden", width: "10%", align: "center" },
    { Header: "Estado", accessor: "estado", width: "10%", align: "center" },
    { Header: "Acciones", accessor: "acciones", width: "15%", align: "center" },
  ];

  const rows = slides.map((slide) => ({
    imagen: (
      <MDAvatar
        src={slide.image}
        alt={slide.alt}
        size="sm"
        variant="rounded"
        bgColor="transparent"
      />
    ),
    título: (
      <MDTypography variant="caption" fontWeight="medium">
        {slide.title}
      </MDTypography>
    ),
    descripción: (
      <MDTypography variant="caption" color="text">
        {slide.description.length > 50
          ? `${slide.description.substring(0, 50)}...`
          : slide.description}
      </MDTypography>
    ),
    órden: (
      <MDTypography variant="caption" fontWeight="medium">
        {slide.order}
      </MDTypography>
    ),
    estado: (
      <MDButton
        variant="gradient"
        color={slide.isActive ? "success" : "error"}
        size="small"
        onClick={() => handleToggleActive(slide._id, slide.isActive)}
      >
        {slide.isActive ? "Activo" : "Inactivo"}
      </MDButton>
    ),
    acciones: (
      <MDBox display="flex" gap={1}>
        <MDButton variant="gradient" color="info" size="small" onClick={() => onEditSlide(slide)}>
          Editar
        </MDButton>
        <MDButton
          variant="gradient"
          color="error"
          size="small"
          onClick={() => handleDelete(slide._id)}
        >
          Eliminar
        </MDButton>
      </MDBox>
    ),
  }));

  return (
    <MDBox>
      <DataTable
        table={{ columns, rows }}
        loading={loading}
        entriesPerPage={false}
        showTotalEntries={true}
        isSorted={true}
        noEndBorder
      />
    </MDBox>
  );
}

SlidesTable.propTypes = {
  slides: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  onEditSlide: PropTypes.func.isRequired,
};

export default SlidesTable;
