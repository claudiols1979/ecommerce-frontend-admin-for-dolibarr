import { useState, useEffect, useMemo } from "react";

// react-router-dom components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Brand logo
import brandLogo from "assets/images/favicon.png";

// Material Dashboard 2 React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins for Material Dashboard 2 React
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Your application's route definitions (used for Sidenav filtering) update
import routes from "routes";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Authentication, Product, Order, Dashboard, and Reseller contexts
import { AuthProvider, useAuth } from "contexts/AuthContext";
import { ProductProvider } from "contexts/ProductContext";
import { OrderProvider } from "contexts/OrderContext";
import { DashboardProvider } from "contexts/DashboardContext";
import { ResellerProvider } from "contexts/ResellerContext"; // NEW: ResellerProvider import
import { HeroCarouselProvider } from "contexts/HeroCarouselContext";
import { AdGridProvider } from "contexts/AdGridContext";
import { AdGrid2Provider } from "contexts/AdGrid2Context";
import { AdGrid3Provider } from "contexts/AdGrid3Context";
import { AdGrid4Provider } from "contexts/AdGrid4Context";
import { VideoProvider } from "contexts/VideoContext";
import { ConfigProvider } from "contexts/ConfigContext";

// Protected Route utility
import ProtectedRoute from "utils/ProtectedRoute";

// --- Page Components ---
// Public
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ForgotPassword from "layouts/authentication/reset-password/cover";
import NewPassword from "layouts/authentication/reset-password/new-password";

// Protected
import Dashboard from "layouts/dashboard";
import Products from "layouts/products";
import CreateProduct from "layouts/products/templates/CreateProduct";
import EditProduct from "layouts/products/templates/EditProduct";
import ProductDetail from "layouts/products/templates/ProductDetail";
import Orders from "layouts/orders";
import HeroCarousel from "layouts/herocarousel";
import AdGridSystem from "layouts/adgridsystem";
import AdGridSystem2 from "layouts/adgridsystem2";
import AdGridSystem3 from "layouts/adgridsystem3";
import AdGridSystem4 from "layouts/adgridsystem4";
import HeroVideoCarousel from "layouts/herovideocarousel";
import CreateOrder from "layouts/orders/templates/CreateOrder";
import EditOrder from "layouts/orders/templates/EditOrder";
import OrderDetail from "layouts/orders/templates/OrderDetail";
import Resellers from "layouts/resellers";
import CreateReseller from "layouts/resellers/templates/CreateReseller";
import EditReseller from "layouts/resellers/templates/EditReseller";
import ResellerDetail from "layouts/resellers/templates/ResellerDetail";
import Profile from "layouts/profile";
import Administration from "layouts/administration";
import ChatAnalytics from "layouts/chat-analytics";
import Reports from "layouts/reports"; // NEW: Reports import
import Claims from "layouts/claims"; // NEW: Claims import
import Coupons from "layouts/coupons";

// Variantes
import Variants from "layouts/variants";
import CreateProductWithVariants from "layouts/products/templates/CreateProductWithVariants";

