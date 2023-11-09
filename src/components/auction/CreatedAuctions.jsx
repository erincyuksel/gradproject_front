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
} from "@mui/material";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useState, useEffect } from "react";
import utility from "../../utility";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";

export default function CreatedAuctions(props) {
  const { children, value, index, item, ...other } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const [isGenuine, setIsGenuine] = useState(true);
  const [url, setUrl] = useState("");
  const [hourRemaining, setHourRemaining] = useState("00");
  const [minuteRemaining, setMinuteRemaining] = useState("00");
  const [secondRemaining, setSecondRemaining] = useState("00");

  useEffect(() => {
    const storage = getStorage();
    const imgRef = ref(storage, "images/" + props.item.hashOfImage);
    setInterval(() => {
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
                  <Typography variant="h5">
                    Current Bid:{" "}
                    <Typography
                      display="inline"
                      variant="body1"
                      fontSize="20px"
                    >
                      {Number(BigInt(item.highestBid) / BigInt(10 ** 18))}{" "}
                      {" OT"}
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
                  <Box hidden={!item.ended}>
                    <Grid item container justifyContent="center" spacing={2}>
                      <Grid item>
                        <Button
                          variant={"contained"}
                          color="primary"
                          sx={{
                            bgcolor: "#2e5d4b",
                            marginTop: "5px",
                            marginBottom: "5px",
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
                          }}
                        >
                          Chat with Winner
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
