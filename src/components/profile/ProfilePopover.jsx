import React, { useState } from "react";
import {
  IconButton,
  Popover,
  Typography,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAccount } from "wagmi";

const ProfilePopover = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "profile-popover" : undefined;
  const { isConnected } = useAccount();
  const balance = 500;

  // Replace with your actual user data
  const publicKey = "0xYourPublicKey"; // User's public key

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  // Function to set the public key
  const handleSetPublicKey = () => {
    // Implement your logic to set the public key
  };

  return (
    <div>
      <IconButton
        color="inherit"
        aria-describedby={id}
        onClick={handlePopoverOpen}
      >
        <AccountCircleIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div style={{ padding: "16px", maxWidth: "320px" }}>
          <Typography variant="h6">System Overview</Typography>
          <Typography>Current Stake: {balance} OT</Typography>
          <Typography>Needed Stake Amount: {balance} OT</Typography>

          <div
            style={{ display: "flex", alignItems: "center", marginTop: "16px" }}
          >
            <TextField
              label="New Public Key"
              variant="outlined"
              value={publicKey}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: "16px", backgroundColor: "#2e5d4b" }}
            >
              Set PubKey
            </Button>
          </div>
          <Typography>Public Key [Hidden]</Typography>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            style={{ marginTop: "16px", backgroundColor: "#2e5d4b" }}
          >
            Stake Tokens
          </Button>
        </div>
      </Popover>
    </div>
  );
};

export default ProfilePopover;
