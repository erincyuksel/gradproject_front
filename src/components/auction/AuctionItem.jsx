/* global BigInt */
import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import { Grid, Box } from "@mui/material";
import CardMedia from "@mui/material/CardMedia";
import { CardHeader } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import utility from "../../utility";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import { TextField } from "@mui/material";
import { useAccount, usePrepareContractWrite, useContractWrite } from "wagmi";
import { useDebounce } from "../../hooks/useDebounce";
import auction from "../../auction.json";
import obscurity from "../../obscurity.json";
import { enqueueSnackbar } from "notistack";
import InfoIcon from "@mui/icons-material/Info";
import { IconButton } from "@mui/material";
import { Popover } from "@mui/material";
import { Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import { prepareWriteContract, writeContract } from "@wagmi/core";

export default function AuctionItem(props) {
  const [url, setUrl] = useState("");
  const [hourRemaining, setHourRemaining] = useState("00");
  const [minuteRemaining, setMinuteRemaining] = useState("00");
  const [secondRemaining, setSecondRemaining] = useState("00");
  const [bid, setBid] = useState("");
  const [isGenuine, setIsGenuine] = useState(true);
  const debouncedBid = useDebounce(bid, 500);
  const [anchorEl, setAnchorEl] = useState(null);
  const { isConnected, address } = useAccount();
  const open = Boolean(anchorEl);
  useEffect(() => {
    const storage = getStorage();
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
    const imgRef = ref(storage, "images/" + props.item.hashOfImage);
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

  const { config: approveConfig } = usePrepareContractWrite({
    address: obscurity.address,
    abi: obscurity.abi,
    functionName: "approve",
    args: [auction.address, BigInt(debouncedBid * 10 ** 18)],
    account: address,
  });

  const { writeAsync: approve } = useContractWrite(approveConfig);

  const handleBid = () => {
    approve()
      .then(async () => {
        const { request } = await prepareWriteContract({
          address: auction.address,
          abi: auction.abi,
          functionName: "placeBid",
          args: [props.item.itemId, BigInt(debouncedBid * 10 ** 18)],
          account: address,
        });
        writeContract(request)
          .then(() => {
            enqueueSnackbar("You have successfully bid on the item!", {
              variant: "success",
            });
          })
          .catch((e) => {
            console.log(e);
            enqueueSnackbar("There was en error during bid!", {
              variant: "error",
            });
          });
      })
      .catch((e) => {
        enqueueSnackbar("There was en error during bid!", { variant: "error" });
      });
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card
      sx={{
        maxWidth: 400,
        background: "linear-gradient(to right bottom, #430089, #82ffa1)",
        marginLeft: "110px",
        marginBottom: "50px",
      }}
    >
      <CardHeader
        avatar={
          <div style={{ marginBottom: "10px" }}>
            <AccessAlarmIcon sx={{ color: "red" }} />
          </div>
        }
        title="Time Remaining Until Closure"
        titleTypographyProps={{ fontWeight: "bold" }}
        subheaderTypographyProps={{ fontWeight: "bold", color: "red" }}
        subheader={
          hourRemaining + ":" + minuteRemaining + ":" + secondRemaining
        }
        action={
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton aria-label="info" onClick={handleClick}>
              <InfoIcon />
            </IconButton>
            {isGenuine ? (
              <Tooltip title="Photo is genuine">
                <CheckIcon sx={{ color: "green" }} />
              </Tooltip>
            ) : (
              <Tooltip title="Photo is not genuine!">
                <ErrorIcon sx={{ color: "red" }} />
              </Tooltip>
            )}
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
                  width: "400px",
                  wordWrap: "break-word",
                  background:
                    "linear-gradient(to right bottom, #430089, #82ffa1)",
                }}
              >
                <Typography sx={{ p: 2 }}>
                  {props.item.itemDescription}
                </Typography>
              </Box>
            </Popover>
          </div>
        }
      />
      <CardMedia
        component="img"
        height="300"
        sx={{
          width: "100%",
          objectFit: "contain",
        }}
        image={url}
      />

      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {props.item.itemName}
        </Typography>
        <Grid container direction="column" alignItems="center">
          <Grid item>
            <Typography gutterBottom variant="body2" color="bold">
              Reserve Price: {Number(props.item.reservePrice) / 10 ** 18} OT
            </Typography>
          </Grid>
          <Grid item>
            <Typography gutterBottom variant="body2" color="bold">
              {"Highest Bid: " +
                Number(props.item.highestBid) / 10 ** 18 +
                " OT"}
            </Typography>
          </Grid>

          <Grid item>
            <Typography gutterBottom variant="body2" color="bold">
              {"Auction Owner: " + props.item.seller}
            </Typography>
          </Grid>
          <Grid item>
            <Typography gutterBottom variant="body2" color="bold">
              {"Bidder: " + props.item.highestBidder}
            </Typography>
          </Grid>
          <Grid item>
            <Typography gutterBottom variant="body2" color="bold">
              Auction State: {props.item.ended ? "ENDED" : "ONGOING"}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      {!props.item.ended && (
        <CardActions>
          <Grid container alignItems="center">
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: "#2e5d4b" }}
                onClick={handleBid}
                size="large"
              >
                BID
              </Button>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="BID OT"
                variant="outlined"
                fullWidth
                onChange={(e) => setBid(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardActions>
      )}
    </Card>
  );
}
