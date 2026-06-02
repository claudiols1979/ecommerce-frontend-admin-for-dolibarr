// frontend/src/routes.js

// @mui icons - assuming these are used by your Sidenav
import Icon from "@mui/material/Icon";

// Import your layout components
// Adjust these paths if your actual component files are located elsewhere
import Dashboard from "layouts/dashboard";

import Profile from "layouts/profile";
import Products from "layouts/products";
import CreateProduct from "layouts/products/templates/CreateProduct";
import CreateProductWithVariants from "layouts/products/templates/CreateProductWithVariants";
import Variants from "layouts/variants";
import Orders from "layouts/orders";
import CreateOrder from "layouts/orders/templates/CreateOrder";
import EditOrder from "layouts/orders/templates/EditOrder";
import CreateReseller from "layouts/resellers/templates/CreateReseller";
import EditReseller from "layouts/resellers/templates/EditReseller";
import HeroCarousel from "layouts/herocarousel";
import AdGridSystem from "layouts/adgridsystem";
import AdGridSystem2 from "layouts/adgridsystem2";
import AdGridSystem3 from "layouts/adgridsystem3";
import AdGridSystem4 from "layouts/adgridsystem4";
import HeroVideoCarousel from "layouts/herovideocarousel";
import Resellers from "layouts/resellers";
import ChatAnalytics from "layouts/chat-analytics";
import Administration from "layouts/administration";
import Reports from "layouts/reports"; // NEW: Reports layout
import Claims from "layouts/claims"; // NEW: Claims layout
import Coupons from "layouts/coupons";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ForgotPassword from "layouts/authentication/reset-password/cover";
import NewPassword from "layouts/authentication/reset-password/new-password";

