// frontend/src/assets/theme-dark/components/dialog.js

// Material Dashboard 2 React Base Styles
import borders from "assets/theme-dark/base/borders";
import boxShadows from "assets/theme-dark/base/boxShadows";
import colors from "assets/theme-dark/base/colors"; // Assuming colors are defined here

const { borderRadius } = borders;
const { dark, white, transparent } = colors; // Ensure 'dark' color is available in your colors.js for dark mode

const dialog = {
  styleOverrides: {
    paper: {
      borderRadius: borderRadius.xl,
      boxShadow: boxShadows.xxl,
      // **IMPORTANT FIX:** Explicitly set a dark background for the dialog in dark mode.
      // This overrides any default light background that might be coming from the base theme.
      backgroundColor: dark.main, // Use your theme's primary dark color
      // Ensure text color defaults to primary text of the dark theme for good contrast
      color: white.main, // Set a default light text color for the dialog content
    },
  },
};

export default dialog;
