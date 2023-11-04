import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Grid,
  Button,
} from "@mui/material";
import governor from "../../governor.json";

import {
  useAccount,
  useContractReads,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
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

  const { address, isConnected } = useAccount();

  const { config: voteYesConfig } = usePrepareContractWrite({
    address: governor.address,
    abi: governor.abi,
    functionName: "castVote",
    args: [props.proposal.proposalId, 1],
    account: address,
  });

  const { config: voteNoConfig } = usePrepareContractWrite({
    address: governor.address,
    abi: governor.abi,
    functionName: "castVote",
    args: [props.proposal.proposalId, , 0],
    account: address,
  });

  const { data: data1, writeAsync: voteYesFunc } =
    useContractWrite(voteYesConfig);
  const { data: data2, writeAsync: voteNoFunc } =
    useContractWrite(voteNoConfig);

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
    ],
    watch: true,
  });

  return (
    <Card
      sx={{
        maxWidth: 400,
        background: "linear-gradient(to right bottom, #430089, #82ffa1)",
        marginLeft: "110px",
        marginBottom: "50px",
      }}
      onClick={() => console.log(data[1].result)}
    >
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          PROPOSAL STATE: {data && getProposalState(data[0].result)}
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {props.proposal.description.split("-")[0]}
        </Typography>
      </CardContent>
      <CardActions>
        <Grid container justifyContent="space-between">
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              sx={{ backgroundColor: "#2e5d4b" }}
              size="large"
              onClick={() => voteYesFunc()}
              disabled={!voteYesFunc}
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
              onClick={() => voteNoFunc()}
            >
              VOTE NO
            </Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
}
