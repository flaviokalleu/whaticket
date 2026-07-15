import React from "react";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

import TicketsManager from "../../components/TicketsManager/";
import Ticket from "../../components/Ticket/";

import { i18n } from "../../translate/i18n";
import Hidden from "@mui/material/Hidden";

const ChatContainer = styled("div")(({ theme }) => ({
  flex: 1,
  height: `calc(100% - 48px)`,
  overflowY: "hidden",
  backgroundColor: theme.palette.background.default,
}));

const ChatPapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  backgroundColor: theme.palette.background.paper,
}));

const ContactsGrid = styled(Grid, {
  shouldForwardProp: (prop) => prop !== "closed",
})(({ theme, closed }) => ({
  display: "flex",
  height: "100%",
  flexDirection: "column",
  overflowY: "hidden",
  ...(closed && {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  }),
}));

const MessagesGrid = styled(Grid)(() => ({
  display: "flex",
  height: "100%",
  flexDirection: "column",
}));

const WelcomeMsgPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  justifyContent: "space-evenly",
  alignItems: "center",
  height: "100%",
  textAlign: "center",
  borderRadius: 0,
}));

const Chat = () => {
  const { ticketId } = useParams();

  return (
    <ChatContainer>
      <ChatPapper>
        <Grid container spacing={0}>
          <ContactsGrid item xs={12} md={4} closed={!!ticketId}>
            <TicketsManager />
          </ContactsGrid>
          <MessagesGrid item xs={12} md={8}>
            {ticketId ? (
              <>
                <Ticket />
              </>
            ) : (
              <Hidden only={["sm", "xs"]}>
                <WelcomeMsgPaper>
                  <span>{i18n.t("chat.noTicketMessage")}</span>
                </WelcomeMsgPaper>
              </Hidden>
            )}
          </MessagesGrid>
        </Grid>
      </ChatPapper>
    </ChatContainer>
  );
};

export default Chat;
