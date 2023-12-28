/* global BigInt */
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Grid,
  Button,
  Tooltip,
  CardHeader,
} from "@mui/material";
import governor from "../../governor.json";
import WarningIcon from "@mui/icons-material/Warning";
import auction from "../../auction.json";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { writeContract } from "@wagmi/core";
import { useState, useEffect } from "react";
import {
  useAccount,
  useContractReads,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import { encodeFunctionData } from "viem";
import { enqueueSnackbar } from "notistack";
export default function ProposalItem(props) {
  const getProposalState = (val) => {
    switch (val) {
      case 0:
        return "Pending";
      case 1:
        return "Active";
      case 2:
        return "Canceled";
      case 3:
        return "Defeated";
      case 4:
        return "Succeeded";
      case 5:
        return "Queued";
      case 6:
        return "Expired";
      case 7:
        return "Executed";
    }
  };

  const [proposalState, setProposalState] = useState(0);
  const [yesVotes, setYesVotes] = useState(0);
  const [noVotes, setNoVotes] = useState(0);
  const { address, isConnected } = useAccount();
  const [canVote, setCanVote] = useState(true);
  const [encodedFunction, setEncodedFunction] = useState("");
  const [descriptionHash, setDescriptionHash] = useState("");

  const { config: queueProposalConfig } = usePrepareContractWrite({
    address: governor.address,
    abi: governor.abi,
    functionName: "queue",
    args: [[auction.address], [0], [encodedFunction], descriptionHash],
    account: address,
  });

  const { config: executeProposalConfig } = usePrepareContractWrite({
    address: governor.address,
    abi: governor.abi,
    functionName: "execute",
    args: [[auction.address], [0], [encodedFunction], descriptionHash],
    account: address,
  });

  const { data: data3, writeAsync: queueFunc } =
    useContractWrite(queueProposalConfig);

  const { data: data4, writeAsync: executeFunc } = useContractWrite(
    executeProposalConfig
  );

  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...governor,
        functionName: "state",
        args: [props.proposal.proposalId],
      },
      {
        ...governor,
        functionName: "proposalVotes",
        args: [props.proposal.proposalId],
      },
      {
        ...governor,
        functionName: "hasVoted",
        args: [props.proposal.proposalId, address],
      },
    ],
    watch: true,
  });

  const decideVote = () => {
    try {
      let hasVoted = data[2].result;
      let proposalState = data[0].result;

      if (!hasVoted && proposalState == 1) {
        setCanVote(true);
      } else {
        setCanVote(false);
      }
    } catch (e) {
      setCanVote(false);
    }
  };

  const getProposalCategory = () => {
    let category = props.proposal.description.split("-")[1];
    if (category == 0) {
      return "Concurrent Auctions Per User";
    } else if (category == 1) {
      return "Tokens Required to Stake";
    }
  };

  const getProposalField = () => {
    if (props.proposal.description.split("-")[1] == 1) {
      let field = props.proposal.description.split("-")[2];
      return field / 10 ** 18 + " OT";
    } else {
      return props.proposal.description.split("-")[2] + " concurrent auctions";
    }
  };

  const decideAvatarRender = () => {
    if (data[2].result && proposalState == 1) {
      return (
        <Tooltip title="You have already voted on this proposal!">
          <WarningIcon sx={{ color: "red" }} />
        </Tooltip>
      );
    } else if (proposalState == 5 && !executeFunc) {
      return (
        <Tooltip title="Not yet executable, block count has not been reached">
          <WarningIcon sx={{ color: "red" }} />
        </Tooltip>
      );
    } else {
      return <></>;
    }
  };

  useEffect(() => {
    decideVote();
    let category = props.proposal.description.split("-")[1];
    let funcToExecute = "";
    if (category == 0) {
      funcToExecute = "setConcurrentAuctionsPerUser";
    } else if (category == 1) {
      funcToExecute = "setTokensToStake";
    }
    setDescriptionHash(keccak256(toUtf8Bytes(props.proposal.description)));
    const funcData = encodeFunctionData({
      abi: auction.abi,
      functionName: funcToExecute,
      args: [props.proposal.description.split("-")[2]],
    });
    setEncodedFunction(funcData);
    if (data) {
      setProposalState(data[0].result);
      setYesVotes(Number(data[1].result[1]) / 10 ** 18);
      setNoVotes(Number(data[1].result[0]) / 10 ** 18);
    }
  }, [data]);

  if (!data) return <></>;

  const handleVoteYes = async () => {
    await writeContract({
      address: governor.address,
      abi: governor.abi,
      functionName: "castVote",
      args: [props.proposal.proposalId, 1],
      account: address,
    })
      .then(() => {
        enqueueSnackbar("You have successfully voted!", { variant: "success" });
      })
      .catch((e) => {
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      });
  };

  const handleVoteNo = async () => {
    await writeContract({
      address: governor.address,
      abi: governor.abi,
      functionName: "castVote",
      args: [props.proposal.proposalId, 0],
      account: address,
    })
      .then(() => {
        enqueueSnackbar("You have successfully voted!", { variant: "success" });
      })
      .catch((e) => {
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      });
  };

  const handleQueue = () => {
    queueFunc()
      .then(() => {
        enqueueSnackbar("You have successfully queued the proposal!", {
          variant: "success",
        });
      })
      .catch((e) => {
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      });
  };

  const handleExecute = () => {
    executeFunc()
      .then(() => {
        enqueueSnackbar("You have successfully executed the proposal!", {
          variant: "success",
        });
      })
      .catch((e) => {
        enqueueSnackbar("Something went wrong!", { variant: "error" });
      });
  };

  const renderVoteStatus = () => {
    const totalVotes = yesVotes + noVotes;
    const yesPercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
    const noPercentage = totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0;
    console.log(yesPercentage);
    return (
      <div>
        <div
          style={{ marginBottom: "10px", fontSize: "16px", fontWeight: "bold" }}
        >
          Yes Votes: {yesVotes} ({yesPercentage.toFixed(1)}%), No Votes:{" "}
          {noVotes} ({noPercentage.toFixed(1)}%)
        </div>
        <div style={{ display: "flex", width: "100%", height: "30px" }}>
          <div
            style={{ width: `${yesPercentage}%`, backgroundColor: "green" }}
          />
          <div style={{ width: `${noPercentage}%`, backgroundColor: "red" }} />
        </div>
      </div>
    );
  };

  return (
    <Card
      sx={{
        maxWidth: 400,
        background: "linear-gradient(to right bottom, #430089, #82ffa1)",
        marginLeft: "110px",
        marginBottom: "50px",
      }}
      onClick={() => {
        console.log(props.proposal);
      }}
    >
      <CardHeader
        title={
          <Typography
            sx={{ textAlign: "center", fontWeight: "bold", fontSize: "20px" }}
          >
            PROPOSAL STATE: {data && getProposalState(data[0].result)}
          </Typography>
        }
        avatar={decideAvatarRender()}
      ></CardHeader>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} gutterBottom component="h2">
          PROPOSAL CATEGORY: {getProposalCategory()}
        </Typography>
        <Typography sx={{ fontSize: 14 }} component="h2" gutterBottom>
          PROPOSAL FIELD TO SET: {getProposalField()}
        </Typography>
        <Typography sx={{ fontSize: 14 }} component="h2" gutterBottom>
          PROPOSAL DESCRIPTION: {props.proposal.description.split("-")[0]}
        </Typography>
      </CardContent>
      <CardActions>
        <Grid container justifyContent="space-between">
          {canVote && (
            <>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ backgroundColor: "#2e5d4b" }}
                  size="large"
                  onClick={() => handleVoteYes()}
                >
                  VOTE YES
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ backgroundColor: "red" }}
                  size="large"
                  onClick={() => handleVoteNo()}
                >
                  VOTE NO
                </Button>
              </Grid>
            </>
          )}
          {getProposalState(proposalState) == "Succeeded" && (
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: "#2e5d4b" }}
                size="large"
                onClick={() => handleQueue()}
                disabled={!queueFunc}
              >
                QUEUE PROPOSAL
              </Button>
            </Grid>
          )}
          {getProposalState(proposalState) == "Queued" && (
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="primary"
                sx={{ backgroundColor: "#2e5d4b" }}
                size="large"
                onClick={() => handleExecute()}
                disabled={!executeFunc}
              >
                EXECUTE
              </Button>
            </Grid>
          )}
        </Grid>
      </CardActions>
      {renderVoteStatus()}
    </Card>
  );
}
