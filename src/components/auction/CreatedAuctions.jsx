/* global BigInt */
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CardHeader,
  Tooltip,
  Popover,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useState, useEffect } from "react";
import utility from "../../utility";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import { usePrepareContractWrite, useContractWrite, useAccount } from "wagmi";
import auction from "../../auction.json";
import { enqueueSnackbar } from "notistack";
import ChatModal from "../generic/ChatModal";
import CommitteeChatModal from "../generic/CommitteeChatModal";
import { prepareWriteContract, writeContract } from "@wagmi/core";

export default function CreatedAuctions(props) {
  const { children, value, index, item, ...other } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const [isGenuine, setIsGenuine] = useState(true);
  const [url, setUrl] = useState("");
  const [isCommitteeChatModalOpen, setCommitteeChatModalOpen] = useState(false);
  const [hourRemaining, setHourRemaining] = useState("00");
  const [minuteRemaining, setMinuteRemaining] = useState("00");
  const [secondRemaining, setSecondRemaining] = useState("00");
  const [auctionEndable, setAuctionEndable] = useState(false);
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isTransitionable, setIsTransitionable] = useState(false);

  const open = Boolean(anchorEl);

  const { address } = useAccount();

  const { config: endAuctionConfig } = usePrepareContractWrite({
    address: auction.address,
    abi: auction.abi,
    functionName: "endAuction",
    args: [item.itemId],
    account: address,
  });

  const { writeAsync: endAuction } = useContractWrite(endAuctionConfig);

  useEffect(() => {
    console.log(item.escrowState);
    setIsTransitionable(checkIfTransitionable(item.escrowState));
  }, []);

  useEffect(() => {
    const storage = getStorage();
    const imgRef = ref(storage, "images/" + props.item.hashOfImage);
    var countdown = setInterval(() => {
      if (
        utility.didAuctionExpire(
          Number(props.item.auctionEndTime) * 1000,
          Date.now()
        )
      ) {
        setHourRemaining("00");
        setMinuteRemaining("00");
        setSecondRemaining("00");
        if (!item.ended) {
          setAuctionEndable(true);
        }
        clearInterval(countdown);
        return;
      }
      let timeInfo = utility.convertTimestamptoTime(
        Number(props.item.auctionEndTime) * 1000,
        Date.now()
      );
      setHourRemaining(timeInfo.hours);
      setMinuteRemaining(timeInfo.minutes);
      setSecondRemaining(timeInfo.seconds);
    }, 1000);
    getDownloadURL(imgRef)
      .then((url) => {
        setUrl(url);
        const xhr = new XMLHttpRequest();
        xhr.responseType = "blob";
        xhr.onload = async (event) => {
          const blob = xhr.response;
          const buffer = await blob.arrayBuffer();
          crypto.subtle.digest("SHA-256", buffer).then((hash) => {
            let hex = utility.toHexString(Array.from(new Uint8Array(hash)));
            if (hex == props.item.hashOfImage) {
              setIsGenuine(true);
            } else {
              setIsGenuine(false);
            }
          });
        };
        xhr.open("GET", url);
        xhr.send();
      })
      .catch((e) => {
        setIsGenuine(false);
      });
  }, []);

  const handleEndAuction = () => {
    endAuction()
      .then(() => {
        enqueueSnackbar("You have successfully ended the auction!", {
          variant: "success",
        });
        setAuctionEndable(false);
      })
      .catch((e) => {
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      });
  };

  const handleRaiseDispute = async () => {
    const { request } = await prepareWriteContract({
      address: auction.address,
      abi: auction.abi,
      functionName: "raiseDispute",
      args: [item.itemId, item.escrowState],
      account: address,
    });
    writeContract(request)
      .then(() => {
        enqueueSnackbar("You have successfully risen dispute!", {
          variant: "success",
        });
      })
      .catch((e) => {
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      });
  };

  const handleChatModalOpen = () => {
    setChatModalOpen(true);
  };

  const handleChatModalClose = () => {
    setChatModalOpen(false);
  };

  const handleCommitteeChatModalOpen = () => {
    setCommitteeChatModalOpen(true);
  };

  const handleCommitteeChatModalClose = () => {
    setCommitteeChatModalOpen(false);
  };

  const getEscrowState = () => {
    switch (item.escrowState) {
      case 0:
        return "Awaiting Delivery Address";
      case 1:
        return "Preparing Item";
      case 2:
        return "Item on Delivery";
      case 3:
        return "Item Received";
      case 4:
        return "Dispute";
      case 5:
        return "Dispute Resolved";
      case 6:
        return "Cancelled";
    }
  };

  const handleClick = async (event) => {
    let target = event.currentTarget;
    if (item.deliveryAddress) {
      await window.ethereum
        .request({
          method: "eth_decrypt",
          params: [item.deliveryAddress, address],
        })
        .then(async (value) => {
          setDeliveryAddress(value);
          setAnchorEl(target);
          enqueueSnackbar("Successfully decrypted the delivery address!", {
            variant: "success",
          });
        })
        .catch((e) => {
          enqueueSnackbar("There was a problem during decryption!", {
            variant: "error",
          });
        });
    } else {
      enqueueSnackbar("No address submitted by the winner yet.", {
        variant: "error",
      });
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const checkIfTransitionable = (currentState) => {
    if (!item.ended) return false;
    if (currentState == 1) return true;
    else return false;
  };

  const handleTransition = async () => {
    try {
      let nextEscrowState = 0;
      switch (item.escrowState) {
        case 0: {
          nextEscrowState = 1;
          break;
        }
        case 1: {
          nextEscrowState = 2;
          break;
        }
        case 2: {
          nextEscrowState = 3;
          break;
        }
      }
      const { request } = await prepareWriteContract({
        address: auction.address,
        abi: auction.abi,
        functionName: "transitionEscrowState",
        args: [item.itemId, nextEscrowState],
      });
      await writeContract(request);
      setIsTransitionable(checkIfTransitionable(nextEscrowState));
      enqueueSnackbar("Successfully transitioned escrow process", {
        variant: "success",
      });
    } catch (e) {
      enqueueSnackbar(e.toString(), { variant: "error" });
      console.log(e);
    }
  };

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      {...other}
      sx={{ marginTop: "10px" }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} key={index}>
          <Card
            sx={{
              maxWidth: "50%",
              background: "linear-gradient(to right bottom, #430089, #82ffa1)",
              margin: "auto",
            }}
          >
            <Grid container>
              <Grid item xs={12} sm={4}>
                <CardHeader
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  subheaderTypographyProps={{
                    fontWeight: "bold",
                    color: "red",
                  }}
                  subheader={
                    <>
                      <div style={{ display: "flex" }}>
                        <AccessAlarmIcon
                          sx={{
                            color: "red",
                          }}
                        />
                        <div style={{ marginLeft: "10px" }}>
                          {hourRemaining +
                            ":" +
                            minuteRemaining +
                            ":" +
                            secondRemaining}
                        </div>
                      </div>
                    </>
                  }
                />
                <CardMedia
                  component="img"
                  height="300"
                  sx={{
                    width: "100%",
                    objectFit: "contain",
                    marginBottom: "20px",
                  }}
                  image={url}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <CardContent>
                  <Typography variant="h3" component="div">
                    {item.itemName}
                  </Typography>
                  <div style={{ marginBottom: "15px", wordWrap: "break-word" }}>
                    <Typography variant="h5">
                      Item Description: {item.itemDescription}
                    </Typography>
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <Typography variant="h5">
                      Auction State: {item.ended ? "ENDED" : "ONGOING"}
                    </Typography>
                  </div>
                  {item.ended && (
                    <div style={{ marginBottom: "15px" }}>
                      <Typography variant="h5">
                        Escrow State: {getEscrowState()}
                      </Typography>
                    </div>
                  )}
                  <div style={{ marginBottom: "15px" }}>
                    <Typography variant="h5">
                      Current Bid: {Number(item.highestBid) / 10 ** 18} {" OT"}
                    </Typography>
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <Typography variant="h5">
                      Highest Bidder: {item.highestBidder}
                    </Typography>
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <Typography variant="h5" display="inline">
                      Genuinity:{" "}
                    </Typography>
                    <div
                      style={{
                        display: "inline",
                        verticalAlign: "bottom",
                      }}
                    >
                      {isGenuine ? (
                        <Tooltip title="Photo is genuine">
                          <CheckIcon sx={{ color: "green" }} />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Photo is not genuine!">
                          <ErrorIcon sx={{ color: "red" }} />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <Grid
                    container
                    justifyContent="center"
                    spacing={2}
                    margin="auto"
                  >
                    <Grid
                      item
                      component={Box}
                      sx={{
                        display:
                          !item.ended || item.escrowState === 4
                            ? "none"
                            : "true",
                      }}
                    >
                      <Button
                        variant={"contained"}
                        color="primary"
                        onClick={() => handleRaiseDispute()}
                        disabled={!handleRaiseDispute}
                        sx={{
                          bgcolor: "#2e5d4b",
                          marginTop: "5px",
                          marginBottom: "5px",
                          width: "200px",
                        }}
                      >
                        Raise Dispute
                      </Button>
                    </Grid>
                    <Grid
                      item
                      component={Box}
                      sx={{
                        display:
                          !item.ended ||
                          item.escrowState == 4 ||
                          item.escrowState == 5 ||
                          item.escrowState == 6
                            ? "none"
                            : "true",
                      }}
                    >
                      <Button
                        variant={"contained"}
                        color="primary"
                        endIcon={<ChatIcon />}
                        sx={{
                          bgcolor: "#2e5d4b",
                          marginTop: "5px",
                          marginBottom: "5px",
                          width: "200px",
                        }}
                        onClick={handleChatModalOpen}
                      >
                        Chat with Winner
                      </Button>
                    </Grid>
                    <Grid
                      item
                      component={Box}
                      sx={{
                        display:
                          !item.ended ||
                          item.escrowState == 0 ||
                          item.escrowState == 1 ||
                          item.escrowState == 2 ||
                          item.escrowState == 3
                            ? "none"
                            : "true",
                      }}
                    >
                      <Button
                        variant={"contained"}
                        color="primary"
                        endIcon={<ChatIcon />}
                        sx={{
                          bgcolor: "#2e5d4b",
                          marginTop: "5px",
                          marginBottom: "5px",
                          width: "200px",
                        }}
                        onClick={handleCommitteeChatModalOpen}
                      >
                        Committee Chat
                      </Button>
                    </Grid>
                    <ChatModal
                      isOpen={isChatModalOpen}
                      onClose={handleChatModalClose}
                      itemId={props.item.itemId}
                      pubKeyAddress={props.item.highestBidder}
                    ></ChatModal>
                    <CommitteeChatModal
                      isOpen={isCommitteeChatModalOpen}
                      onClose={handleCommitteeChatModalClose}
                      itemId={props.item.itemId}
                      yesVotes={props.item.yesVotes} // buyer is right
                      noVotes={props.item.noVotes} // seller is right
                    ></CommitteeChatModal>
                    <Grid
                      container
                      justifyContent="center"
                      spacing={2}
                      margin="auto"
                    >
                      <Grid
                        item
                        component={Box}
                        sx={{ display: !auctionEndable ? "none" : "true" }}
                      >
                        <Button
                          variant={"contained"}
                          color="primary"
                          onClick={() => handleEndAuction()}
                          disabled={!endAuction}
                          sx={{
                            bgcolor: "#2e5d4b",
                            marginTop: "5px",
                            marginBottom: "5px",
                            width: "200px",
                          }}
                        >
                          End Auction
                        </Button>
                      </Grid>
                      <Grid
                        item
                        component={Box}
                        sx={{ display: !item.ended ? "none" : "true" }}
                      >
                        <Button
                          variant={"contained"}
                          color="primary"
                          onClick={(e) => handleClick(e)}
                          sx={{
                            bgcolor: "#2e5d4b",
                            marginTop: "5px",
                            marginBottom: "5px",
                            width: "200px",
                          }}
                        >
                          Reveal Address
                        </Button>
                      </Grid>
                      <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                      >
                        <Box
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "300px",
                            wordWrap: "break-word",
                            background:
                              "linear-gradient(to right bottom, #430089, #82ffa1)",
                          }}
                        >
                          <Typography sx={{ p: 2 }}>
                            {deliveryAddress}
                          </Typography>
                        </Box>
                      </Popover>
                      <Grid item>
                        <Button
                          variant={"contained"}
                          color="primary"
                          onClick={handleTransition}
                          disabled={!isTransitionable}
                          sx={{
                            bgcolor: "#2e5d4b",
                            marginTop: "5px",
                            marginBottom: "5px",
                            width: "200px",
                          }}
                        >
                          Transition Escrow
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
