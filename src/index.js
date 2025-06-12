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

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "App";

// Material Dashboard 2 React Context Provider
import { MaterialUIControllerProvider } from "context";

// Import your AuthProvider
import { AuthProvider } from "./contexts/AuthContext";

import { DashboardProvider } from "./contexts/DashboardContext";
import { ProductProvider } from "./contexts/ProductContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <MaterialUIControllerProvider>
      <AuthProvider>
        <DashboardProvider>
          <ProductProvider>
            <App />
          </ProductProvider>
        </DashboardProvider>
        <ToastContainer
          position="top-right" // Position of the toast notifications
          autoClose={5000} // Close after 5 seconds
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </MaterialUIControllerProvider>
  </BrowserRouter>
);
