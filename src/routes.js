// frontend/src/routes.js

// @mui icons - assuming these are used by your Sidenav
import Icon from "@mui/material/Icon";

// Import your layout components
// Adjust these paths if your actual component files are located elsewhere
import Dashboard from "layouts/dashboard";

import Profile from "layouts/profile";
import Products from "layouts/products";
import Orders from "layouts/orders";
import CreateOrder from "layouts/orders/templates/CreateOrder";
import EditOrder from "layouts/orders/templates/EditOrder";
import Resellers from "layouts/resellers";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

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
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    // Roles with double quotes for Prettier compliance
    allowedRoles: ["Administrador", "Editor"], // All authenticated users
  },
  {
    type: "collapse",
    name: "Productos",
    key: "productos",
    icon: <Icon fontSize="small">inventory</Icon>,
    route: "/products",
    component: <Products />,
    // Roles with double quotes for Prettier compliance
    allowedRoles: ["Administrador", "Editor"], // All authenticated users
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
    name: "Revendedores",
    key: "revendedores",
    icon: <Icon fontSize="small">person_add</Icon>,
    route: "/revendedores",
    component: <Resellers />,
    // Roles with double quotes
    allowedRoles: ["Administrador", "Editor"], // All authenticated users
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
];

export default routes;
