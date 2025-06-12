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

import { useState } from "react";
import PropTypes from "prop-types"; // NEW: Import PropTypes

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
// import Menu from "@mui/material/Menu";
// import MenuItem from "@mui/material/MenuItem";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React examples
import DataTable from "examples/Tables/DataTable";

// Data
import data from "layouts/dashboard/components/Projects/data";

// Modify Projects component to accept 'orders' prop
function Projects({ orders }) {
  // const [menu, setMenu] = useState(null);

  // const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  // const closeMenu = () => setMenu(null);

  // IMPORTANT: Pass the 'orders' prop to the data() function
  const { columns, rows } = data(orders);

  // const renderMenu = (
  //   <Menu
  //     id="simple-menu"
  //     anchorEl={menu}
  //     anchorOrigin={{
  //       vertical: "top",
  //       horizontal: "left",
  //     }}
  //     transformOrigin={{
  //       vertical: "top",
  //       horizontal: "right",
  //     }}
  //     open={Boolean(menu)}
  //     onClose={closeMenu}
  //   >
  //     <MenuItem onClick={closeMenu}>Action</MenuItem>
  //     <MenuItem onClick={closeMenu}>Another action</MenuItem>
  //     <MenuItem onClick={closeMenu}>Something else</MenuItem>
  //   </Menu>
  // );

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            Últimas 10 Órdenes
          </MDTypography>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <Icon
              sx={{
                fontWeight: "bold",
                color: ({ palette: { info } }) => info.main,
                mt: -0.5,
              }}
            >
              check
            </Icon>
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;<strong>Listado de órdenes recientes</strong>
            </MDTypography>
          </MDBox>
        </MDBox>
        {/* The Menu icon and menu rendering are commented out here, as per your previous request */}
        {/* <MDBox color="text" px={2}>
          <Icon sx={{ cursor: "pointer", fontWeight: "bold" }} fontSize="small" onClick={openMenu}>
            more_vert
          </Icon>
        </MDBox> */}
        {/* {renderMenu} */}
      </MDBox>
      <MDBox>
        <DataTable
          table={{ columns, rows }}
          showTotalEntries={false}
          isSorted={false}
          noEndBorder
          entriesPerPage={false}
        />
      </MDBox>
    </Card>
  );
}

// NEW: Add propTypes validation for the 'orders' prop
Projects.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      totalItems: PropTypes.number.isRequired,
      totalPrice: PropTypes.number.isRequired,
      user: PropTypes.string, // User might be optional or might be an object depending on your exact data
    })
  ),
};

export default Projects;
