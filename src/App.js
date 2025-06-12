// frontend/src/App.js

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

// Material Dashboard 2 React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins for Material Dashboard 2 React
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Your application's route definitions (used for Sidenav filtering)
import routes from "routes";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Authentication, Product, Order, Dashboard, and Reseller contexts
import { AuthProvider, useAuth } from "contexts/AuthContext";
import { ProductProvider } from "contexts/ProductContext";
import { OrderProvider } from "contexts/OrderContext";
import { DashboardProvider } from "contexts/DashboardContext";
import { ResellerProvider } from "contexts/ResellerContext"; // NEW: ResellerProvider import

// Protected Route utility
import ProtectedRoute from "utils/ProtectedRoute";

// Toast notifications (Note: Removed from here, handled in index.js)
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// Public layout components
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// Product-related components
import Dashboard from "layouts/dashboard"; // Assuming Dashboard is explicitly routed
import Products from "layouts/products";
import CreateProduct from "layouts/products/templates/CreateProduct";
import EditProduct from "layouts/products/templates/EditProduct";
import ProductDetail from "layouts/products/templates/ProductDetail"; // For product details

// Order-related components
import Orders from "layouts/orders";
import CreateOrder from "layouts/orders/templates/CreateOrder";
import EditOrder from "layouts/orders/templates/EditOrder";
import OrderDetail from "layouts/orders/templates/OrderDetail"; // Assuming OrderDetail exists

// Resellers-related components (NEW IMPORTS)
import Resellers from "layouts/resellers";
import CreateReseller from "layouts/resellers/templates/CreateReseller";
import EditReseller from "layouts/resellers/templates/EditReseller";
import ResellerDetail from "layouts/resellers/templates/ResellerDetail"; // For reseller details
import Profile from "layouts/profile"; // Assuming Profile is explicitly routed

