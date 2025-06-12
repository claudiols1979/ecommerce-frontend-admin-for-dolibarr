// frontend/src/assets/theme-dark/components/dialog/dialogTitle.js

// Material Dashboard 2 React Base Styles
import typography from "assets/theme-dark/base/typography";
import colors from "assets/theme-dark/base/colors";

const { h6 } = typography;
const { white, text } = colors; // Ensure 'white' and 'text' colors are available

const dialogTitle = {
  styleOverrides: {
    root: {
      padding: "16px 24px",
      // **IMPORTANT FIX:** Ensure the title text color is visible in dark mode.
      color: white.main, // Explicitly set to white or a light text color from your theme
      "& h2": {
        // Target the typography component rendered inside DialogTitle
        color: white.main,
      },
    },
  },
};

export default dialogTitle;
