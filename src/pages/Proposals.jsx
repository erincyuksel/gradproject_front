import { Box, Button, Modal } from "@mui/material";
import { useState } from "react";
import {
  useAccount,
  useContractReads,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import CreateProposalModal from "../components/proposals/CreateProposalModal";
import { enqueueSnackbar } from "notistack";

export default function Proposals() {
  const { address, isConnected } = useAccount();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
          Create Proposal
        </Button>
      )}
      <Modal open={open} onClose={handleClose}>
        <>
          <CreateProposalModal></CreateProposalModal>
        </>
      </Modal>
    </Box>
  );
}
