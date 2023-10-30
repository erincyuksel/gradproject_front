import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { MenuItem } from "@mui/material";
import ProfilePopover from "../profile/ProfilePopover";
import {
  useAccount,
  useConnect,
  useEnsName,
  useDisconnect,
  useConfig,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useNavigate } from "react-router-dom";

export default function ApplicationBar() {
  let navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { connectors } = useConfig();

  const { connect } = useConnect({
    // connector: new InjectedConnector() // <-- removed this line
    connector: connectors[0], // <-- added this
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: "#555555" }}>
        <Toolbar>
          <MenuItem>
            <Typography
              variant="h6"
              component="a"
              sx={{ flexGrow: 1 }}
              onClick={() => navigate("/")}
            >
              Auctions
            </Typography>
          </MenuItem>
          {isConnected ? (
            <div style={{ marginLeft: "auto" }}>
              Connected to {ensName ?? address}
            </div>
          ) : (
            <Button
              color="inherit"
              sx={{ marginLeft: "auto" }}
              onClick={() => connect()}
            >
              Connect Wallet
            </Button>
          )}
          {isConnected && <ProfilePopover></ProfilePopover>}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
