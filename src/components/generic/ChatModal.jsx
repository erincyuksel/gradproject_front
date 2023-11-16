import { encrypt } from "@metamask/eth-sig-util";
import { bufferToHex } from "ethereumjs-util";
import { Buffer } from "buffer";
import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import auction from "../../auction.json";
import { useAccount, useContractReads } from "wagmi";
import { writeContract } from "@wagmi/core";
import { enqueueSnackbar } from "notistack";
import utility from "../../utility";
const ChatModal = ({ isOpen, onClose, itemId, pubKeyAddress }) => {
  window.Buffer = Buffer;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [encryptionKey, setEncryptionKey] = useState("");
  const { address } = useAccount();
  const { data } = useContractReads({
    contracts: [
      {
        ...auction,
        functionName: "getChatLogOfItem",
        args: [itemId],
      },
      { ...auction, functionName: "getPubKey", args: [pubKeyAddress] },
    ],
    watch: true,
  });

  const handleSendMessage = async () => {
    let encryptedMsg = bufferToHex(
      Buffer.from(
        JSON.stringify(
          encrypt({
            publicKey: encryptionKey,
            data: message,
            version: "x25519-xsalsa20-poly1305",
          })
        ),
        "utf8"
      )
    );
    let date = Date.now();
    let transmissionMsg = date + "-" + address + "-" + encryptedMsg;
    await writeContract({
      address: auction.address,
      abi: auction.abi,
      functionName: "sendChat",
      args: [itemId, transmissionMsg],
    })
      .then(() => {
        enqueueSnackbar("Successfully sent the message!", {
          variant: "success",
        });
        setMessages([
          ...messages,
          { date: date, text: encryptedMsg, sender: "You" },
        ]);
        setMessage("");
      })
      .catch((e) => {
        enqueueSnackbar("There was a problem during message transmission!", {
          variant: "error",
        });
        setMessage("");
      });
  };

  useEffect(() => {
    if (data && data[1] && data[1].result) {
      setEncryptionKey(data[1].result);
    }
    if (data && data[0] && data[0].result) {
      setMessages([]);
      const tempArr = data[0].result.map((msg) => {
        let elements = msg.split("-");
        let date = elements[0];
        let sender = elements[1];
        let encryptedMsg = elements[2];
        if (sender == address) sender = "You";

        return { date: date, sender: sender, text: encryptedMsg };
      });
      setMessages(tempArr);
    }
  }, data);

  const handleDecryption = async (msg, index) => {
    if (msg.sender == "You") {
      enqueueSnackbar(
        "This message was sent by you for the other party, cannot be decrypted!",
        { variant: "error" }
      );
      return;
    }
    const messagesCopy = [...messages];
    let val;
    await window.ethereum
      .request({
        method: "eth_decrypt",
        params: [msg.text, address],
      })
      .then((value) => {
        val = value;
        enqueueSnackbar("Successfully decrypted the message!", {
          variant: "success",
        });
      })
      .catch((e) => {
        enqueueSnackbar("There was a problem during decryption!", {
          variant: "error",
        });
      });
    messagesCopy[index] = {
      date: msg.date,
      sender: msg.sender,
      text: val,
    };
    setMessages(messagesCopy);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          background:
            "linear-gradient(180deg, #151515, #1b1b1b, #1e1e1e, #272727, #2c2c2c, #303030, #333333, #363636, #363636, #333333, #303030, #2c2c2c, #272727, #1e1e1e, #1b1b1b, #151515)",
        }}
      >
        Chat
      </DialogTitle>
      <DialogContent
        sx={{
          background: "linear-gradient(to right bottom, #430089, #82ffa1)",
        }}
      >
        <Box
          style={{
            maxHeight: "300px", // Adjust the max height as needed
            overflowY: "auto",
          }}
        >
          <List>
            {messages.map((msg, index) => (
              <ListItem
                key={index}
                alignItems={msg.sender !== "You" ? "flex-start" : "flex-end"}
              >
                <ListItemText
                  primary={
                    utility.isHex(msg.text) ? "Encrypted Text" : msg.text
                  }
                  secondary={
                    msg.sender + " " + utility.returnFormattedTime(msg.date)
                  }
                  style={{
                    textAlign: msg.sender !== "You" ? "left" : "right",
                  }}
                  onClick={() => handleDecryption(msg, index)}
                />
              </ListItem>
            ))}
          </List>
        </Box>
        <TextField
          label="Type your message"
          variant="outlined"
          fullWidth
          margin="normal"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          sx={{ bgcolor: "#2e5d4b" }}
        >
          Send
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
