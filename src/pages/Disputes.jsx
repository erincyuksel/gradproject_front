import { Box, Container, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import DisputesList from "../components/dispute/DisputesList";
import SingleDisputeView from "../components/dispute/SingleDisputeView";
import { useContractReads } from "wagmi";
import auction from "../auction.json";
export default function Disputes() {
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const { data } = useContractReads({
    contracts: [
      {
        ...auction,
        functionName: "getAllDisputeAuctions",
      },
    ],
    watch: true,
  });

  useEffect(() => {
    if (data && data[0] && data[0].result) {
      let dispute = [];
      data[0].result.forEach((item) => {
        if (item.escrowState == 4) {
          dispute.push({
            id: item.itemId,
            user: item.seller,
            customer: item.highestBidder,
            votes: { buyer: item.yesVotes, seller: item.noVotes },
          });
        }
      });
      setDisputes(dispute);
    }
  }, [data]);

  const handleDisputeClick = (dispute) => {
    setSelectedDispute(dispute);
  };

  const handleChatClick = () => {
    // Handle chat functionality
    console.log("Chat button clicked");
  };

  return (
    <Box
      sx={{
        background:
          "linear-gradient(180deg, #151515, #1b1b1b, #1e1e1e, #272727, #2c2c2c, #303030, #333333, #363636, #363636, #333333, #303030, #2c2c2c, #272727, #1e1e1e, #1b1b1b, #151515)",
        minHeight: window.innerHeight,
      }}
    >
      <Container
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
        }}
      >
        <div
          style={{
            width: "30%",
            padding: "20px",
            background: "white",
            marginTop: "50px",
            background: "linear-gradient(to right bottom, #430089, #82ffa1)",
            height: "600px",
          }}
        >
          <Typography
            variant="h4"
            component="div"
            gutterBottom
            marginTop="15px"
          >
            Ongoing Disputes
          </Typography>
          {disputes.length != 0 ? (
            <DisputesList
              disputes={disputes}
              onDisputeClick={handleDisputeClick}
            />
          ) : (
            <Typography
              variant="body"
              component="div"
              gutterBottom
              marginTop="15px"
            >
              No Disputes Available
            </Typography>
          )}
        </div>
        {selectedDispute && (
          <div
            style={{
              flex: "1",
              display: "flex",
              marginTop: "50px",
            }}
          >
            <SingleDisputeView
              dispute={selectedDispute}
              onChatClick={handleChatClick}
            />
          </div>
        )}
      </Container>
    </Box>
  );
}
