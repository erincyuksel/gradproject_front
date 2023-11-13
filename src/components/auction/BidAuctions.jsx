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
  TextField,
} from "@mui/material";
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
import DeliveryAddressPopover from "./DeliveryAddressPopover";
export default function BidAuctions(props) {
  const { children, value, index, item, ...other } = props;
  const [isGenuine, setIsGenuine] = useState(true);
  const [url, setUrl] = useState("");
  const [hourRemaining, setHourRemaining] = useState("00");
  const [minuteRemaining, setMinuteRemaining] = useState("00");
  const [secondRemaining, setSecondRemaining] = useState("00");
  const [auctionEndable, setAuctionEndable] = useState(false);
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { address } = useAccount();

  const { config: endAuctionConfig } = usePrepareContractWrite({
    address: auction.address,
    abi: auction.abi,
    functionName: "endAuction",
    args: [item.itemId],
    account: address,
  });

  const { config: raiseDisputeConfig } = usePrepareContractWrite({
    address: auction.address,
    abi: auction.abi,
    functionName: "raiseDispute",
    args: [item.itemId],
    account: address,
  });

  const { writeAsync: endAuction } = useContractWrite(endAuctionConfig);
  const { writeAsync: raiseDispute } = useContractWrite(raiseDisputeConfig);

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

  const handleRaiseDispute = () => {
    raiseDispute()
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

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
            <Grid item container alignItems="center" justify="center">
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
                  <Typography variant="h5">
                    Item Description:{" "}
                    <Typography
                      display="inline"
                      variant="body1"
                      fontSize="20px"
                      sx={{ wordBreak: "break-word" }}
                    >
                      {item.itemDescription}
                    </Typography>
                  </Typography>
                  <Typography variant="h5">
                    Auction State:{" "}
                    <Typography
                      display="inline"
                      variant="body1"
                      fontSize="20px"
                    >
                      {item.ended ? "ENDED" : "ONGOING"}
                    </Typography>
                  </Typography>
                  <Typography variant="h5" hidden={!item.ended}>
                    Escrow State:{" "}
                    <Typography
                      display="inline"
                      variant="body1"
                      fontSize="20px"
                    >
                      {getEscrowState()}
                    </Typography>
                  </Typography>
                  <Typography variant="h5">
                    Current Bid:{" "}
                    <Typography
                      display="inline"
                      variant="body1"
                      fontSize="20px"
                    >
                      {Number(item.highestBid) / 10 ** 18} {" OT"}
                    </Typography>
                  </Typography>
                  <Typography variant="h5">
                    Highest Bidder:{" "}
                    <Typography
                      display="inline"
                      variant="body1"
                      fontSize="20px"
                    >
                      {item.highestBidder}
                    </Typography>
                  </Typography>
                  <div>
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
                  <Grid item container justifyContent="center" spacing={2}>
                    <Grid item>
                      <Button
                        variant={"contained"}
                        color="primary"
                        onClick={() => handleRaiseDispute()}
                        disabled={!handleRaiseDispute}
                        sx={{
                          bgcolor: "#2e5d4b",
                          marginTop: "5px",
                          marginBottom: "5px",
                          display:
                            !item.ended || item.escrowState == 4
                              ? "none"
                              : "true",
                        }}
                      >
                        Raise Dispute
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant={"contained"}
                        color="primary"
                        sx={{
                          bgcolor: "#2e5d4b",
                          marginTop: "5px",
                          marginBottom: "5px",
                          display: !item.ended ? "none" : "true",
                        }}
                        onClick={handleChatModalOpen}
                      >
                        Chat with Winner
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant={"contained"}
                        color="primary"
                        onClick={handleClick}
                        sx={{
                          bgcolor: "#2e5d4b",
                          marginTop: "5px",
                          marginBottom: "5px",
                        }}
                      >
                        Send Address
                      </Button>
                    </Grid>
                    <DeliveryAddressPopover
                      open={Boolean(anchorEl)}
                      anchorEl={anchorEl}
                      onClose={handleClose}
                    ></DeliveryAddressPopover>
                    <ChatModal
                      isOpen={isChatModalOpen}
                      onClose={handleChatModalClose}
                      itemId={props.item.itemId}
                      pubKeyAddress={props.item.seller}
                    ></ChatModal>
                    <Grid item container justifyContent="center" spacing={2}>
                      <Grid item>
                        <Button
                          variant={"contained"}
                          color="primary"
                          onClick={() => handleEndAuction()}
                          disabled={!endAuction}
                          sx={{
                            bgcolor: "#2e5d4b",
                            marginTop: "5px",
                            marginBottom: "5px",
                            display: !auctionEndable ? "none" : "true",
                          }}
                        >
                          End Auction
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
