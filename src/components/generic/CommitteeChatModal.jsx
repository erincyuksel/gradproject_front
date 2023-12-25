import { Buffer } from "buffer";
import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
} from "@mui/material";
import auction from "../../auction.json";
import { useAccount, useContractReads } from "wagmi";
import { writeContract } from "@wagmi/core";
import { enqueueSnackbar } from "notistack";
import utility from "../../utility";
const CommitteeChatModal = ({ isOpen, onClose, itemId, yesVotes, noVotes }) => {
  const [committeeMembers, setCommitteeMembers] = useState([]);
  window.Buffer = Buffer;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { address } = useAccount();
  const { data } = useContractReads({
    contracts: [
      {
        ...auction,
        functionName: "getCommitteeChatLogOfItem",
        args: [itemId],
      },
      {
        ...auction,
        functionName: "getCommitteeMembers",
      },
    ],
    watch: true,
  });

  const handleSendMessage = async () => {
    let date = Date.now();
    let transmissionMsg = date + "-" + address + "-" + message;
    await writeContract({
      address: auction.address,
      abi: auction.abi,
      functionName: "sendCommitteeChat",
      args: [itemId, transmissionMsg],
      account: address,
    })
      .then(() => {
        enqueueSnackbar("Successfully sent the message!", {
          variant: "success",
        });
        setMessages([
          ...messages,
          { date: date, text: message, sender: "You" },
        ]);
        setMessage("");
      })
      .catch((e) => {
        console.log(e);
        enqueueSnackbar("There was a problem during message transmission!", {
          variant: "error",
        });
        setMessage("");
      });
  };

  useEffect(() => {
    if (data && data[0] && data[0].result) {
      setMessages([]);
      console.log("HEY");
      console.log(data[0].result);
      const tempArr = data[0].result.map((msg) => {
        let elements = msg.split("-");
        let date = elements[0];
        let sender = elements[1];
        let msgPart = elements[2];
        if (sender == address) sender = "You";

        return { date: date, sender: sender, text: msgPart };
      });
      setMessages(tempArr);
    }
    if (data && data[1] && data[1].result) {
      setCommitteeMembers(data[1].result);
    }
  }, data);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="100%" fullWidth>
      <Box
        display="flex"
        height="50vh"
        sx={{
          background: "#333333",
        }}
      >
        <Box
          sx={{
            width: "30%", // Width of the sidebar
            backgroundColor: "#f0f0f0",
            padding: "20px",
            overflowY: "auto",
            background: "#333333",
          }}
        >
          <h3>Committee Members</h3>
          <List>
            {committeeMembers.map((wallet, index) => (
              <ListItem key={index}>
                <ListItemText primary={wallet} sx={{ color: "white" }} />
              </ListItem>
            ))}
          </List>
        </Box>
        <Divider
          orientation="vertical"
          variant="middle"
          flexItem
          sx={{ borderRightWidth: 5 }}
        />
        <DialogContent
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            padding: "20px",
          }}
        >
          {/* Existing chat content */}
          <Box>
            <List>
              {messages.map((msg, index) => (
                <ListItem
                  key={index}
                  alignItems={msg.sender !== "You" ? "flex-start" : "flex-end"}
                >
                  <ListItemText
                    primary={msg.text}
                    secondary={
                      msg.sender + " " + utility.returnFormattedTime(msg.date)
                    }
                    style={{
                      textAlign: msg.sender !== "You" ? "left" : "right",
                      color: "white",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
      </Box>
      <Box
        px={2}
        py={1}
        sx={{
          background: "#333333",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <p style={{ color: "white" }}>
              Votes in favor of Cancellation: {yesVotes}
            </p>
            <p style={{ color: "white" }}>
              Votes in favor of Finalization: {noVotes}
            </p>
          </Box>
        </Box>
        <TextField
          label="Type your message"
          variant="outlined"
          fullWidth
          rows="3"
          multiline
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          fullWidth
          sx={{ mt: 1, bgcolor: "#2e5d4b" }}
        >
          Send
        </Button>
      </Box>
    </Dialog>
  );
};
export default CommitteeChatModal;