// --- Route Definitions ---
// Each object represents a route in your application.
//
// Properties:
//   - type: "collapse" for sidebar items, "title" for group headings, etc. (as per MD2R convention)
//   - name: The text displayed in the sidebar (if type="collapse")
//   - key: Unique identifier for the route (important for React lists)
//   - icon: The MUI Icon component for the sidebar item
//   - route: The URL path for the route
//   - component: The React component to render when this route is active
//   - allowedRoles: (REQUIRED for protected routes) An array of strings specifying
//                   which user roles can access this route. These strings MUST
//                   match the 'role' property in your user object from AuthContext.
//                   (NOT PRESENT for public routes)
const routes = [
  // --- Authenticated & Role-Based Routes ---
  // These routes require a user to be logged in AND have one of the specified roles.
  {
    type: "collapse",
    name: "Panel",
    key: "dashboard",
    icon: <Icon sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }}>dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    // Roles with double quotes for Prettier compliance
    allowedRoles: ["Administrador", "Editor"], // All authenticated users
  },
  {
    type: "collapse",
    name: "Cupones",
    key: "coupons",
    icon: <Icon fontSize="small">local_offer</Icon>,
    route: "/coupons",
    component: <Coupons />,
    allowedRoles: ["Administrador", "Editor"],
  },
  {
    type: "collapse",
    name: "Productos",
    key: "productos",
    icon: <Icon fontSize="small">sell</Icon>,
    route: "/products",
    component: <Products />,
    // Roles with double quotes for Prettier compliance
    allowedRoles: ["Administrador", "Editor"], // All authenticated users
  },
  {
    type: "none",
    name: "Crear Producto",
    key: "create-product",
    route: "/products/create",
    component: <CreateProduct />,
    allowedRoles: ["Administrador", "Editor"],
  },
  {
    type: "none",
    name: "Crear Producto con Variantes",
    key: "create-product-batch",
    route: "/products/create-batch",
    component: <CreateProductWithVariants />,
    allowedRoles: ["Administrador", "Editor"],
  },
  {
    type: "collapse",
    name: "Variantes",
    key: "variantes",
    icon: <Icon fontSize="small">tune</Icon>,
    route: "/variants",
    component: <Variants />,
    allowedRoles: ["Administrador", "Editor"],
  },
  {
    type: "collapse",
    name: "Pedidos",
    key: "pedidos",
    icon: <Icon fontSize="small">shopping_cart</Icon>, // Using shopping_cart icon for orders
    route: "/orders",
    component: <Orders />,
    allowedRoles: ["Administrador", "Editor", "ReVendedor"], // Assuming all authenticated users can view orders initially
  },
  {
    type: "collapse",
    name: "HeroCarousel",
    key: "HeroCarousel",
    icon: <Icon fontSize="small">view_carousel</Icon>, // Using shopping_cart icon for orders
    route: "/hero-carousel",
    component: <HeroCarousel />,
    allowedRoles: ["Administrador", "Editor", "ReVendedor"], // Assuming all authenticated users can view orders initially
  },
  {
    type: "collapse",
    name: "AdGridSystem",
    key: "AdGridSystem",
    icon: <Icon fontSize="small">imagemode</Icon>, // Using shopping_cart icon for orders
    route: "/adgridsystem",
    component: <AdGridSystem />,
    allowedRoles: ["Administrador", "Editor", "ReVendedor"], // Assuming all authenticated users can view orders initially
  },
  {
    type: "collapse",
    name: "Grid Promocional 2",
    key: "AdGridSystem2",
    icon: <Icon fontSize="small">view_agenda</Icon>,
    route: "/ad-grid-2",
    component: <AdGridSystem2 />,
    allowedRoles: ["Administrador", "Editor"],
  },
  {
    type: "collapse",
    name: "Grid Promocional 3",
    key: "AdGridSystem3",
    icon: <Icon fontSize="small">grid_view</Icon>,
    route: "/ad-grid-3",
    component: <AdGridSystem3 />,
    allowedRoles: ["Administrador", "Editor"],
  },
  {
    type: "collapse",
    name: "Grid Promocional 4",
    key: "AdGridSystem4",
    icon: <Icon fontSize="small">dashboard_customize</Icon>,
    route: "/ad-grid-4",
    component: <AdGridSystem4 />,
    allowedRoles: ["Administrador", "Editor"],
  },
  {
    type: "collapse",
    name: "HeroVideoCarousel",
    key: "HeroVideoCarousel",
    icon: <Icon fontSize="small">video_camera_back_add</Icon>,
    route: "/herovideocarousel",
    component: <HeroVideoCarousel />,
    allowedRoles: ["Administrador", "Editor", "ReVendedor"],
  },
  {
    type: "hidden", // Hidden from Sidenav
    name: "Crear Orden",
    key: "create-order",
    icon: <Icon fontSize="small">add_shopping_cart</Icon>,
    route: "/orders/create", // Route for creating new orders
    component: <CreateOrder />,
    allowedRoles: ["Administrador", "Revendedor"], // Admins and Resellers can create orders
  },
  {
    type: "hidden", // Hidden from Sidenav
    name: "Editar Orden",
    key: "edit-order",
    icon: <Icon fontSize="small">edit</Icon>,
    route: "/orders/edit/:id", // Dynamic route for editing a specific order
    component: <EditOrder />,
    allowedRoles: ["Administrador", "Editor"], // Only Admins and Editors can edit orders
  },
  {
    type: "collapse",
    name: "Reporte Utilidad",
    key: "reportes",
    icon: <Icon fontSize="small">assessment</Icon>,
    route: "/reports",
    component: <Reports />,
    allowedRoles: ["Administrador"], // Only Admins can see reports
  },
  {
    type: "collapse",
    name: "Reclamos",
    key: "reclamos",
    icon: <Icon fontSize="small">support_agent</Icon>,
    route: "/claims",
    component: <Claims />,
    allowedRoles: ["Administrador", "Editor"],
  },
  {
    type: "collapse",
    name: "Clientes",
    key: "clientes",
    icon: <Icon fontSize="small">person_add</Icon>,
    route: "/clientes",
    component: <Resellers />,
    // Roles with double quotes
    allowedRoles: ["Administrador", "Editor"], // All authenticated users
  },
  {
    type: "hidden", // Hidden from Sidenav
    name: "Crear Revendedor", // NEW ROUTE
    key: "create-reseller",
    icon: <Icon fontSize="small">person_add</Icon>, // Re-use icon if needed for internal reference
    route: "/resellers/create",
    component: <CreateReseller />,
    allowedRoles: ["Administrador"], // Only Admin can create
  },
  {
    type: "hidden", // Hidden from Sidenav
    name: "Editar Revendedor", // NEW ROUTE
    key: "edit-reseller",
    icon: <Icon fontSize="small">edit</Icon>, // Re-use icon if needed for internal reference
    route: "/resellers/edit/:id", // Dynamic route for editing a specific reseller
    component: <EditReseller />,
    allowedRoles: ["Administrador", "Editor"], // Admin and Editor can edit
  },
  {
    type: "collapse",
    name: "Perfil",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
    // Roles with double quotes
    allowedRoles: ["Administrador", "Editor", "Revendedor"], // All authenticated users
  },
  {
    type: "collapse",
    name: "Asistente AI",
    key: "chat-analytics",
    icon: <Icon fontSize="small">smart_toy</Icon>,
    route: "/chat-analytics",
    component: <ChatAnalytics />,
    allowedRoles: ["Administrador", "Editor"],
  },
  {
    type: "collapse",
    name: "Configuración",
    key: "configuracion",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/administration",
    component: <Administration />,
    allowedRoles: ["Administrador"], // Only Admin can configure
  },

  // --- Public Routes (No 'allowedRoles' property) ---
  // These routes are accessible to anyone, regardless of authentication status.
  // They will typically NOT appear in the sidebar once a user is logged in.
  {
    type: "collapse", // Can still be 'collapse' for unauthenticated sidebar display
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
    // IMPORTANT: No 'allowedRoles' property means it's a public route
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
    // IMPORTANT: No 'allowedRoles' property means it's a public route
  },
  {
    type: "hidden", // Does not show in sidebar
    name: "Forgot Password",
    key: "forgot-password",
    route: "/authentication/reset-password",
    component: <ForgotPassword />,
  },
  {
    type: "hidden", // Does not show in sidebar
    name: "New Password",
    key: "new-password",
    route: "/authentication/reset-password/:resetToken", // Note the dynamic :resetToken
    component: <NewPassword />,
  },
];

export default routes;
