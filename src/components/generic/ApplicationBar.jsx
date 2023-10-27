import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { MenuItem } from "@mui/material";
import { useAccount, useConnect, useEnsName, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

export default function ApplicationBar() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const test = async () => {
    await window.ethereum.request({
      method: "eth_decrypt",
      params: ["asdasdasd", address],
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <MenuItem>
            <Typography variant="h6" component="a" sx={{ flexGrow: 1 }}>
              Auctions
            </Typography>
          </MenuItem>
          <MenuItem>
            <Typography variant="h6" component="a" sx={{ flexGrow: 1 }}>
              Disputes
            </Typography>
          </MenuItem>
          {isConnected ? (
            <div style={{ marginLeft: "auto" }} onClick={test}>
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
        </Toolbar>
      </AppBar>
    </Box>
  );
}
