import React, { useState } from "react";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

export default function DeliveryAddressPopover({ open, anchorEl, onClose }) {
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const handleSend = () => {
    // Add your logic to handle sending the delivery address
    console.log("Sending address:", deliveryAddress);
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Box
        p={2}
        sx={{
          background: "linear-gradient(to right bottom, #430089, #82ffa1)",
          width: "500px",
        }}
      >
        <TextField
          label="Delivery Address"
          variant="outlined"
          fullWidth
          value={deliveryAddress}
          multiline
          rows={4}
          onChange={(e) => setDeliveryAddress(e.target.value)}
        />
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSend}
            sx={{ backgroundColor: "#2e5d4b" }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