// Main application content component (wrapped by all necessary Providers)
function MainAppContent() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  const { isAuthenticated, user, loading } = useAuth();

  // Cache for RTL support
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });
    setRtlCache(cacheRtl);
  }, []);

  // Sidenav handlers
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

  // Configurator handler
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Set direction attribute for body
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Scroll to top on route change
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // Dynamic Sidenav Filtering Logic (as it was)
  const filteredSidenavRoutes = useMemo(() => {
    if (!isAuthenticated || loading) {
      return routes.filter((route) => !route.allowedRoles && route.type === "collapse");
    }

    const userRole = user?.role;
    if (!userRole) {
      return routes.filter((route) => !route.allowedRoles);
    }

    return routes.filter((route) => {
      // Hide authentication-related routes (Sign In/Sign Up) from the sidebar
      if (!route.allowedRoles) {
        return false;
      }
      // Only include protected routes if the user's role is in the route's `allowedRoles` array.
      // Also, ensure it's a "collapse" type route for the sidenav.
      return route.type === "collapse" && route.allowedRoles.includes(userRole);
    });
  }, [isAuthenticated, user, loading]);

  // We explicitly list routes here in the main <Routes> block,
  // matching how your product routes were already working.
  // The 'routes' array from routes.js is now primarily for Sidenav configuration.

  // Show a full-screen loading state while auth status is being determined
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

  return (
    <>
      {/* ToastContainer is removed from here as it should be in index.js for global scope */}

      {direction === "rtl" ? (
        <CacheProvider value={rtlCache}>
          <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
            <CssBaseline />
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/authentication/sign-in" element={<SignIn />} />
              <Route path="/authentication/sign-up" element={<SignUp />} />

              {/* Central Authentication Gate */}
              {!isAuthenticated ? (
                // Redirect to sign-in if not authenticated and trying to access any other path
                <Route path="*" element={<Navigate to="/authentication/sign-in" replace />} />
              ) : (
                <Route
                  path="/*" // This matches any path for authenticated users
                  element={
                    <>
                      {layout === "dashboard" && !isAuthenticationPath && (
                        <>
                          <Sidenav
                            color={sidenavColor}
                            brandName="Perfumes Store"
                            routes={filteredSidenavRoutes}
                            onMouseEnter={handleOnMouseEnter}
                            onMouseLeave={handleOnMouseLeave}
                          />
                          <Configurator />
                          {/* Floating Configurator Button for RTL */}
                          <MDBox
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            width="3rem"
                            height="3rem"
                            bgColor="white" // Adjust color for visibility in dark mode if needed
                            shadow="sm"
                            borderRadius="50%"
                            position="fixed"
                            left="2rem" // Position on the left for RTL
                            bottom="2rem"
                            zIndex={99}
                            color="dark"
                            sx={({
                              palette: { white, dark },
                              boxShadows: { regular },
                              borders: { borderRadius },
                            }) => ({
                              cursor: "pointer",
                              boxShadow: regular,
                              "& i": {
                                lineHeight: 0,
                              },
                            })}
                            onClick={handleConfiguratorOpen}
                          >
                            <Icon fontSize="small" color="inherit">
                              settings
                            </Icon>
                          </MDBox>
                        </>
                      )}
                      {layout === "vr" && <Configurator />}

                      {/* Main Application Routes for Authenticated Users */}
                      {/* Explicitly list all protected routes here */}
                      <Routes>
                        {/* Dashboard */}
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute
                              allowedRoles={["Administrador", "Editor", "Revendedor"]}
                            >
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />

                        {/* Profile */}
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute
                              allowedRoles={["Administrador", "Editor", "Revendedor"]}
                            >
                              <Profile />
                            </ProtectedRoute>
                          }
                        />

                        {/* Products Routes */}
                        <Route
                          path="/products"
                          element={
                            <ProtectedRoute
                              allowedRoles={["Administrador", "Editor", "Revendedor"]}
                            >
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
                            <ProtectedRoute
                              allowedRoles={["Administrador", "Editor", "Revendedor"]}
                            >
                              <ProductDetail />
                            </ProtectedRoute>
                          }
                        />

                        {/* Orders Routes */}
                        <Route
                          path="/orders"
                          element={
                            <ProtectedRoute
                              allowedRoles={["Administrador", "Editor", "Revendedor"]}
                            >
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
                            <ProtectedRoute
                              allowedRoles={["Administrador", "Editor", "Revendedor"]}
                            >
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

                        {/* Resellers Routes (NEW) */}
                        <Route
                          path="/revendedores" // Matches the Sidenav route
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
                            <ProtectedRoute
                              allowedRoles={["Administrador", "Editor", "Revendedor"]}
                            >
                              <ResellerDetail />
                            </ProtectedRoute>
                          }
                        />

                        {/* Fallback route for authenticated users - ensure it's the LAST route */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </>
                  }
                />
              )}
            </Routes>
          </ThemeProvider>
        </CacheProvider>
      ) : (
        // LTR Direction (duplicate of RTL, ensure consistency)
        <ThemeProvider theme={darkMode ? themeDark : theme}>
          <CssBaseline />

          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/authentication/sign-in" element={<SignIn />} />
            <Route path="/authentication/sign-up" element={<SignUp />} />

            {/* Central Authentication Gate */}
            {!isAuthenticated ? (
              <Route path="*" element={<Navigate to="/authentication/sign-in" replace />} />
            ) : (
              <Route
                path="/*"
                element={
                  <>
                    {layout === "dashboard" && !isAuthenticationPath && (
                      <>
                        <Sidenav
                          color={sidenavColor}
                          brandName="Look & Smell"
                          routes={filteredSidenavRoutes}
                          onMouseEnter={handleOnMouseEnter}
                          onMouseLeave={handleOnMouseLeave}
                        />
                        <Configurator />
                      </>
                    )}
                    {layout === "vr" && <Configurator />}

                    {/* Floating Configurator Button for LTR */}
                    {!isAuthenticationPath && (
                      <MDBox
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        width="3rem"
                        height="3rem"
                        bgColor="white" // Adjust color for visibility in dark mode if needed
                        shadow="sm"
                        borderRadius="50%"
                        position="fixed"
                        right="2rem"
                        bottom="2rem"
                        zIndex={99} // Ensure it's above other elements
                        color="dark" // Default icon color, adjust as needed
                        sx={({
                          palette: { white, dark },
                          boxShadows: { regular },
                          borders: { borderRadius },
                        }) => ({
                          cursor: "pointer",
                          boxShadow: regular,
                          "& i": {
                            lineHeight: 0, // Helps vertically align icon
                          },
                        })}
                        onClick={handleConfiguratorOpen}
                      >
                        <Icon fontSize="small" color="inherit">
                          settings
                        </Icon>
                      </MDBox>
                    )}

                    {/* Main Application Routes for Authenticated Users */}
                    {/* Explicitly list all protected routes here */}
                    <Routes>
                      {/* Dashboard */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />

                      {/* Profile */}
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute allowedRoles={["Administrador", "Editor", "Revendedor"]}>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />

                      {/* Products Routes */}
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

                      {/* Orders Routes */}
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

                      {/* Resellers Routes (NEW) */}
                      <Route
                        path="/revendedores"
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

                      {/* Fallback route for authenticated users - ensure it's the LAST route */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </>
                }
              />
            )}
          </Routes>
        </ThemeProvider>
      )}
    </>
  );
}

// Top-level App component to ensure all Providers wrap everything
export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <OrderProvider>
          <DashboardProvider>
            <ResellerProvider>
              {" "}
              {/* NEW: Wrap with ResellerProvider */}
              <MainAppContent />
            </ResellerProvider>
          </DashboardProvider>
        </OrderProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
