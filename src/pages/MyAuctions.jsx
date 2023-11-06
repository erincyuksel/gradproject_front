import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardMedia,
  Button,
  CardContent,
} from "@mui/material";
import { useState } from "react";
export default function MyAuctions() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function MyAuctionsTabPanel(props) {
    const { children, value, index, ...other } = props;
    const items = [
      {
        name: "name",
        image: "img",
        auctionName: "auctionname",
        auctionDescription: "desc",
        currentBid: "15000",
      },
      {
        name: "name",
        image: "img",
        auctionName: "auctionname",
        auctionDescription: "desc",
        currentBid: "15000",
      },
    ];
    console.log(value);
    console.log(index);
    return (
      <Box role="tabpanel" hidden={value !== index} {...other}>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Card
                sx={{
                  maxWidth: "100%",
                  background:
                    "linear-gradient(to right bottom, #430089, #82ffa1)",
                }}
              >
                <Grid item container alignItems="center" justify="center">
                  <Grid item xs={12} sm={4}>
                    <CardMedia
                      component="img"
                      height="300"
                      sx={{
                        width: "100%",
                        objectFit: "contain",
                      }}
                      image={require("../images/img.jpg")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {item.auctionName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {item.auctionDescription}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Current Bid: {item.currentBid}
                      </Typography>
                      <Button variant="outlined" color="primary">
                        Raise Dispute
                      </Button>
                      <Button variant="outlined" color="primary">
                        Chat with Winner/Owner
                      </Button>
                    </CardContent>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background:
          "linear-gradient(180deg, #151515, #1b1b1b, #1e1e1e, #272727, #2c2c2c, #303030, #333333, #363636, #363636, #333333, #303030, #2c2c2c, #272727, #1e1e1e, #1b1b1b, #151515)",
        minHeight: window.innerHeight,
      }}
    >
      <Tabs
        centered
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
        indicatorColor="secondary"
        textColor="secondary"
      >
        <Tab label="Created Auctions" sx={{ color: "white" }} />
        <Tab label="Bid Auctions" sx={{ color: "white" }} />
      </Tabs>
      <MyAuctionsTabPanel value={value} index={0}></MyAuctionsTabPanel>
    </Box>
  );
}
