/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */

// @mui material components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Import dayjs for date formatting
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat"; // Importa este plugin
import "dayjs/locale/es"; // Importa el locale en español

// Extiende dayjs con el plugin customParseFormat
dayjs.extend(customParseFormat);
// Establece el locale globalmente para dayjs
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
    case "placed":
      translatedStatus = "Recibido";
      color = "warning";
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
    case "shipped":
      translatedStatus = "Enviado";
      color = "success";
      break;
    case "expired":
      translatedStatus = "Vencido";
      color = "error";
      break;
    default:
      translatedStatus = status.charAt(0).toUpperCase() + status.slice(1);
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

    rows: ordersToDisplay.map((order) => {
      // *** CAMBIO CLAVE AQUÍ: Usamos customParseFormat con el formato exacto "D/M/YYYY" ***
      // 'D' para día sin cero inicial, 'M' para mes sin cero inicial, 'YYYY' para año completo.
      const parsedDate = dayjs(order.createdAt, "D/M/YYYY");

      // Verificamos si la fecha es válida. Si no lo es, mostramos un mensaje de depuración.
      const formattedDate = parsedDate.isValid()
        ? parsedDate.format("DD/MM/YYYY")
        : `Fecha Inválida: '${order.createdAt}'`; // Mensaje más útil para depuración

      // Opcional: Para depurar en consola qué valor está llegando
      // console.log(`Debug Date: Original: '${order.createdAt}', Parsed: ${parsedDate.toString()}, Valid: ${parsedDate.isValid()}, Formatted: ${formattedDate}`);

      return {
        orderId: <CustomCell text={order.orderId || order._id} />,
        createdAt: <CustomCell text={formattedDate} />, // Usa la fecha formateada o el mensaje de depuración
        status: <StatusCell status={order.status} />,
        totalItems: <CustomCell text={order.totalItems?.toString() || "0"} />, // Añadida verificación para null/undefined
        totalPrice: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            ₡{Number(order.totalPrice || 0).toFixed(2)}
          </MDTypography>
        ),
        user: <CustomCell text={order.user || "N/A"} />,
      };
    }),
  };
}
