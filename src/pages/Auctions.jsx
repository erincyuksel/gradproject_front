import { useAccount, useConnect, useEnsName } from "wagmi";
import { Box, Grid, Paper, Button, Modal, Typography } from "@mui/material";
import AuctionItem from "../components/auction/AuctionItem";
import { useState } from "react";
import CreateAuctionModal from "../components/auction/CreateAuctionModal";
function Auctions() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <Box sx={{ bgcolor: "#eeeedd" }}>
      <Button
        onClick={handleOpen}
        variant={"contained"}
        color="primary"
        sx={{
          border: "2px solid",
          bgcolor: "#2e5d4b",
          marginTop: "5px",
          marginBottom: "5px",
        }}
      >
        Create Auction
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <>
          <CreateAuctionModal></CreateAuctionModal>
        </>
      </Modal>
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
