import {
  useAccount,
  useContractReads,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import { Box, Grid, Paper, Button, Modal, Typography } from "@mui/material";
import AuctionItem from "../components/auction/AuctionItem";
import { useState } from "react";
import CreateAuctionModal from "../components/auction/CreateAuctionModal";
import auction from "../auction.json";
function Auctions() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { address, isConnected } = useAccount();

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...auction,
        functionName: "getAllAuctions",
      },
    ],
    watch: true,
  });

  return (
    <Box
      sx={{
        background:
          "linear-gradient(180deg, #151515, #1b1b1b, #1e1e1e, #272727, #2c2c2c, #303030, #333333, #363636, #363636, #333333, #303030, #2c2c2c, #272727, #1e1e1e, #1b1b1b, #151515)",
        minHeight: window.innerHeight,
      }}
    >
      {isConnected && (
        <Button
          onClick={handleOpen}
          variant={"contained"}
          color="primary"
          sx={{
            bgcolor: "#2e5d4b",
            marginTop: "5px",
            marginBottom: "5px",
          }}
        >
          Create Auction
        </Button>
      )}

      <Modal open={open} onClose={handleClose}>
        <>
          <CreateAuctionModal onClose={handleClose}></CreateAuctionModal>
        </>
      </Modal>
      <Grid container spacing={2}>
        {data && data[0].result
          ? data[0].result.map((auctionItem) => {
              return (
                <Grid item xs={4}>
                  <AuctionItem item={auctionItem}></AuctionItem>
                </Grid>
              );
            })
          : null}
      </Grid>
    </Box>
  );
}

export default Auctions;
