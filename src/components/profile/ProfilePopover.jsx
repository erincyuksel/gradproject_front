/* global BigInt */
import { useState, useEffect } from "react";
import {
  IconButton,
  Popover,
  Typography,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  useAccount,
  useContractReads,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import auction from "../../auction.json";
import obscurity from "../../obscurity.json";
import { useDebounce } from "../../hooks/useDebounce";
import { enqueueSnackbar } from "notistack";
const ProfilePopover = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [concurrentAuctions, setConcurrentAuctions] = useState(2);
  const [auctionDuration, setAuctionDuration] = useState(3600);
  const [pubKey, setPubkey] = useState("");
  const [stakedAmount, setStakedAmount] = useState(0);
  const [stakeRequired, setStakeRequired] = useState(0);
  const [tokensToStake, setTokensToStake] = useState(0);
  const [enteredPubkey, setEnteredPubkey] = useState("");
  const [isStakeAllowed, setIsStakeAllowed] = useState(false);
  const [balance, setBalance] = useState(0);
  const debouncedEnteredPubkey = useDebounce(enteredPubkey, 500);
  const debouncedTokensToStake = useDebounce(tokensToStake, 500);
  const open = Boolean(anchorEl);
  const id = open ? "profile-popover" : undefined;
  const { isConnected, address } = useAccount();

  // data read

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
      { ...auction, functionName: "getActiveAuctioneer", args: [address] },
      { ...obscurity, functionName: "balanceOf", args: [address] },
      { ...auction, functionName: "getAuctionDuration" },
      { ...auction, functionName: "getConcurrentAuctionsPerUser" },
    ],
    watch: true,
  });

  // set pubkey
  const { config: myConfig1 } = usePrepareContractWrite({
    address: auction.address,
    abi: auction.abi,
    functionName: "setPubKey",
    args: [debouncedEnteredPubkey],
    account: address,
  });

  const { config: myConfig2 } = usePrepareContractWrite({
    address: obscurity.address,
    abi: obscurity.abi,
    functionName: "approve",
    args: [auction.address, BigInt(debouncedTokensToStake * 10 ** 18)],
    account: address,
  });

  const { refetch: fetchConfig3, config: myConfig3 } = usePrepareContractWrite({
    address: auction.address,
    abi: auction.abi,
    functionName: "stakeTokens",
    args: [BigInt(debouncedTokensToStake * 10 ** 18)],
    account: address,
  });

  const { data: data1, writeAsync: setPubKeyFunc } =
    useContractWrite(myConfig1);
  const { data: data2, writeAsync: approve } = useContractWrite(myConfig2);
  const { data: data3, writeAsync: setStakeTokensFunc } =
    useContractWrite(myConfig3);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setStakeRequired(Number(BigInt(data[0].result) / BigInt(10 ** 18)));
    setPubkey(data[1].result);
    setStakedAmount(Number(BigInt(data[2].result[0]) / BigInt(10 ** 18)));
    setBalance(Number(BigInt(data[3].result) / BigInt(10 ** 18)));
    console.log(Number(data[4].result));
    setAuctionDuration(Number(data[4].result));
    setConcurrentAuctions(Number(data[5].result));
    if (data[2].result[0] >= data[0].result) {
      setIsStakeAllowed(false);
    } else {
      setIsStakeAllowed(true);
    }
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  // Function to set the public key
  const handleSetPublicKey = () => {
    setPubKeyFunc()
      .then(() => {
        setPubkey(enteredPubkey);
        enqueueSnackbar("Successfully set the public key", {
          variant: "success",
        });
      })
      .catch((e) => {
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      });
  };

  const handleGetPubKey = async () => {
    try {
      let publicKey = await window.ethereum.request({
        method: "eth_getEncryptionPublicKey",
        params: [address],
      });
      setEnteredPubkey(publicKey);
    } catch (e) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
      setEnteredPubkey("");
    }
  };

  const handleSetStakeTokens = () => {
    console.log(tokensToStake);
    console.log(stakeRequired);
    console.log(stakedAmount);
    console.log("asd");
    approve()
      .then(async () => {
        await fetchConfig3();
        await new Promise((r) => setTimeout(r, 1500));
        setStakeTokensFunc()
          .then(async () => {
            setStakedAmount(tokensToStake);
            setBalance(balance - tokensToStake);
            handleClosePopover();
            enqueueSnackbar("Successfully staked required tokens!", {
              variant: "success",
            });
          })
          .catch((e) => {
            enqueueSnackbar("Something went wrong!", { variant: "error" });
          });
      })
      .catch((e) => {
        console.log(e);
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      });
  };

  return (
    <div>
      <IconButton
        color="inherit"
        aria-describedby={id}
        onClick={handlePopoverOpen}
      >
        <AccountCircleIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div
          style={{
            padding: "16px",
            maxWidth: "320px",
            background:
              "linear-gradient(135deg, #2b5876, #4e4376, #b5127c, #cf4b4b)",
          }}
        >
          <Typography variant="h6">System Overview</Typography>
          <Typography>Token Balance: {balance} OT</Typography>
          <Typography>Current Stake: {stakedAmount} OT</Typography>
          <Typography>Needed Stake Amount: {stakeRequired} OT</Typography>
          <Typography>Auction Duration: {auctionDuration}</Typography>
          <Typography>
            Concurrent Auctions Per User: {concurrentAuctions}
          </Typography>

          <div
            style={{ display: "flex", alignItems: "center", marginTop: "16px" }}
          >
            <TextField
              label="New Public Key"
              variant="outlined"
              disabled
              fullWidth
              value={enteredPubkey}
            />
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: "16px", backgroundColor: "#2e5d4b" }}
              onClick={handleSetPublicKey}
              disabled={!setPubKeyFunc}
            >
              Set PubKey
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: "16px", backgroundColor: "#2e5d4b" }}
              onClick={handleGetPubKey}
            >
              Get PubKey
            </Button>
          </div>
          <Typography sx={{ fontSize: "12px" }}>
            Public Key: {pubKey}
          </Typography>
          <div
            style={{ display: "flex", alignItems: "center", marginTop: "16px" }}
          >
            <TextField
              label="Stake Amount"
              variant="outlined"
              fullWidth
              onChange={(e) => setTokensToStake(e.target.value)}
            />
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              style={{ marginLeft: "16px", backgroundColor: "#2e5d4b" }}
              onClick={handleSetStakeTokens}
              disabled={!isStakeAllowed}
            >
              Stake Tokens
            </Button>
          </div>
        </div>
      </Popover>
    </div>
  );
};

export default ProfilePopover;