// Main application content component (wrapped by all necessary Providers)
function MainAppContent() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, direction, layout, openConfigurator, sidenavColor, darkMode } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const { isAuthenticated, user, loading } = useAuth();

  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });
    setRtlCache(cacheRtl);
  }, []);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const filteredSidenavRoutes = useMemo(() => {
    if (!isAuthenticated || !user?.role) {
      return routes.filter((route) => !route.allowedRoles);
    }
    return routes.filter(
      (route) =>
        route.type === "collapse" &&
        route.allowedRoles?.some((role) => role.toLowerCase() === user.role.toLowerCase())
    );
  }, [isAuthenticated, user, routes]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "24px",
          color: "#555",
        }}
      >
        Cargando aplicación...
      </div>
    );
  }

  const isAuthenticationPath = pathname.startsWith("/authentication/");

  const configuratorButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      zIndex={99}
      color="dark"
      sx={{
        cursor: "pointer",
        width: { xs: "2.75rem", sm: "3rem", md: "3.25rem" },
        height: { xs: "2.75rem", sm: "3rem", md: "3.25rem" },
        right: { xs: "1rem", sm: "1.25rem", md: "1.5rem", lg: "2rem" },
        bottom: { xs: "1rem", sm: "1.25rem", md: "1.5rem", lg: "2rem" },
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 4,
          transform: "scale(1.08)",
        },
        "&:active": {
          transform: "scale(0.94)",
        },
      }}
      onClick={handleConfiguratorOpen}
    >
      <Icon
        color="inherit"
        sx={{
          fontSize: { xs: "1rem", sm: "1.15rem", md: "1.2rem", lg: "1.25rem" },
        }}
      >
        settings
      </Icon>
    </MDBox>
  );

  // Define a single set of routes to be used by both LTR and RTL themes
  const appRoutes = (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/authentication/sign-in" element={<SignIn />} />
      <Route path="/authentication/sign-up" element={<SignUp />} />
      <Route path="/authentication/reset-password" element={<ForgotPassword />} />
      <Route path="/authentication/reset-password/:resetToken" element={<NewPassword />} />

      {/* Central Authentication Gate */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            // This is the main layout for authenticated users
            <>
              {layout === "dashboard" && !isAuthenticationPath && (
                <>
                  <Sidenav
                    color={sidenavColor}
                    brand={brandLogo}
                    brandName="ORIYINA⅃"
                    routes={filteredSidenavRoutes}
                    onMouseEnter={handleOnMouseEnter}
                    onMouseLeave={handleOnMouseLeave}
                  />
                  <Configurator />
                  {configuratorButton}
                  {/* Floating Configurator Button Logic */}
                </>
              )}
              {/* Nested Routes for the main content area */}
              <Routes>
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                      <Products />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/create"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                      <CreateProduct />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/create-batch"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor"]}>
                      <CreateProductWithVariants />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/variants"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor"]}>
                      <Variants />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor"]}>
                      <EditProduct />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/details/:id"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                      <ProductDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/create"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Revendedor"]}>
                      <CreateOrder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/details/:id"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor"]}>
                      <EditOrder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clientes"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor"]}>
                      <Resellers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resellers/create"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                      <CreateReseller />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resellers/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor"]}>
                      <EditReseller />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resellers/details/:id"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                      <ResellerDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hero-carousel"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                      <HeroCarousel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/adgridsystem"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                      <AdGridSystem />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ad-grid-2"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                      <AdGridSystem2 />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ad-grid-3"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                      <AdGridSystem3 />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ad-grid-4"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                      <AdGridSystem4 />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/herovideocarousel"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                      <HeroVideoCarousel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/administration"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                      <Administration />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat-analytics"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor"]}>
                      <ChatAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/coupons"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor"]}>
                      <Coupons />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador"]}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/claims"
                  element={
                    <ProtectedRoute allowedRoles={["Administrador", "Editor"]}>
                      <Claims />
                    </ProtectedRoute>
                  }
                />
                {/* Fallback for authenticated users */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </>
          ) : (
            // Redirect to sign-in if not authenticated
            <Navigate to="/authentication/sign-in" replace />
          )
        }
      />
    </Routes>
  );

  return (
    <>
      {direction === "rtl" ? (
        <CacheProvider value={rtlCache}>
          <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
            <CssBaseline />
            {appRoutes}
          </ThemeProvider>
        </CacheProvider>
      ) : (
        <ThemeProvider theme={darkMode ? themeDark : theme}>
          <CssBaseline />
          {appRoutes}
        </ThemeProvider>
      )}
    </>
  );
}

// Top-level App component to ensure all Providers wrap everything
export default function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <ProductProvider>
          <OrderProvider>
            <DashboardProvider>
              <ResellerProvider>
                <HeroCarouselProvider>
                  <AdGridProvider>
                    <AdGrid2Provider>
                      <AdGrid3Provider>
                        <AdGrid4Provider>
                          <VideoProvider>
                            <MainAppContent />
                          </VideoProvider>
                        </AdGrid4Provider>
                      </AdGrid3Provider>
                    </AdGrid2Provider>
                  </AdGridProvider>
                </HeroCarouselProvider>
              </ResellerProvider>
            </DashboardProvider>
          </OrderProvider>
        </ProductProvider>
      </ConfigProvider>
    </AuthProvider>
  );
}
