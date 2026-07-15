import React from "react";

import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import { useHistory } from "react-router-dom";

const TicketHeader = ({ loading, children }) => {
  const history = useHistory();
  const handleBack = () => {
    history.push("/tickets");
  };

  return (
    <>
      {loading ? (
        <TicketHeaderSkeleton />
      ) : (
        <Card
          square
          sx={(theme) => ({
            display: "flex",
            backgroundColor: "#eee",
            flex: "none",
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
            [theme.breakpoints.down("sm")]: {
              flexWrap: "wrap",
            },
          })}
        >
          <Button color="primary" onClick={handleBack}>
            <ArrowBackIos />
          </Button>
          {children}
        </Card>
      )}
    </>
  );
};

export default TicketHeader;
