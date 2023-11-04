import { Box, Button, Modal, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import {
  useAccount,
  useContractReads,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import CreateProposalModal from "../components/proposals/CreateProposalModal";
import { getPublicClient } from "@wagmi/core";
import ProposalItem from "../components/proposals/ProposalItem";
import governor from "../governor.json";
import { parseAbiItem } from "viem";
export default function Proposals() {
  const { address, isConnected } = useAccount();
  const [open, setOpen] = useState(false);
  const [proposals, setProposals] = useState([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  useEffect(() => {
    getPublicClient()
      .getLogs({
        address: governor.address,
        event: parseAbiItem(
          "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)"
        ),
        fromBlock: 0n,
      })
      .then((data) => {
        console.log(data);
        setProposals(data);
      });
  }, []);
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
      <Grid container spacing={2}>
        {proposals &&
          proposals.map((proposal) => {
            return (
              <Grid key={proposal.args.proposalId} item xs={4}>
                <ProposalItem proposal={proposal.args}></ProposalItem>
              </Grid>
            );
          })}
      </Grid>
    </Box>
  );
}
