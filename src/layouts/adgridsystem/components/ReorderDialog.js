import React, { useState } from "react";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";

// Material Dashboard 2 React icons
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CloseIcon from "@mui/icons-material/Close";

// Drag and drop
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const ReorderDialog = ({ open, onClose, onSave, items, loading }) => {
  const [reorderedItems, setReorderedItems] = useState(items);

  // Update local state when items prop changes
  React.useEffect(() => {
    setReorderedItems(items);
  }, [items]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const itemsCopy = Array.from(reorderedItems);
    const [reorderedItem] = itemsCopy.splice(result.source.index, 1);
    itemsCopy.splice(result.destination.index, 0, reorderedItem);

    setReorderedItems(itemsCopy);
  };

  const handleSave = () => {
    onSave(reorderedItems);
  };

  const handleClose = () => {
    setReorderedItems(items); // Reset to original order
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <MDTypography variant="h6">Reordenar Items</MDTypography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </MDBox>
      </DialogTitle>

      <DialogContent>
        <MDTypography variant="body2" color="text" sx={{ mb: 2 }}>
          Arrastra y suelta los items para cambiar su orden. El primer item aparecerá primero en el
          grid.
        </MDTypography>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="grid-items">
            {(provided) => (
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {reorderedItems.map((item, index) => (
                  <Draggable key={item._id} draggableId={item._id} index={index}>
                    {(provided, snapshot) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        component={Paper}
                        elevation={snapshot.isDragging ? 3 : 1}
                        sx={{
                          mb: 1,
                          transition: "all 0.2s",
                          transform: snapshot.isDragging ? "rotate(2deg)" : "none",
                          backgroundColor: snapshot.isDragging
                            ? "primary.light"
                            : "background.paper",
                        }}
                      >
                        <ListItemIcon {...provided.dragHandleProps}>
                          <DragIndicatorIcon color="action" />
                        </ListItemIcon>

                        <MDBox
                          component="img"
                          src={item.image}
                          alt={item.alt}
                          sx={{
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: 1,
                            mr: 2,
                          }}
                        />

                        <ListItemText
                          primary={
                            <MDTypography variant="subtitle1" fontWeight="bold">
                              {item.title}
                            </MDTypography>
                          }
                          secondary={
                            <MDBox>
                              <MDTypography variant="body2" color="text">
                                {item.department}
                              </MDTypography>
                              <MDTypography variant="caption" color="text">
                                Orden: {index}
                              </MDTypography>
                            </MDBox>
                          }
                        />

                        <MDBox
                          sx={{
                            backgroundColor: "primary.main",
                            color: "white",
                            borderRadius: "50%",
                            width: 24,
                            height: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                          }}
                        >
                          {index + 1}
                        </MDBox>
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </DialogContent>

      <DialogActions>
        <MDButton onClick={handleClose} disabled={loading}>
          Cancelar
        </MDButton>
        <MDButton onClick={handleSave} variant="gradient" color="info" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Orden"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

ReorderDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      alt: PropTypes.string,
      title: PropTypes.string.isRequired,
      department: PropTypes.string.isRequired,
    })
  ).isRequired,
  loading: PropTypes.bool,
};

export default ReorderDialog;
