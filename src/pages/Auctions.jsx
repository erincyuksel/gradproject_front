import { useAccount, useConnect, useEnsName } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { Box, Grid, Paper } from "@mui/material";
import AuctionItem from "../components/auction/AuctionItem";
function Auctions() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <AuctionItem></AuctionItem>
        </Grid>
        <Grid item xs={4}>
          <AuctionItem></AuctionItem>
        </Grid>
        <Grid item xs={4}>
          <AuctionItem></AuctionItem>
        </Grid>
        <Grid item xs={4}>
          <AuctionItem></AuctionItem>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Auctions;
