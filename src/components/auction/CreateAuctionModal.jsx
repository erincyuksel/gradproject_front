import { Card, CardHeader, Grid, TextField, Button } from "@mui/material";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import auction from "../../auction.json";
import obscurity from "../../obscurity.json";
import { usePrepareContractWrite, useContractWrite } from "wagmi";
import { useDebounce } from "../../hooks/useDebounce";
export default function CreateAuctionModal() {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#eeeedd",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    write();
    console.log(debouncedReservePrice);
    console.log(debouncedAuctionName);
    console.log(debouncedUuid);
  };
  const [auctionName, setAuctionName] = useState("");
  const [reservePrice, setReservePrice] = useState(1000);
  const [uuid, setUuid] = useState(uuidv4());

  const debouncedAuctionName = useDebounce(auctionName, 500);
  const debouncedUuid = useDebounce(uuid, 500);
  const debouncedReservePrice = useDebounce(reservePrice, 500);

  const { config } = usePrepareContractWrite({
    address: auction.address,
    abi: auction.abi,
    functionName: "createAuctionItem",
    args: [debouncedUuid, debouncedAuctionName, debouncedReservePrice],
  });

  const { write } = useContractWrite(config);

  return (
    <Grid container justify="center" spacing={1}>
      <Grid item xs={12}>
        <Card sx={style}>
          <CardHeader title="Create Auction"></CardHeader>
          <form autoComplete="off" onSubmit={handleSubmit}>
            <Grid item container spacing={1} justify="center">
              <Grid item xs={12}>
                <TextField
                  placeholder="Auction Name"
                  required
                  fullWidth
                  value={auctionName}
                  label="Auction Name"
                  onChange={(e) => setAuctionName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  placeholder="Reserve Price (In Obscurity Tokens)"
                  required
                  type="number"
                  fullWidth
                  value={reservePrice}
                  label="Reserve Price"
                  onChange={(e) => setReservePrice(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  sx={{ bgcolor: "#2e5d4b" }}
                  disabled={!write}
                >
                  Create
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>
      </Grid>
    </Grid>
  );
}
