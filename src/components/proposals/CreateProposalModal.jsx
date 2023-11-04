/* global BigInt */
import {
  Card,
  CardHeader,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import governor from "../../governor.json";
import auction from "../../auction.json";
import { useState, useEffect } from "react";

import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useContractEvent,
} from "wagmi";
import { useDebounce } from "../../hooks/useDebounce";
import { encodeFunctionData } from "viem";
import { enqueueSnackbar } from "notistack";
export default function CreateProposalModal() {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    background: "linear-gradient(135deg, #2b5876, #4e4376, #b5127c, #cf4b4b)",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  const { isConnected, address } = useAccount();

  const [proposalDescription, setProposalDescription] = useState("");
  const [category, setCategory] = useState(0);
  const [encodedFunction, setEncodedFunction] = useState("");

  const debouncedProposalDescription = useDebounce(proposalDescription, 500);
  const debouncedEncodedFunction = useDebounce(encodedFunction, 500);

  useContractEvent({
    address: governor.address,
    abi: governor.abi,
    eventName: "ProposalCreated",
    listener(log) {
      console.log(log);
    },
  });

  const { config } = usePrepareContractWrite({
    address: governor.address,
    abi: governor.abi,
    functionName: "propose",
    args: [
      [auction.address],
      [0],
      [debouncedEncodedFunction],
      debouncedProposalDescription,
    ],
    account: address,
  });

  const { writeAsync: createProposal } = useContractWrite(config);

  const handleSubmit = (e) => {
    e.preventDefault();

    createProposal()
      .then((val) => {
        console.log(val);
        enqueueSnackbar("Successfully created a proposal!", {
          variant: "success",
        });
      })
      .catch((e) => {
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      });
  };

  const handleChange = (e) => {
    setCategory(e.target.value);
  };

  const handleEncode = (proposalField) => {
    let funcToExecute = "";
    if (category == 0) {
      funcToExecute = "setAuctionDuration";
    } else if (category == 1) {
      funcToExecute = "setConcurrentAuctionsPerUser";
    } else {
      funcToExecute = "setTokensToStake";
    }
    const data = encodeFunctionData({
      abi: auction.abi,
      functionName: funcToExecute,
      args: [proposalField],
    });
    setEncodedFunction(data);
    setProposalDescription(
      proposalDescription + " - " + category + " - " + proposalField
    );
  };

  const returnProposalField = () => {
    if (category == 0) {
      return (
        <TextField
          placeholder="Duration in Hours"
          required
          type="number"
          fullWidth
          label="Duration in Hours"
          onChange={(e) => {
            handleEncode(60 * 60 * e.target.value);
          }}
        />
      );
    } else if (category == 1) {
      return (
        <TextField
          placeholder="Concurrent Auctions"
          required
          type="number"
          fullWidth
          label="Concurrent Auctions"
          onChange={(e) => handleEncode(e.target.value)}
        />
      );
    } else {
      return (
        <TextField
          placeholder="Tokens to Stake"
          required
          type="number"
          fullWidth
          label="Tokens to Stake"
          onChange={(e) => handleEncode(BigInt(e.target.value * 10 ** 18))}
        />
      );
    }
  };

  return (
    <Grid container justify="center" spacing={1}>
      <Grid item xs={12}>
        <Card sx={style}>
          <CardHeader title="Propose"></CardHeader>
          <form autoComplete="off" onSubmit={handleSubmit}>
            <Grid item container spacing={1} justify="center">
              <Grid item xs={12}>
                <Select
                  label="Category"
                  onChange={handleChange}
                  value={category}
                >
                  <MenuItem value={0}>Auction Duration</MenuItem>
                  <MenuItem value={1}>Concurrent Auctions</MenuItem>
                  <MenuItem value={2}>Tokens to Stake</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  placeholder="Proposal Description"
                  required
                  fullWidth
                  label="Proposal Description"
                  onChange={(e) => setProposalDescription(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                {returnProposalField()}
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  sx={{ bgcolor: "#2e5d4b" }}
                >
                  Propose
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>
      </Grid>
    </Grid>
  );
}
