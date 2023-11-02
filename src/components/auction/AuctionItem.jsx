import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import { Grid } from "@mui/material";
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
import { enqueueSnackbar } from "notistack";
export default function AuctionItem(props) {
  const [url, setUrl] = useState("");
  const [hourRemaining, setHourRemaining] = useState("00");
  const [minuteRemaining, setMinuteRemaining] = useState("00");
  const [secondRemaining, setSecondRemaining] = useState("00");
  const [bid, setBid] = useState("");
  const debouncedBid = useDebounce(bid, 500);
  useEffect(() => {
    const storage = getStorage();
    setInterval(() => {
      let timeInfo = utility.convertTimestamptoTime(
        Number(props.item.auctionEndTime) * 1000,
        Date.now()
      );
      setHourRemaining(timeInfo.hours);
      setMinuteRemaining(timeInfo.minutes);
      setSecondRemaining(timeInfo.seconds);
    }, 1000);
    const imgRef = ref(storage, "images/" + props.item.hashOfImage);
    getDownloadURL(imgRef).then((url) => {
      setUrl(url);
      // const xhr = new XMLHttpRequest();
      // xhr.responseType = "blob";
      // xhr.onload = async (event) => {
      //   const blob = xhr.response;
      //   const buffer = await blob.arrayBuffer();
      //   crypto.subtle.digest("SHA-256", buffer).then((hash) => {
      //     console.log(Array.from(new Uint8Array(hash)));
      //   });
      // };
      // xhr.open("GET", url);
      // xhr.send();
    });
  }, []);

  const { config: bidConfig } = usePrepareContractWrite({
    address: auction.address,
    abi: auction.abi,
    functionName: "placeBid",
    args: [props.item.itemId, debouncedBid],
  });

  const { writeAsync: placeBid } = useContractWrite(bidConfig);

  const handleBid = () => {
    placeBid()
      .then(() => {
        enqueueSnackbar("You have successfully bid on the item!", {
          variant: "success",
        });
      })
      .catch((e) => {
        console.log(e);
        enqueueSnackbar("There was en error during bid!", { variant: "error" });
      });
  };

  return (
    <Card
      sx={{
        maxWidth: 650,
        background: "linear-gradient(to right bottom, #430089, #82ffa1)",
      }}
    >
      <CardHeader
        avatar={<AccessAlarmIcon sx={{ color: "red" }} />}
        title="Time Remaining Until Closure"
        titleTypographyProps={{ fontWeight: "bold" }}
        subheaderTypographyProps={{ fontWeight: "bold", color: "red" }}
        subheader={
          hourRemaining + ":" + minuteRemaining + ":" + secondRemaining
        }
      />
      <CardMedia
        sx={{
          width: "100%",
          objectFit: "contain",
          paddingTop: "100%",
        }}
        image={url}
      />

      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {props.item.itemName}
        </Typography>
        <Typography gutterBottom variant="body2" color="text.secondary">
          {props.item.itemDescription}
        </Typography>
        <Grid container direction="column" alignItems="center">
          <Grid item>
            <Typography gutterBottom variant="body2" color="text.secondary">
              {"Highest Bid: " + Number(props.item.highestBid)}
            </Typography>
          </Grid>
          <Grid item>
            <Typography gutterBottom variant="body2" color="text.secondary">
              {props.item.highestBidder}
            </Typography>
          </Grid>
          <Grid item>
            <Typography gutterBottom variant="body2" color="text.secondary">
              {props.item.ended ? "ENDED" : "ONGOING"}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      {!props.item.ended && (
        <CardActions>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: "#2e5d4b" }}
                disabled={!placeBid}
              >
                BID
              </Button>
            </Grid>
            <Grid item>
              <TextField
                label="BID OT"
                variant="outlined"
                fullWidth
                onChange={(e) => setBid(e.target.value)}
                onClick={handleBid}
              />
            </Grid>
          </Grid>
        </CardActions>
      )}
    </Card>
  );
}
