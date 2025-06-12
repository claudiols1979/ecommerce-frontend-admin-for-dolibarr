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
import createCache from "@emotion/cache"; // Changed to @emotion/cache for createCache

// Your application's route definitions (used for Sidenav filtering)
import routes from "routes";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Authentication, Product, User, Order, and Dashboard contexts
import { AuthProvider, useAuth } from "contexts/AuthContext";
import { ProductProvider } from "contexts/ProductContext";

import { OrderProvider } from "contexts/OrderContext";
import { DashboardProvider } from "contexts/DashboardContext"; // Correctly importing DashboardProvider
import ProtectedRoute from "utils/ProtectedRoute";

// Toast notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Public layout components
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// Product-related components
import Products from "layouts/products";
import CreateProduct from "layouts/products/templates/CreateProduct";
import EditProduct from "layouts/products/templates/EditProduct";
import ProductDetail from "layouts/products/templates/ProductDetail";

// Order-related components
import Orders from "layouts/orders";
import CreateOrder from "layouts/orders/templates/CreateOrder"; // FIXED PATH
import EditOrder from "layouts/orders/templates/EditOrder"; // FIXED PATH
import OrderDetail from "layouts/orders/templates/OrderDetail";

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

  // Dynamic Sidenav Filtering Logic
  const filteredSidenavRoutes = useMemo(() => {
    if (!isAuthenticated || loading) {
      return routes.filter((route) => !route.allowedRoles);
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
      return route.allowedRoles.includes(userRole);
    });
  }, [isAuthenticated, user, loading]);

  // Helper to render all application routes from 'routes.js'
  // This helper will now render ALL routes based on the 'routes' array,
  // relying on `ProtectedRoute` for access control.
  const getAppRoutes = (allRoutes) =>
    allRoutes
      .map((route) => {
        if (route.collapse && route.routes) {
          return getAppRoutes(route.routes);
        }
        // If it's a direct route with a component
        if (route.route && route.component) {
          if (route.allowedRoles) {
            return (
              <Route
                key={route.key}
                path={route.route}
                element={
                  <ProtectedRoute allowedRoles={route.allowedRoles}>
                    {route.component}
                  </ProtectedRoute>
                }
              />
            );
          } else {
            // This case should ideally not be hit for protected sections
            return <Route key={route.key} path={route.route} element={route.component} />;
          }
        }
        return null;
      })
      .filter(Boolean); // Filter out nulls

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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

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

                      <Routes>
                        {/* Render all standard routes from routes.js */}
                        {getAppRoutes(filteredSidenavRoutes)}

                        {/* Specific routes defined here, ensuring they are also in routes.js for Sidenav display */}
                        {/* Product Routes */}
                        <Route
                          path="/products/create"
                          element={
                            <ProtectedRoute allowedRoles={["Administrador", "Editor"]}>
                              <CreateProduct />
                            </ProtectedRoute>
                          }
                        />
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

                        {/* Order Routes */}
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
        // LTR Direction
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

                    <Routes>
                      {/* Render all standard routes from routes.js */}
                      {getAppRoutes(filteredSidenavRoutes)}

                      {/* Specific product routes */}
                      <Route
                        path="/products/create"
                        element={
                          <ProtectedRoute allowedRoles={["Administrador", "Editor"]}>
                            <CreateProduct />
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

                      {/* Order Routes */}
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
            <MainAppContent />
          </DashboardProvider>
        </OrderProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
