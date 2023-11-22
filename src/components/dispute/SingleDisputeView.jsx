import React from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Grid,
  CardActions,
} from "@mui/material";
import { writeContract, prepareWriteContract } from "@wagmi/core";
import { useAccount } from "wagmi";
import auction from "../../auction.json";
import CommitteeChatModal from "../generic/CommitteeChatModal";
import { enqueueSnackbar } from "notistack";

const SingleDisputeView = ({ dispute }) => {
  const [isCommitteeChatModalOpen, setCommitteeChatModalOpen] =
    React.useState(false);

  const [hasVoted, setHasVoted] = React.useState(true);
  const { address } = useAccount();

  const handleCommitteeChatModalOpen = () => {
    setCommitteeChatModalOpen(true);
  };

  const handleCommitteeChatModalClose = () => {
    setCommitteeChatModalOpen(false);
  };

  const handleVoteSeller = async () => {
    const { request } = await prepareWriteContract({
      account: address,
      functionName: "voteOnDispute",
      abi: auction.abi,
      address: auction.address,
      args: [dispute.id, 0],
    });

    await writeContract(request)
      .then(() => {
        enqueueSnackbar("You have successfully voted in favor of seller!", {
          variant: "success",
        });
      })
      .catch((e) => {
        enqueueSnackbar(e.toString(), { variant: "error" });
      });
  };

  const handleVoteBuyer = async () => {
    const { request } = await prepareWriteContract({
      account: address,
      functionName: "voteOnDispute",
      abi: auction.abi,
      address: auction.address,
      args: [dispute.id, 1],
    });

    await writeContract(request)
      .then(() => {
        enqueueSnackbar("You have successfully voted in favor of buyer!", {
          variant: "success",
        });
      })
      .catch((e) => {
        enqueueSnackbar(e.toString(), { variant: "error" });
      });
  };

  const handleFinalize = async () => {
    const { request } = await prepareWriteContract({
      account: address,
      functionName: "resolveDispute",
      abi: auction.abi,
      address: auction.address,
      args: [dispute.id],
    });
    await writeContract(request)
      .then(() => {
        enqueueSnackbar("Dispute has been resolved", {
          variant: "success",
        });
      })
      .catch((e) => {
        enqueueSnackbar(e.toString(), { variant: "error" });
      });
  };

  React.useEffect(() => {
    prepareWriteContract({
      account: address,
      functionName: "voteOnDispute",
      abi: auction.abi,
      address: auction.address,
      args: [dispute.id, 1],
    })
      .then(() => {
        setHasVoted(false);
      })
      .catch((e) => {
        setHasVoted(true);
      });
  }, []);

  return (
    <Box display="flex" justifyContent="center" width="100%">
      <Card
        style={{ width: "70%", padding: "20px" }}
        sx={{
          background: "linear-gradient(to right bottom, #430089, #82ffa1)",
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            component="div"
          >{`Dispute ID: ${dispute.id}`}</Typography>
          <Grid
            container
            direction="column"
            spacing={2}
            style={{ marginTop: "20px" }}
          >
            <Grid item>
              <Typography variant="body1">{`Seller: ${dispute.user}`}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1">{`Buyer: ${dispute.customer}`}</Typography>
            </Grid>

            <Grid item>
              <Typography variant="body1">{`Votes for Buyer: ${dispute.votes.buyer}`}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1">{`Votes for Seller: ${dispute.votes.seller}`}</Typography>
            </Grid>
          </Grid>
          <Grid item container justifyContent="center" spacing={2}>
            <Grid item>
              <Button
                variant="contained"
                onClick={handleVoteBuyer}
                disabled={hasVoted}
                sx={{
                  bgcolor: "#2e5d4b",
                  marginTop: "5px",
                  marginBottom: "5px",
                  width: "200px",
                }}
              >
                Vote for Buyer
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                disabled={hasVoted}
                onClick={handleVoteSeller}
                sx={{
                  bgcolor: "#2e5d4b",
                  marginTop: "5px",
                  marginBottom: "5px",
                  width: "200px",
                }}
              >
                Vote for Seller
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={handleCommitteeChatModalOpen}
                sx={{
                  bgcolor: "#2e5d4b",
                  marginTop: "5px",
                  marginBottom: "5px",
                  width: "200px",
                }}
              >
                Chat
              </Button>
            </Grid>
            <CommitteeChatModal
              isOpen={isCommitteeChatModalOpen}
              onClose={handleCommitteeChatModalClose}
              itemId={dispute.id}
              yesVotes={dispute.votes.buyer} // buyer is right
              noVotes={dispute.votes.seller} // seller is right
            ></CommitteeChatModal>
          </Grid>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            onClick={handleFinalize}
            sx={{
              bgcolor: "#2e5d4b",
              marginBottom: "5px",
              width: "85px",
            }}
          >
            FINALIZE
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default SingleDisputeView;
