import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { writeContract } from "@wagmi/core";
import auction from "../../auction.json";
import { encrypt } from "@metamask/eth-sig-util";
import { bufferToHex } from "ethereumjs-util";
import { useContractReads } from "wagmi";
import { Buffer } from "buffer";
import { enqueueSnackbar } from "notistack";
export default function DeliveryAddressPopover({
  open,
  anchorEl,
  onClose,
  itemId,
  pubKeyAddress,
}) {
  window.Buffer = Buffer;
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const { data } = useContractReads({
    contracts: [
      { ...auction, functionName: "getPubKey", args: [pubKeyAddress] },
    ],
    watch: true,
  });
  const handleSend = async () => {
    console.log("Sending address:", deliveryAddress);
    let encryptedMsg = bufferToHex(
      Buffer.from(
        JSON.stringify(
          encrypt({
            publicKey: encryptionKey,
            data: deliveryAddress,
            version: "x25519-xsalsa20-poly1305",
          })
        ),
        "utf8"
      )
    );
    writeContract({
      address: auction.address,
      abi: auction.abi,
      functionName: "setDeliveryAddress",
      args: [itemId, encryptedMsg],
    })
      .then(() => {
        enqueueSnackbar("You have successfully sent the delivery address!", {
          variant: "success",
        });
      })
      .catch((e) => {
        enqueueSnackbar(e.toString, { variant: "error" });
      });
    onClose();
  };

  useEffect(() => {
    if (data) {
      setEncryptionKey(data[0].result);
    }
  }, data);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Box
        p={2}
        sx={{
          background: "linear-gradient(to right bottom, #430089, #82ffa1)",
          width: "500px",
        }}
      >
        <TextField
          label="Delivery Address"
          variant="outlined"
          fullWidth
          value={deliveryAddress}
          multiline
          rows={4}
          onChange={(e) => setDeliveryAddress(e.target.value)}
        />
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSend}
            disabled={!deliveryAddress}
            sx={{ backgroundColor: "#2e5d4b" }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
