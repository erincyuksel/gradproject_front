import {
  Card,
  CardHeader,
  Grid,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import auction from "../../auction.json";
import obscurity from "../../obscurity.json";
import { usePrepareContractWrite, useContractWrite } from "wagmi";
import { useDebounce } from "../../hooks/useDebounce";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import utils from "../../utility";
import { enqueueSnackbar } from "notistack";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });
  const handleSubmit = (event) => {
    event.preventDefault();
    write();
    console.log(debouncedReservePrice);
    console.log(debouncedAuctionName);
    console.log(debouncedUuid);
  };
  const [auctionName, setAuctionName] = useState("");
  const [reservePrice, setReservePrice] = useState(1000);
  const [image, setImage] = useState("");
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

  const handleUpload = (e) => {
    if (utils.fileIsImage(e.target.files[0].name)) {
      console.log(e.target.files[0]);
      setImage(e.target.files[0]);
      const storage = getStorage();
      const imgRef = ref(storage, "images/" + e.target.files[0].name);
      uploadBytes(imgRef, e.target.files[0]).then(async (snapshot) => {
        console.log("Uploaded a file!");
        let buffer = await e.target.files[0].arrayBuffer();
        crypto.subtle.digest("SHA-256", buffer).then((hash) => {
          console.log(Array.from(new Uint8Array(hash)));
        });
      });
      getDownloadURL(imgRef).then((url) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = "blob";
        xhr.onload = async (event) => {
          const blob = xhr.response;
          const buffer = await blob.arrayBuffer();
          crypto.subtle.digest("SHA-256", buffer).then((hash) => {
            console.log(Array.from(new Uint8Array(hash)));
          });
        };
        xhr.open("GET", url);
        xhr.send();
      });
      enqueueSnackbar("Image has been uploaded!", { variant: "success" });
    } else {
      enqueueSnackbar("Please upload an image file!", { variant: "error" });
    }
  };

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
              <Grid item container spacing={1} justify="center">
                <Grid item xs={6}>
                  <Button
                    component="label"
                    variant="contained"
                    sx={{ bgcolor: "#2e5d4b" }}
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Image
                    <VisuallyHiddenInput
                      type="file"
                      onChange={handleUpload}
                      accept="image/*"
                    />
                  </Button>
                </Grid>
                <Grid item xs={6} sx={{ marginTop: "5px" }}>
                  <Typography>{image.name}</Typography>
                </Grid>
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
