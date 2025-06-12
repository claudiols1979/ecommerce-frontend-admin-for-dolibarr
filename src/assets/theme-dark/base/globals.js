// frontend/src/assets/theme-dark/base/globals.js

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

// Material Dashboard 2 React Base Styles
import colors from "assets/theme-dark/base/colors";

const { info, dark, white } = colors; // Ensure 'dark' and 'white' are available in your colors.js

const globals = {
  html: {
    scrollBehavior: "smooth",
  },
  // Ensure global resets are still here, but add body styling for dark mode
  "*, *::before, *::after": {
    margin: 0,
    padding: 0,
  },
  "a, a:link, a:visited": {
    textDecoration: "none !important",
  },
  "a.link, .link, a.link:link, .link:link, a.link:visited, .link:visited": {
    // These link colors should be fine as they typically use theme colors
  },
  "a.link:hover, .link:hover, a.link:focus, .link:focus": {
    // These link colors should be fine
  },
  body: {
    // **IMPORTANT FIX:** Explicitly set dark background and light text for dark mode
    // This will ensure the default document background and text are correct,
    // which the dialog often inherits if no specific styles are applied.
    backgroundColor: dark.main, // Use a primary dark color for the background
    color: white.main, // Use a light color for the default text
    "&::-webkit-scrollbar": {
      width: "10px",
    },
    "&::-webkit-scrollbar-track": {
      background: dark.main, // Dark scrollbar track
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: info.main, // Info color for scrollbar thumb
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: info.focus, // Slightly darker info color on hover
    },
  },
};

export default globals;
