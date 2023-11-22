import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { MenuItem } from "@mui/material";
import ProfilePopover from "../profile/ProfilePopover";
import auction from "../../auction.json";
import GavelIcon from "@mui/icons-material/Gavel";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useEnsName,
  useDisconnect,
  useConfig,
  useContractReads,
} from "wagmi";
import { useNavigate } from "react-router-dom";

export default function ApplicationBar() {
  let navigate = useNavigate();
  const { address, isConnected, connector: activeConnector } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { connect, connectors } = useConnect();
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const { data } = useContractReads({
    contracts: [
      {
        ...auction,
        functionName: "getCommitteeMembers",
      },
    ],
  });

  useEffect(() => {
    const handleConnectorUpdate = (account, chain) => {
      if (account) {
        console.log("new account", account);
        navigate("/");
        window.location.reload(true);
      } else if (chain) {
        console.log("new chain", chain);
        navigate("/");
        window.location.reload(true);
      }
    };

    if (activeConnector) {
      activeConnector.on("change", handleConnectorUpdate);
    }
    return () => activeConnector?.off("change", handleConnectorUpdate);
  }, [activeConnector]);

  useEffect(() => {
    if (data && data[0] && data[0].result) {
      console.log(data[0].result);
      if (data[0].result.indexOf(address) != -1) {
        setIsWhitelisted(true);
      } else {
        setIsWhitelisted(false);
      }
    }
  }, [data]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          background:
            "linear-gradient(135deg, #2b5876, #4e4376, #b5127c, #cf4b4b)",
        }}
      >
        <Toolbar>
          <MenuItem onClick={() => navigate("/")}>
            <Typography variant="h6" component="a" sx={{ flexGrow: 1 }}>
              Auctions
            </Typography>
            <LocalOfferIcon sx={{ marginLeft: "5px" }} />
          </MenuItem>
          <MenuItem onClick={() => navigate("/proposals")}>
            <Typography variant="h6" component="a" sx={{ flexGrow: 1 }}>
              Proposals
            </Typography>
            <BorderColorIcon sx={{ marginLeft: "5px" }} />
          </MenuItem>
          <MenuItem onClick={() => navigate("/myAuctions")}>
            <Typography variant="h6" component="a" sx={{ flexGrow: 1 }}>
              My Auctions
            </Typography>
            <InventoryIcon sx={{ marginLeft: "5px" }} />
          </MenuItem>

          {isWhitelisted && (
            <MenuItem onClick={() => navigate("/disputes")}>
              <Typography variant="h6" component="a" sx={{ flexGrow: 1 }}>
                Disputes
              </Typography>
              <GavelIcon sx={{ marginLeft: "5px" }} />
            </MenuItem>
          )}

          {isConnected ? (
            <div style={{ marginLeft: "auto" }}>
              Connected to {ensName ?? address}
            </div>
          ) : (
            <Button
              color="inherit"
              sx={{ marginLeft: "auto" }}
              onClick={() => connect({ connector: connectors[0] })}
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
