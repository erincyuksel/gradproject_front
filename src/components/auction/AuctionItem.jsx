import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { CardHeader } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import utility from "../../utility";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import { bgcolor } from "@mui/system";
export default function AuctionItem(props) {
  const [url, setUrl] = useState("");
  const [hourRemaining, setHourRemaining] = useState("00");
  const [minuteRemaining, setMinuteRemaining] = useState("00");
  const [secondRemaining, setSecondRemaining] = useState("00");

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
        <Typography variant="body2" color="text.secondary">
          {props.item.itemDescription}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  );
}
