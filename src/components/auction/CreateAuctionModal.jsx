/* global BigInt */
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
import { usePrepareContractWrite, useContractWrite } from "wagmi";
import { useDebounce } from "../../hooks/useDebounce";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import utils from "../../utility";
import { enqueueSnackbar } from "notistack";
import { getStorage, ref, uploadBytes } from "firebase/storage";
export default function CreateAuctionModal() {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    background: "linear-gradient(135deg, #2b5876, #4e4376, #b5127c, #cf4b4b)",
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
  const handleSubmit = async (event) => {
    event.preventDefault();
    const storage = getStorage();
    const imgRef = ref(storage, "images/" + hashOfImage);
    setUuid(uuidv4());
    uploadBytes(imgRef, image)
      .then(async (snapshot) => {
        console.log("Uploaded a file!");
        createItem()
          .then(() => {
            enqueueSnackbar("Successfully listed auction item", {
              variant: "success",
            });
          })
          .catch((e) => {
            enqueueSnackbar("Something went wrong!", { variant: "error" });
          });
      })
      .catch((e) => {
        enqueueSnackbar("The image is not unique!", { variant: "error" });
      });
  };
  const [auctionName, setAuctionName] = useState("");
  const [reservePrice, setReservePrice] = useState(1000);
  const [itemDescription, setItemDescription] = useState("");
  const [image, setImage] = useState("");
  const [hashOfImage, setHashOfImage] = useState(Array(32).fill(0));
  const [uuid, setUuid] = useState(uuidv4());

  const debouncedAuctionName = useDebounce(auctionName, 500);
  const debouncedUuid = useDebounce(uuid, 500);
  const debouncedReservePrice = useDebounce(reservePrice, 500);
  const debouncedItemDescription = useDebounce(itemDescription, 500);
  const debouncedHashOfImage = useDebounce(hashOfImage, 500);

  const { config } = usePrepareContractWrite({
    address: auction.address,
    abi: auction.abi,
    functionName: "createAuctionItem",
    args: [
      debouncedUuid,
      debouncedAuctionName,
      debouncedItemDescription,
      debouncedHashOfImage,
      BigInt(debouncedReservePrice * 10 ** 18),
    ],
  });

  const { writeAsync: createItem } = useContractWrite(config);

  const handleUpload = async (e) => {
    if (utils.fileIsImage(e.target.files[0].name)) {
      console.log(e.target.files[0]);
      setImage(e.target.files[0]);
      let buffer = await e.target.files[0].arrayBuffer();
      crypto.subtle.digest("SHA-256", buffer).then((hash) => {
        setHashOfImage(utils.toHexString(new Uint8Array(hash)));
        console.log(utils.toHexString(new Uint8Array(hash)));
        enqueueSnackbar("Image has been set!", { variant: "success" });
      });
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
                  placeholder="Item Description"
                  label="Item Descriptions"
                  multiline
                  fullWidth
                  required
                  maxRows={4}
                  onChange={(e) => setItemDescription(e.target.value)}
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
                  disabled={!createItem}
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
