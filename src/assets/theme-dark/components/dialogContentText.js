// frontend/src/assets/theme-dark/components/dialog/dialogContentText.js

// Material Dashboard 2 React Base Styles
import typography from "assets/theme-dark/base/typography";
import colors from "assets/theme-dark/base/colors";

const { size } = typography;
const { white, text } = colors; // Ensure 'white' and 'text' colors are available

const dialogContentText = {
  styleOverrides: {
    root: {
      fontSize: size.md,
      // **IMPORTANT FIX:** Explicitly set the content text color for visibility in dark mode.
      color: white.main, // Explicitly set to white or a light text color from your theme
    },
  },
};

export default dialogContentText;
