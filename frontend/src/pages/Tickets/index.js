import React from "react";
import { useParams } from "react-router-dom";
import { MessageSquareText } from "lucide-react";

import TicketsManager from "../../components/TicketsManager/";
import Ticket from "../../components/Ticket/";

import { i18n } from "../../translate/i18n";

const Chat = () => {
  const { ticketId } = useParams();

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      <div
        className={`h-full w-full shrink-0 overflow-hidden border-r sm:w-[380px] ${
          ticketId ? "hidden sm:block" : "block"
        }`}
      >
        <TicketsManager />
      </div>
      <div className="hidden min-h-0 flex-1 sm:flex">
        {ticketId ? (
          <Ticket />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted/30 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquareText className="h-7 w-7" />
            </div>
            <span className="max-w-xs text-sm text-muted-foreground">
              {i18n.t("chat.noTicketMessage")}
            </span>
          </div>
        )}
      </div>
      {ticketId && (
        <div className="flex min-h-0 flex-1 sm:hidden">
          <Ticket />
        </div>
      )}
    </div>
  );
};

export default Chat;
