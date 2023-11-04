import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { MenuItem } from "@mui/material";
import ProfilePopover from "../profile/ProfilePopover";
import auction from "../../auction.json";
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
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { connect, connectors } = useConnect();

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...auction,
        functionName: "getTokensToStake",
      },
      {
        ...auction,
        functionName: "getPubKey",
        args: [address],
      },
      { ...auction, functionName: "getActiveAuctioneer" },
    ],
  });

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
          <MenuItem>
            <Typography
              variant="h6"
              component="a"
              sx={{ flexGrow: 1 }}
              onClick={() => navigate("/proposals")}
            >
              Proposals
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
