// frontend/src/layouts/products/index.js

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon"; // Ensure Icon is imported for the 'add' symbol

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Hooks
import { useProducts } from "contexts/ProductContext";
import { useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import { useAuth } from "contexts/AuthContext"; // Import useAuth to check user role

// Data
import productsTableData from "layouts/products/data/productsTableData";

function Products() {
  const { products, loading, error, getProducts, page, pages, limit, total, setPage, setLimit } =
    useProducts();

  const { user } = useAuth(); // Get user from AuthContext

  // Determine if the current user has permission to create products
  const canCreateProduct = user && (user.role === "Administrador" || user.role === "Editor");

  // Determine the reseller category for the current user
  // If the user's role is 'Administrador' or 'Editor', they'll see 'cat1' prices (as a default or reference).
  // Otherwise, they'll see their specific resellerCategory price.
  // The fallback 'cat1' in productsTableData.js handles cases where `user.resellerCategory` might be undefined.
  const userResellerCategory =
    user?.role === "Administrador" || user?.role === "Editor"
      ? "cat1" // Admins/Editors see cat1 prices
      : user?.resellerCategory; // Resellers see their assigned category prices

  // useEffect to re-fetch products when page or limit changes
  useEffect(() => {
    getProducts(page, limit);
  }, [page, limit, getProducts]);

  // Prepare table data using the hook's products
  // Pass the determined userResellerCategory to productsTableData
  const { columns, rows } = productsTableData(products, userResellerCategory); // <--- IMPORTANT CHANGE HERE

  // --- Loading and Error States ---
  if (loading && products.length === 0) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography variant="h4" textAlign="center">
            Cargando productos...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography variant="h4" color="error" textAlign="center">
            Error: {error.message}
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // --- Calculate pagination summary text ---
  const startIndex = total > 0 ? (page - 1) * limit + 1 : 0;
  const endIndex = Math.min(page * limit, total);
  const paginationSummaryText =
    total > 0
      ? `Mostrando ${startIndex} a ${endIndex} de ${total} entradas`
      : "No hay entradas para mostrar";

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Tabla de Inventario
                </MDTypography>
                {/* Conditionally render the "Crear Producto" button */}
                {canCreateProduct && (
                  <MDButton
                    component={Link} // Use Link to navigate without full page reload
                    to="/products/create" // The target route for the new product form
                    variant="gradient"
                    color="dark"
                  >
                    <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                    &nbsp;Crear Producto
                  </MDButton>
                )}
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={{
                    defaultValue: limit,
                    entries: [5, 10, 20, 50, 100].filter(
                      (entry) => entry <= total || [5, 10, 20, 50, 100].includes(entry)
                    ),
                    onMenuChange: (newLimit) => {
                      setLimit(parseInt(newLimit, 10));
                      setPage(1); // Reset to first page when limit changes
                    },
                  }}
                  showTotalEntries={false}
                  noEndBorder
                  pagination={true}
                  canSearch={false}
                  currentPage={page}
                  totalPages={pages}
                  onPageChange={(event, value) => setPage(value)}
                />
                <MDBox display="flex" justifyContent="center" py={1}>
                  <MDTypography variant="caption" color="text">
                    {paginationSummaryText}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Products;
