// frontend/src/layouts/orders/templates/OrderDetail.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types"; // Import PropTypes for validation
import html2pdf from "html2pdf.js";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDBadge from "components/MDBadge"; // Assuming MDBadge is used for status display
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Contexts
import { useOrders } from "contexts/OrderContext";
import { useAuth } from "contexts/AuthContext"; // To determine user role for permissions
import { useConfig } from "contexts/ConfigContext";

// Status Translations
const statusTranslations = {
  pending: "Pendiente",
  placed: "Realizado",
  cancelled: "Cancelado",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
};

// Helper component for Order Status Badge
const OrderStatusBadge = ({ status }) => {
  const badgeText = statusTranslations[status] || status;
  let badgeColor;
  switch (status) {
    case "pending":
    case "placed":
      badgeColor = "info";
      break;
    case "processing":
      badgeColor = "warning";
      break;
    case "shipped":
    case "delivered":
      badgeColor = "success";
      break;
    case "cancelled":
      badgeColor = "error";
      break;
    default:
      badgeColor = "dark";
  }

  return <MDBadge badgeContent={badgeText} color={badgeColor} variant="gradient" size="md" />;
};

// Add PropTypes for OrderStatusBadge
OrderStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById, loading: orderLoading } = useOrders();
  const { user } = useAuth();
  const { systemEnv } = useConfig();

  const [order, setOrder] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [trackingNo, setTrackingNo] = useState("");
  const [updatingTracking, setUpdatingTracking] = useState(false);

  // Determine the reseller category for pricing display
  // This might not be directly relevant for OrderDetail if prices are stored with the order,
  // but keeping it here for consistency if needed for future features.
  const currentResellerCategory = user?.role === "Revendedor" ? user.resellerCategory : "cat1";

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setInitialLoadComplete(false);
        setFetchError(null);
        if (typeof getOrderById !== "function") {
          throw new Error("Function to get order by ID is not available.");
        }
        const fetchedOrder = await getOrderById(id);
        if (fetchedOrder) {
          setOrder(fetchedOrder);
        } else {
          setFetchError("Detalles del pedido no encontrados.");
          toast.error("Detalles del pedido no encontrados.");
        }
      } catch (err) {
        setFetchError(err.message || "Error al cargar los detalles del pedido.");
        toast.error(err.message || "Error al cargar los detalles del pedido.");
        console.error("Error fetching order details:", err);
      } finally {
        setInitialLoadComplete(true);
      }
    };

    if (id) {
      fetchOrderData();
    }
  }, [id, getOrderById]);

  useEffect(() => {
    if (order?.trackingNumber) {
      setTrackingNo(order.trackingNumber);
    }
  }, [order]);

  const handleUpdateTracking = async () => {
    setUpdatingTracking(true);
    try {
      const { api } = useAuth.getState?.() || {}; // This is ad-hoc, better use a prop or context if available
      // Actually, OrderContext should have the api or a method.
      // Let's check how updateOrder is implemented.
      // The user mentioned "modificar el admin app para incluir este campo opcional".

      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).token
        : null;
      const API_URL = systemEnv?.REACT_APP_BACKEND_URL || "http://192.168.100.114:5000";

      const response = await fetch(`${API_URL}/api/orders/${id}/tracking`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trackingNumber: trackingNo }),
      });

      if (!response.ok) throw new Error("Error al actualizar tracking");

      toast.success("Número de guía actualizado");
      setOrder({ ...order, trackingNumber: trackingNo });
    } catch (err) {
      toast.error(err.message || "Error al actualizar");
    } finally {
      setUpdatingTracking(false);
    }
  };

  const shippingDetails = order?.customerDetails || {};
  const currentProvince =
    order?.user?.provincia || shippingDetails.province || shippingDetails.provincia;
  const currentCity = order?.user?.canton || shippingDetails.city || shippingDetails.canton;
  const currentDistrict = order?.user?.distrito || shippingDetails.distrito;

  const GAM_CANTONS = {
    "san jose": [
      "central",
      "escazu",
      "desamparados",
      "aserri",
      "mora",
      "goicoechea",
      "santa ana",
      "alajuelita",
      "vazquez de coronado",
      "tibas",
      "moravia",
      "montes de oca",
      "curridabat",
      "puriscal",
    ],
    alajuela: [
      "central",
      "atenas",
      "grecia",
      "naranjo",
      "palmares",
      "poas",
      "orotina",
      "sarchi",
      "zarcero",
    ],
    cartago: ["central", "paraiso", "la union", "jimenez", "alvarado", "oreamuno", "el guarco"],
    heredia: [
      "central",
      "barva",
      "santo domingo",
      "santa barbara",
      "san rafael",
      "san isidro",
      "belen",
      "flores",
      "san pablo",
    ],
  };

  const normalize = (str) =>
    str
      ? str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
      : "";

  const isGAM = (prov, cant) => {
    if (!prov || !cant) return false;
    const nProv = normalize(prov);
    const nCant = normalize(cant);
    const gamProv = GAM_CANTONS[nProv];
    return gamProv ? gamProv.includes(nCant) : false;
  };

  const calculateShippingFee = (prov, cant, items) => {
    if (!prov || !cant) return 0;
    const totalWeight = items.reduce(
      (sum, item) => sum + item.quantity * (item.product?.weight || 100),
      0
    );
    const inGAM = isGAM(prov, cant);
    const tariffs = [
      { maxW: 250, gam: 1850, resto: 2150 },
      { maxW: 500, gam: 1950, resto: 2500 },
      { maxW: 1000, gam: 2350, resto: 3450 },
    ];
    const rate = tariffs.find((t) => totalWeight <= t.maxW);

    if (rate) {
      return inGAM ? rate.gam : rate.resto;
    } else {
      // Dynamic formula for weight > 1000g
      const base1kg = inGAM ? 2350 : 3450;
      const extraKiloRate = 1100;
      const totalKilos = totalWeight / 1000;
      const extraKilos = Math.ceil(totalKilos - 1);
      return base1kg + extraKilos * extraKiloRate;
    }
  };

  const displayBreakdown = (() => {
    if (!order) return { itemsSubtotal: 0, itemsTax: 0, shippingBase: 0, shippingTax: 0, total: 0 };

    const isSimplified = order.taxRegime === "simplified";

    // Priority 1: Use stored breakdown if available (confirmed correct by user in emails)
    if (order.taxBreakdown && order.taxBreakdown.itemsSubtotal > 0) {
      return {
        ...order.taxBreakdown,
        discountAmount: order.discountAmount || order.taxBreakdown.discountAmount || 0,
        estimatedTotalCost: order.items.reduce(
          (acc, item) => acc + item.quantity * (item.costAtSale || item.product?.cost || 0),
          0
        ),
      };
    }

    // Priority 2: Fallback to recalculation (for older orders or pending)
    const discountPercentage = order.discountPercentage || order.coupon?.discountPercentage || 0;
    const itemsSubtotal = order.items.reduce(
      (acc, item) => acc + item.quantity * item.priceAtSale,
      0
    );
    const discountAmount = Math.round(itemsSubtotal * (discountPercentage / 100));

    const itemsTax = isSimplified
      ? 0
      : order.items.reduce((acc, item) => {
          const iva =
            parseFloat(item.product?.iva) !== undefined && item.product?.iva !== ""
              ? parseFloat(item.product?.iva)
              : 13;
          const discountedItemBase =
            item.quantity * item.priceAtSale * (1 - discountPercentage / 100);
          return acc + Math.round(discountedItemBase * (iva / 100));
        }, 0);

    let shippingBase = 0;
    let shippingTax = 0;

    // 3. Determine shipping components
    if (order.status === "pending") {
      const sBaseRaw = calculateShippingFee(currentProvince, currentCity, order.items);
      shippingBase = isSimplified ? Math.round(sBaseRaw * 1.13) : sBaseRaw;
      shippingTax = isSimplified ? 0 : Math.round(shippingBase * 0.13);
    } else if (order.taxBreakdown && order.taxBreakdown.shippingBase > 0) {
      shippingBase = order.taxBreakdown.shippingBase;
      shippingTax = order.taxBreakdown.shippingTax;

      if (isSimplified && shippingTax > 0) {
        shippingBase = Math.round(shippingBase * 1.13);
        shippingTax = 0;
      }
    } else {
      const sBaseRaw = 3450;
      shippingBase = isSimplified ? Math.round(sBaseRaw * 1.13) : sBaseRaw;
      shippingTax = isSimplified ? 0 : Math.round(shippingBase * 0.13);
    }

    // Total = Net Subtotal - Discount + Discounted Tax + Shipping
    const calculatedTotal = Math.round(
      itemsSubtotal - discountAmount + itemsTax + shippingBase + shippingTax
    );

    // NEW: Estimated cost calculation for fallback (if order record has 0 cost)
    const estimatedTotalCost = order.items.reduce(
      (acc, item) => acc + item.quantity * (item.costAtSale || item.product?.cost || 0),
      0
    );

    return {
      itemsSubtotal,
      itemsTax,
      shippingBase,
      shippingTax,
      discountAmount,
      total: Math.round(calculatedTotal),
      estimatedTotalCost,
    };
  })();

  if (!initialLoadComplete || orderLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="info" />
          <MDTypography variant="h5" ml={2}>
            Cargando datos del pedido...
          </MDTypography>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

  if (fetchError || !order) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <MDTypography variant="h5" color="error">
            Error: {fetchError}
          </MDTypography>
          <MDButton
            onClick={() => navigate("/orders")}
            variant="gradient"
            color="info"
            sx={{ mt: 2 }}
          >
            Volver a Pedidos
          </MDButton>
        </Box>
        <Footer />
      </DashboardLayout>
    );
  }

  const isEditable = ["placed", "processing", "shipped", "cancelled", "delivered"].includes(
    order.status
  );
  // Assuming 'approvedBy' exists on the order if an admin/editor has processed it
  const approvedByAdmin = order.approvedBy
    ? `${order.approvedBy.firstName} ${order.approvedBy.lastName}`
    : "N/A";

  const fullAddress = [
    order.user?.provincia || order.customerDetails?.provincia || order.customerDetails?.province,
    order.user?.canton || order.customerDetails?.canton || order.customerDetails?.city,
    order.user?.distrito || order.customerDetails?.distrito,
    order.user?.address || order.customerDetails?.address,
  ]
    .filter((part) => part && part !== "N/A" && part !== "undefined" && part !== "")
    .join(", ");

  const handlePrintLabel = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Etiqueta de Envío</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; }
            .label-container { 
              border: 2px solid #000; 
              width: 400px; 
              padding: 20px; 
              border-radius: 10px;
              margin: 0 auto;
            }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .content p { margin: 8px 0; font-size: 16px; font-weight: bold; }
            .title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
            .footer { margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="header">
              <div class="title">ETIQUETA DE ENVÍO</div>
              <div>Pedido #${order.orderNumber || order._id}</div>
              <div>Fecha: ${new Date(order.createdAt).toLocaleDateString("es-CR")}</div>
            </div>
            <div class="content">
              <p>DESTINATARIO: <br/><span style="font-weight: normal; font-size: 18px;">${
                order.customerDetails?.name || "N/A"
              }</span></p>
              <p>TELÉFONO: <br/><span style="font-weight: normal; font-size: 18px;">${
                order.customerDetails?.phoneNumber || "N/A"
              }</span></p>
              <p>DIRECCIÓN: <br/><span style="font-weight: normal; font-size: 16px;">${
                [
                  order.user?.provincia ||
                    order.customerDetails?.provincia ||
                    order.customerDetails?.province,
                  order.user?.canton ||
                    order.customerDetails?.canton ||
                    order.customerDetails?.city,
                  order.user?.distrito || order.customerDetails?.distrito,
                  order.user?.address || order.customerDetails?.address,
                ]
                  .filter((p) => p && p !== "N/A" && p !== "undefined" && p !== "")
                  .join(", ") || "N/A"
              }</span></p>
            </div>
            <div class="footer">
              Enviado a través de nuestra red de logística.
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintSimplifiedTicket = () => {
    const { itemsSubtotal, itemsTax, shippingBase, shippingTax, discountAmount, total } =
      displayBreakdown;
    const isSimplified = order?.taxRegime === "simplified";
    const company = systemEnv?.company || {
      name: "ORIYINA⅃",
      cedula: "3101750500",
      codigoActividad: "620200",
      address: "San José, Costa Rica",
      phone: "22222222",
      email: "info@empresa.cr",
    };

    const formatCurrency = (amount) => `₡${Math.round(amount).toLocaleString("es-CR")}`;

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #fff;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">¡Gracias por tu compra!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Tu comprobante ha sido generado exitosamente</p>
          </div>
          
          <div style="padding: 30px;">
            <div style="background: #4caf50; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; display: inline-block; margin-bottom: 20px;">
              ✅ PAGO APROBADO
            </div>
            
            <div style="background: #f0f2f5; padding: 15px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; line-height: 1.4;">
              <h3 style="margin: 0 0 10px 0; color: #333; font-size: 15px;">Información del Emisor</h3>
              <strong>Nombre/Razón Social:</strong> ${company.name}<br>
              <strong>Cédula:</strong> ${company.cedula}<br>
              <strong>Código Actividad:</strong> ${company.codigoActividad}<br>
              <strong>Dirección:</strong> ${company.address}<br>
              <strong>Teléfono:</strong> ${company.phone}<br>
              <strong>Email:</strong> ${company.email}
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #667eea;">
              <h2 style="margin-top: 0; font-size: 20px;">Orden #${
                order.orderNumber || order._id
              }</h2>
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date(
                order.createdAt
              ).toLocaleDateString("es-CR")}</p>
              <p style="margin: 5px 0;"><strong>Estado:</strong> Confirmada</p>
              <p style="margin: 5px 0;"><strong>Método de pago:</strong> ${
                order.paymentMethod || "Tilopay"
              }</p>
            </div>
            
            <h3 style="margin-top: 25px; margin-bottom: 10px;">Detalles de los productos:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr>
                  <th style="background: #667eea; color: white; text-align: left; padding: 12px; font-weight: 600; border-radius: 6px 0 0 0;">Producto</th>
                  <th style="background: #667eea; color: white; text-align: center; padding: 12px; font-weight: 600;">Cant.</th>
                  <th style="background: #667eea; color: white; text-align: right; padding: 12px; font-weight: 600;">Precio</th>
                  <th style="background: #667eea; color: white; text-align: right; padding: 12px; font-weight: 600; border-radius: 0 6px 0 0;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item) => `
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd;">
                      <strong>${item.name || "Producto"}</strong>
                      ${
                        item.code
                          ? `<br><small style="color: #666;">Código: ${item.code}</small>`
                          : ""
                      }
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${
                      item.quantity
                    }</td>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(
                      item.priceAtSale
                    )}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(
                      item.quantity * item.priceAtSale
                    )}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px; text-align: right;">
              <div style="font-size: 24px; font-weight: bold; color: #2c5530;">Total: ${formatCurrency(
                total
              )}</div>
              <div style="margin-top: 10px; font-size: 14px; color: #666;">
                <div>${
                  isSimplified ? "Subtotal Productos:" : "Subtotal Productos (Sin IVA):"
                } ${formatCurrency(itemsSubtotal)}</div>
                ${
                  !isSimplified
                    ? `
                    <div>IVA Productos (13%): ${formatCurrency(itemsTax)}</div>
                    <div>Envío (Sin IVA): ${formatCurrency(shippingBase)}</div>
                    <div>IVA Envío (13%): ${formatCurrency(shippingTax)}</div>
                  `
                    : `
                    <div>Envío: ${formatCurrency(shippingBase)}</div>
                    <div style="margin-top: 10px; font-style: italic;">"Contribuyente inscrito en el Régimen de Tributación Simplificada"</div>
                  `
                }
                ${
                  discountAmount > 0
                    ? `
                    <div style="margin-top: 5px; color: #2c5530; font-weight: bold;">
                      Descuento Cupón ${
                        order.coupon?.code ? `(${order.coupon.code})` : ""
                      }: -${formatCurrency(discountAmount)}
                    </div>
                  `
                    : ""
                }
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px;">
              <p><strong>ORIYINA⅃</strong></p>
              <p>¡Gracias por su preferencia!</p>
            </div>
          </div>
        </div>
      </div>
    `;

    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    document.body.appendChild(element);

    const opt = {
      margin: 10,
      filename: `Comprobante_Pedido_${order.orderNumber || order._id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        document.body.removeChild(element);
      });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={10}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                justifyContent={{ xs: "center", sm: "space-between" }}
                alignItems="center"
                textAlign={{ xs: "center", sm: "left" }}
              >
                <MDTypography variant="h6" color="white" mb={{ xs: 2, sm: 0 }}>
                  Detalles del Pedido: {order.orderNumber || order._id}
                </MDTypography>
                <MDBox
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexWrap="wrap"
                  gap={1}
                >
                  <MDButton
                    onClick={handlePrintLabel}
                    variant="gradient"
                    color="primary"
                    startIcon={<LocalPrintshopIcon />}
                    size="small"
                  >
                    Imprimir Etiqueta
                  </MDButton>
                  <MDButton
                    onClick={handlePrintSimplifiedTicket}
                    variant="gradient"
                    color="success"
                    startIcon={<LocalPrintshopIcon />}
                    size="small"
                  >
                    Imprimir Comprobante
                  </MDButton>
                  {isEditable && (user?.role === "Administrador" || user?.role === "Editor") && (
                    <MDButton
                      onClick={() => navigate(`/orders/edit/${order._id}`)}
                      variant="gradient"
                      color="warning"
                      size="small"
                    >
                      Ver Pedido
                    </MDButton>
                  )}
                  <MDButton
                    onClick={() => navigate("/orders")}
                    variant="gradient"
                    color="dark"
                    size="small"
                  >
                    Volver
                  </MDButton>
                </MDBox>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={3}>
                  {/* Order Details */}
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="h6" mb={1}>
                      Información del Pedido:
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Número de Pedido:
                      </MDTypography>{" "}
                      {order.orderNumber || order._id}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Fecha del Pedido:
                      </MDTypography>{" "}
                      {new Date(order.createdAt).toLocaleDateString("es-CR")}
                    </MDTypography>
                    <MDBox display="flex" alignItems="center" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold" mr={1}>
                        Estado:
                      </MDTypography>{" "}
                      <OrderStatusBadge status={order.status} /> {/* Use the helper component */}
                    </MDBox>
                    <MDBox mt={2} p={2} sx={{ border: "1px solid #eee", borderRadius: "8px" }}>
                      <MDTypography variant="h6" mb={1} sx={{ fontSize: "0.9rem" }}>
                        Guía Correos de Costa Rica:
                      </MDTypography>
                      <MDBox display="flex" gap={1}>
                        <MDInput
                          size="small"
                          value={trackingNo}
                          onChange={(e) => setTrackingNo(e.target.value)}
                          placeholder="Número de guía..."
                          fullWidth
                        />
                        <MDButton
                          variant="gradient"
                          color="info"
                          size="small"
                          onClick={handleUpdateTracking}
                          disabled={updatingTracking}
                        >
                          {updatingTracking ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            "Actualizar"
                          )}
                        </MDButton>
                      </MDBox>
                    </MDBox>
                    <MDBox mt={2}>
                      <MDTypography variant="h6" mb={1}>
                        Desglose de Pago:
                      </MDTypography>
                      <MDTypography variant="body2" color="text" mb={0.5}>
                        {order?.taxRegime === "simplified"
                          ? "Subtotal Productos:"
                          : "Subtotal Productos (Sin IVA):"}{" "}
                        {Math.round(displayBreakdown.itemsSubtotal).toLocaleString("es-CR", {
                          style: "currency",
                          currency: "CRC",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </MDTypography>
                      {order?.taxRegime !== "simplified" && (
                        <MDTypography variant="body2" color="text" mb={0.5}>
                          IVA Productos (13%):{" "}
                          {Math.round(displayBreakdown.itemsTax).toLocaleString("es-CR", {
                            style: "currency",
                            currency: "CRC",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </MDTypography>
                      )}
                      <MDTypography variant="body2" color="text" mb={0.5}>
                        {order?.taxRegime === "simplified"
                          ? "Envío (Correos de CR):"
                          : "Envío (Sin IVA):"}{" "}
                        {Math.round(displayBreakdown.shippingBase).toLocaleString("es-CR", {
                          style: "currency",
                          currency: "CRC",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </MDTypography>
                      {order?.taxRegime !== "simplified" && (
                        <MDTypography variant="body2" color="text" mb={0.5}>
                          IVA Envío (13%):{" "}
                          {Math.round(displayBreakdown.shippingTax).toLocaleString("es-CR", {
                            style: "currency",
                            currency: "CRC",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </MDTypography>
                      )}
                      {displayBreakdown.discountAmount > 0 && (
                        <MDTypography
                          variant="body2"
                          sx={{ color: "success.main", fontWeight: "bold" }}
                          mb={0.5}
                        >
                          Descuento Cupón {order.coupon?.code ? `(${order.coupon.code})` : ""}: -{" "}
                          {Math.round(displayBreakdown.discountAmount).toLocaleString("es-CR", {
                            style: "currency",
                            currency: "CRC",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </MDTypography>
                      )}
                      <MDBox mt={1} pt={1} borderTop="1px solid #eee">
                        <MDTypography variant="h6">
                          Total Pagado:{" "}
                          {Math.round(displayBreakdown.total).toLocaleString("es-CR", {
                            style: "currency",
                            currency: "CRC",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </MDTypography>
                      </MDBox>

                      {/* NEW: Profit & Cost Section for Admin/Editor */}
                      {(user?.role === "Administrador" || user?.role === "Editor") && (
                        <MDBox mt={2} pt={2} borderTop="2px dashed #eee">
                          <MDTypography variant="h6" color="success">
                            Información de Rentabilidad:
                          </MDTypography>
                          <MDTypography variant="body2" color="text" mb={0.5}>
                            <MDTypography component="span" variant="button" fontWeight="bold">
                              Costo Total:
                            </MDTypography>{" "}
                            {(() => {
                              const effectiveCost =
                                order.totalCost && order.totalCost > 0
                                  ? order.totalCost
                                  : displayBreakdown.estimatedTotalCost;
                              return Math.round(effectiveCost).toLocaleString("es-CR", {
                                style: "currency",
                                currency: "CRC",
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              });
                            })()}
                          </MDTypography>
                          <MDTypography variant="body2" color="text" mb={0.5}>
                            <MDTypography component="span" variant="button" fontWeight="bold">
                              Utilidad Total:
                            </MDTypography>{" "}
                            {(() => {
                              const effectiveCost =
                                order.totalCost && order.totalCost > 0
                                  ? order.totalCost
                                  : displayBreakdown.estimatedTotalCost;
                              const profit = displayBreakdown.total - effectiveCost;
                              return Math.round(profit).toLocaleString("es-CR", {
                                style: "currency",
                                currency: "CRC",
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              });
                            })()}
                          </MDTypography>
                        </MDBox>
                      )}
                    </MDBox>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Realizado por:
                      </MDTypography>{" "}
                      {order.user?.firstName} {order.user?.lastName} ({order.user?.email})
                    </MDTypography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <MDTypography variant="h6" mb={1}>
                      Detalles del Cliente Final:
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Nombre:
                      </MDTypography>{" "}
                      {order.customerDetails?.name}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Teléfono:
                      </MDTypography>{" "}
                      {order.customerDetails?.phoneNumber}
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mb={0.5}>
                      <MDTypography component="span" variant="button" fontWeight="bold">
                        Dirección:
                      </MDTypography>{" "}
                      {[
                        order.user?.provincia ||
                          order.customerDetails?.provincia ||
                          order.customerDetails?.province,
                        order.user?.canton ||
                          order.customerDetails?.canton ||
                          order.customerDetails?.city,
                        order.user?.distrito || order.customerDetails?.distrito,
                        order.user?.address || order.customerDetails?.address,
                      ]
                        .filter((val) => val && val !== "N/A" && val !== "undefined" && val !== "")
                        .join(", ") || "N/A"}
                    </MDTypography>
                  </Grid>

                  {/* Order Items */}
                  <Grid item xs={12}>
                    <MDTypography variant="h6" mt={3} mb={2}>
                      Artículos del Pedido ({order.items.length}):
                    </MDTypography>
                    {order.items.length === 0 ? (
                      <MDTypography variant="body2" color="text">
                        No hay productos en este pedido.
                      </MDTypography>
                    ) : (
                      <MDBox>
                        {order.items.map((item) => (
                          <MDBox
                            key={item.product?._id || item._id}
                            display="flex"
                            flexDirection={{ xs: "column", sm: "row" }}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            justifyContent="space-between"
                            mb={1}
                            p={1}
                            borderBottom="1px solid #eee"
                            gap={1}
                          >
                            <MDBox
                              display="flex"
                              alignItems="center"
                              sx={{ flex: "1 1 auto", minWidth: 0 }}
                            >
                              <MDBox
                                component="img"
                                src={"/placeholder.png"}
                                alt={item.name || "Item"}
                                sx={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "md",
                                  mr: 1.5,
                                  flexShrink: 0,
                                }}
                                onError={(e) => {
                                  e.target.src = "/placeholder.png";
                                }}
                              />
                              <MDTypography
                                variant="button"
                                fontWeight="medium"
                                sx={{ wordBreak: "break-word" }}
                              >
                                {item.name} (Cód: {item.code}) - {item.quantity} x{" "}
                                {Math.round(item.priceAtSale).toLocaleString("es-CR", {
                                  style: "currency",
                                  currency: "CRC",
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                })}
                                {(user?.role === "Administrador" || user?.role === "Editor") && (
                                  <>
                                    <br />
                                    <MDTypography
                                      component="span"
                                      variant="caption"
                                      color="text"
                                      fontWeight="regular"
                                    >
                                      Costo unit:{" "}
                                      {Math.round(item.costAtSale || 0).toLocaleString("es-CR", {
                                        style: "currency",
                                        currency: "CRC",
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                      })}
                                    </MDTypography>
                                  </>
                                )}
                              </MDTypography>
                            </MDBox>
                            <MDTypography
                              variant="button"
                              fontWeight="medium"
                              sx={{ flexShrink: 0 }}
                            >
                              {order?.taxRegime === "simplified"
                                ? "Subtotal:"
                                : "Subtotal sin iva:"}{" "}
                              {Math.round(item.quantity * item.priceAtSale).toLocaleString(
                                "es-CR",
                                {
                                  style: "currency",
                                  currency: "CRC",
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }
                              )}
                            </MDTypography>
                          </MDBox>
                        ))}
                      </MDBox>
                    )}
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default OrderDetail;
