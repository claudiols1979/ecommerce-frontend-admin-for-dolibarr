/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
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

// @mui material components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Import dayjs for date formatting
import dayjs from "dayjs";
import "dayjs/locale/es"; // Import Spanish locale for dates

// Set locale globally for dayjs (optional, but good for consistency)
dayjs.locale("es");

// Helper component for displaying text in table cells
const CustomCell = ({ text }) => (
  <MDBox display="flex" alignItems="center" lineHeight={1}>
    <MDTypography variant="caption" color="text" fontWeight="medium">
      {text}
    </MDTypography>
  </MDBox>
);

// Helper component for status display with Spanish translation
const StatusCell = ({ status }) => {
  let color;
  let translatedStatus;

  switch (status.toLowerCase()) {
    case "pending":
      translatedStatus = "Pendiente";
      color = "warning";
      break;
    case "placed": // NEW: Added 'placed' status
      translatedStatus = "Recibido"; // Or 'Realizada', 'Confirmado'
      color = "warning"; // Or 'dark', 'secondary'
      break;
    case "delivered":
      translatedStatus = "Entregado";
      color = "success";
      break;
    case "cancelled":
      translatedStatus = "Cancelado";
      color = "error";
      break;
    case "processing":
      translatedStatus = "Procesando";
      color = "warning";
      break;
    case "shipped": // Example: Add other statuses if you have them
      translatedStatus = "Enviado";
      color = "success";
      break;
    case "expired": // NEW: Added 'expired' status
      translatedStatus = "Vencido";
      color = "error"; // Using 'dark' for expired status
      break;
    default:
      translatedStatus = status.charAt(0).toUpperCase() + status.slice(1); // Default to capitalize if unknown
      color = "text";
  }

  return (
    <MDTypography variant="caption" fontWeight="medium" color={color}>
      {translatedStatus}
    </MDTypography>
  );
};

// Main function to generate table data from orders
export default function data(orders) {
  // Ensure orders is an array, default to empty if null/undefined
  const ordersToDisplay = orders || [];

  return {
    columns: [
      { Header: "ID de Orden", accessor: "orderId", width: "15%", align: "left" },
      { Header: "Fecha", accessor: "createdAt", width: "15%", align: "left" },
      { Header: "Estado", accessor: "status", width: "15%", align: "center" },
      { Header: "Items", accessor: "totalItems", width: "10%", align: "center" },
      { Header: "Total", accessor: "totalPrice", width: "15%", align: "right" },
      { Header: "Cliente", accessor: "user", width: "30%", align: "left" },
    ],

    rows: ordersToDisplay.map((order) => ({
      // MODIFIED: Use order.orderId for the ID
      orderId: <CustomCell text={order.orderId || order._id} />, // Fallback to _id if orderId is missing
      // MODIFIED: Date format to MM/DD/YYYY (no time)
      createdAt: <CustomCell text={dayjs(order.createdAt).format("MM/DD/YYYY")} />,
      // Keep using StatusCell for Spanish translation
      status: <StatusCell status={order.status} />,
      totalItems: <CustomCell text={order.totalItems.toString()} />,
      totalPrice: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {/* Ensure totalPrice is a number before calling toFixed() */}₡
          {Number(order.totalPrice || 0).toFixed(2)}
        </MDTypography>
      ),
      user: <CustomCell text={order.user || "N/A"} />,
    })),
  };
}
