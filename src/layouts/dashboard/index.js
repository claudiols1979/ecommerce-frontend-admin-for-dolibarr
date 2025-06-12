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
import React, { useEffect } from "react"; // <-- Add useEffect here
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data (Keep reportsBarChartData if you still use it for the bar chart)
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects"; // Keep this import path
// import OrdersOverview from "layouts/dashboard/components/OrdersOverview"; // Commented out in your example

import { useDashboard } from "../../contexts/DashboardContext";

// MUI icons
import GroupIcon from "@mui/icons-material/Group";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

import { useProducts } from "contexts/ProductContext";

function Dashboard() {
  const { dashboardData, loading, error, fetchDashboardData } = useDashboard();

  // Use the useProducts hook to access the context values
  const { products, getProducts } = useProducts();

  const summary = dashboardData?.summary;
  const orderDetails = dashboardData?.orderDetails; // This is the data you need
  const charts = dashboardData?.charts;

  console.log("summary: ", summary);
  console.log("orderDetails: ", orderDetails);
  console.log("charts: ", charts);

  const currentYear = new Date().getFullYear().toString();
  const currentYearRevenueData = summary?.revenueByYear?.find((item) => item._id === currentYear);
  const currentYearTotalRevenue = currentYearRevenueData?.totalRevenue ?? 0;

  // Optional: Add basic loading/error UI with spinner
  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          py={3}
          sx={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack direction="column" alignItems="center" spacing={2}>
            <CircularProgress color="info" size={60} />
            <MDTypography variant="h5" color="text">
              Cargando datos del panel...
            </MDTypography>
          </Stack>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          py={3}
          sx={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack direction="column" alignItems="center" spacing={2}>
            <MDTypography variant="h5" color="error">
              Error al cargar los datos del panel:
            </MDTypography>
            <MDTypography variant="body2" color="error">
              {error.message || "Un error desconocido ha ocurrido."}
            </MDTypography>
          </Stack>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Slice the orderDetails to get only the latest 10
  // Assumes orderDetails is already sorted by createdAt descending from the backend
  const latest10Orders = orderDetails ? orderDetails.slice(0, 10) : [];

  // useEffect 1: Trigger the data fetch on component mount
  useEffect(() => {
    console.log("Dashboard: Triggering product fetch...");
    getProducts();
  }, [getProducts]); // Dependency array: getProducts (memoized by useCallback in context)

  // useEffect 2: Log products when they become available (after fetch completes)
  useEffect(() => {
    if (products.length > 0) {
      console.log("Dashboard: Products loaded successfully:");
      console.log(products); // <-- This will log your fetched products
    } else {
      console.log("Dashboard: Products array is currently empty or still loading.");
    }
  }, [products]); //

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* Keep your existing ComplexStatisticsCard components */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon={<GroupIcon />}
                title="Total de usuarios"
                count={summary?.numberOfUsers}
                percentage={{
                  label: "Total de usuarios registrados",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="leaderboard"
                title={`Total órdenes ${currentYear}`}
                count={summary?.numberOfOrders}
                percentage={{
                  label: "Total órdenes año en curso",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon={<AttachMoneyIcon />}
                title={`Ingreso neto ${currentYear}`}
                count={`₡${currentYearTotalRevenue?.toFixed(2)}`}
                percentage={{
                  label: "Ingreso neto ",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="person"
                title="Revendedores"
                count={summary?.numberOfResellers}
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Total revendedores registrados",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            {/* Keep the existing ReportsBarChart if you still need it */}
            {/* <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="website views"
                  description="Last Campaign Performance"
                  date="campaign sent 2 days ago"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid> */}

            {/* NEW: Orders by Day Line Chart */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Órdenes por Día"
                  description="Total de órdenes con todos los estados"
                  date={`Actualizado al ${new Date().toLocaleDateString("es-CR")}`}
                  chart={
                    charts?.ordersByDay || { labels: [], datasets: { label: "Órdenes", data: [] } }
                  }
                />
              </MDBox>
            </Grid>

            {/* NEW: Orders per Month Line Chart */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="Órdenes por Mes"
                  description="Total de órdenes con todos los estados"
                  date={`Datos del ${currentYear}`}
                  chart={
                    charts?.ordersPerMonth || {
                      labels: [],
                      datasets: { label: "Órdenes", data: [] },
                    }
                  }
                />
              </MDBox>
            </Grid>

            {/* NEW: Delivered Orders per Month Line Chart */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="info"
                  title="Órdenes Entregadas por Mes"
                  description="Órdenes con estado 'entregado'"
                  date={`Datos del ${currentYear}`}
                  chart={
                    charts?.deliveredOrdersPerMonth || {
                      labels: [],
                      datasets: { label: "Órdenes Entregadas", data: [] },
                    }
                  }
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              {/* IMPORTANT: Pass the latest10Orders as a prop named 'orders' to the Projects component */}
              <Projects orders={latest10Orders} />
            </Grid>
            {/* <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview />
            </Grid> */}
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
