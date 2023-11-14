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
import { useAccount, useContractReads } from "wagmi";
import auction from "../auction.json";
import CreatedAuctions from "../components/auction/CreatedAuctions";
import BidAuctions from "../components/auction/BidAuctions";
export default function MyAuctions() {
  const [value, setValue] = useState(0);
  const { isConnected, address } = useAccount();

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...auction,
        functionName: "getMyOwnerAuctions",
        args: [address],
      },
      {
        ...auction,
        functionName: "getMyBidAuctions",
        args: [address],
      },
    ],
    watch: true,
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

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
      {data && data[0].result
        ? data[0].result.map((auctionItem) => {
            return (
              <>
                <CreatedAuctions
                  value={value}
                  index={0}
                  item={auctionItem}
                  onClick={() => console.log(data[0].result)}
                ></CreatedAuctions>
              </>
            );
          })
        : null}
      {data && data[1].result
        ? data[1].result.map((auctionItem) => {
            return (
              <BidAuctions
                value={value}
                index={1}
                item={auctionItem}
                onClick={() => console.log(data[1].result)}
              ></BidAuctions>
            );
          })
        : null}
    </Box>
  );
}
