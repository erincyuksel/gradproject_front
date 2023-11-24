import React from "react";
import { List, ListItem, Container } from "@mui/material";

const DisputesList = ({ disputes, onDisputeClick }) => {
  return (
    <Container>
      <List>
        {disputes.map((dispute) => (
          <ListItem
            key={dispute.id}
            button
            onClick={() => onDisputeClick(dispute)}
          >
            {`Dispute ID: ${dispute.id}`}
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default DisputesList;
