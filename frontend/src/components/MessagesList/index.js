import React, { useState, useEffect, useReducer, useRef } from "react";

import { isSameDay, parseISO, format } from "date-fns";
import openSocket from "../../services/socket-io";
import {
  Clock,
  Check,
  CheckCheck,
  ChevronDown,
  Ban,
  Download,
  Loader2,
} from "lucide-react";

import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

import MarkdownWrapper from "../MarkdownWrapper";
import VcardPreview from "../VcardPreview";
import LocationPreview from "../LocationPreview";
import ModalImageCors from "../ModalImageCors";
import MessageOptionsMenu from "../MessageOptionsMenu";
import whatsBackground from "../../assets/wa-background.png";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import Audio from "../Audio";

const reducer = (state, action) => {
  if (action.type === "LOAD_MESSAGES") {
    const messages = action.payload;
    const newMessages = [];

    messages.forEach((message) => {
      const messageIndex = state.findIndex((m) => m.id === message.id);
      if (messageIndex !== -1) {
        state[messageIndex] = message;
      } else {
        newMessages.push(message);
      }
    });

    return [...newMessages, ...state];
  }

  if (action.type === "ADD_MESSAGE") {
    const newMessage = action.payload;
    const messageIndex = state.findIndex((m) => m.id === newMessage.id);

    if (messageIndex !== -1) {
      state[messageIndex] = newMessage;
    } else {
      state.push(newMessage);
    }

    return [...state];
  }

  if (action.type === "UPDATE_MESSAGE") {
    const messageToUpdate = action.payload;
    const messageIndex = state.findIndex((m) => m.id === messageToUpdate.id);

    if (messageIndex !== -1) {
      state[messageIndex] = messageToUpdate;
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const MessagesList = ({ ticketId, isGroup }) => {
  const [messagesList, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastMessageRef = useRef();

  const [selectedMessage, setSelectedMessage] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const messageOptionsMenuOpen = Boolean(anchorEl);
  const currentTicketId = useRef(ticketId);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);

    currentTicketId.current = ticketId;
  }, [ticketId]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchMessages = async () => {
        try {
          const { data } = await api.get("/messages/" + ticketId, {
            params: { pageNumber },
          });

          if (currentTicketId.current === ticketId) {
            dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
            setHasMore(data.hasMore);
            setLoading(false);
          }

          if (pageNumber === 1 && data.messages.length > 1) {
            scrollToBottom();
          }
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchMessages();
    }, 500);
    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [pageNumber, ticketId]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("connect", () => socket.emit("joinChatBox", ticketId));

    socket.on("appMessage", (data) => {
      if (data.action === "create") {
        dispatch({ type: "ADD_MESSAGE", payload: data.message });
        scrollToBottom();
      }

      if (data.action === "update") {
        dispatch({ type: "UPDATE_MESSAGE", payload: data.message });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId]);

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({});
    }
  };

  const handleScroll = (e) => {
    if (!hasMore) return;
    const { scrollTop } = e.currentTarget;

    if (scrollTop === 0) {
      document.getElementById("messagesList").scrollTop = 1;
    }

    if (loading) {
      return;
    }

    if (scrollTop < 50) {
      loadMore();
    }
  };

  const handleOpenMessageOptionsMenu = (e, message) => {
    setAnchorEl(e.currentTarget);
    setSelectedMessage(message);
  };

  const handleCloseMessageOptionsMenu = (e) => {
    setAnchorEl(null);
  };

  const checkMessageMedia = (message) => {
    if (message.mediaType === "location" && message.body.split('|').length >= 2) {
      let locationParts = message.body.split('|')
      let imageLocation = locationParts[0]
      let linkLocation = locationParts[1]

      let descriptionLocation = null

      if (locationParts.length > 2)
        descriptionLocation = message.body.split('|')[2]

      return <LocationPreview image={imageLocation} link={linkLocation} description={descriptionLocation} />
    }
    else if (message.mediaType === "vcard") {
      let array = message.body.split("\n");
      let obj = [];
      let contact = "";
      for (let index = 0; index < array.length; index++) {
        const v = array[index];
        let values = v.split(":");
        for (let ind = 0; ind < values.length; ind++) {
          if (values[ind].indexOf("+") !== -1) {
            obj.push({ number: values[ind] });
          }
          if (values[ind].indexOf("FN") !== -1) {
            contact = values[ind + 1];
          }
        }
      }
      return <VcardPreview contact={contact} numbers={obj[0]?.number} />
    }
    else if ( /^.*\.(jpe?g|png|gif)?$/i.exec(message.mediaUrl) && message.mediaType === "image") {
      return <ModalImageCors imageUrl={message.mediaUrl} />;
    } else if (message.mediaType === "audio") {
      return <Audio url={message.mediaUrl} />
    } else if (message.mediaType === "video") {
      return (
        <video
          className="h-[200px] w-[250px] rounded-lg object-cover"
          src={message.mediaUrl}
          controls
        />
      );
    } else {
      return (
        <div className="flex items-center justify-center gap-2 border-b p-2.5">
          <Button asChild variant="outline" size="sm">
            <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      );
    }
  };

  const renderMessageAck = (message) => {
    if (message.ack === 0) {
      return <Clock className="ml-1 inline h-3.5 w-3.5 align-middle" />;
    }
    if (message.ack === 1) {
      return <Check className="ml-1 inline h-3.5 w-3.5 align-middle" />;
    }
    if (message.ack === 2) {
      return <CheckCheck className="ml-1 inline h-3.5 w-3.5 align-middle" />;
    }
    if (message.ack === 3 || message.ack === 4) {
      return (
        <CheckCheck className="ml-1 inline h-3.5 w-3.5 align-middle text-emerald-500" />
      );
    }
  };

  const renderDailyTimestamps = (message, index) => {
    if (index === 0) {
      return (
        <div
          key={`timestamp-${message.id}`}
          className="mx-auto my-2.5 w-fit self-center rounded-full bg-sky-100 px-3 py-1 text-center text-xs text-slate-600 shadow-sm dark:bg-sky-900/40 dark:text-sky-200"
        >
          {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
        </div>
      );
    }
    if (index < messagesList.length - 1) {
      let messageDay = parseISO(messagesList[index].createdAt);
      let previousMessageDay = parseISO(messagesList[index - 1].createdAt);

      if (!isSameDay(messageDay, previousMessageDay)) {
        return (
          <div
            key={`timestamp-${message.id}`}
            className="mx-auto my-2.5 w-fit self-center rounded-full bg-sky-100 px-3 py-1 text-center text-xs text-slate-600 shadow-sm dark:bg-sky-900/40 dark:text-sky-200"
          >
            {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
          </div>
        );
      }
    }
    if (index === messagesList.length - 1) {
      return (
        <div
          key={`ref-${message.createdAt}`}
          ref={lastMessageRef}
          style={{ float: "left", clear: "both" }}
        />
      );
    }
  };

  const renderMessageDivider = (message, index) => {
    if (index < messagesList.length && index > 0) {
      let messageUser = messagesList[index].fromMe;
      let previousMessageUser = messagesList[index - 1].fromMe;

      if (messageUser !== previousMessageUser) {
        return <span className="mt-4" key={`divider-${message.id}`}></span>;
      }
    }
  };

  const renderQuotedMessage = (message) => {
    return (
      <div
        className={cn(
          "-mx-1.5 -my-0.5 mb-1.5 flex overflow-hidden rounded-lg",
          message.fromMe ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "w-1 shrink-0",
            message.quotedMsg?.fromMe ? "bg-emerald-400" : "bg-sky-400"
          )}
        />
        <div className="min-w-0 overflow-hidden whitespace-pre-wrap p-2.5 text-sm">
          {!message.quotedMsg?.fromMe && (
            <span className="flex font-medium text-sky-500">
              {message.quotedMsg?.contact?.name}
            </span>
          )}
          {message.quotedMsg?.body}
        </div>
      </div>
    );
  };

  const bubbleBase =
    "relative mt-0.5 block h-auto max-w-[85%] whitespace-pre-wrap break-words rounded-lg px-2.5 pb-1 pt-1.5 shadow-sm sm:max-w-[600px]";

  const renderMessages = () => {
    if (messagesList.length > 0) {
      const viewMessagesList = messagesList.map((message, index) => {
        if (!message.fromMe) {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderMessageDivider(message, index)}
              <div className={cn(bubbleBase, "group mr-5 self-start bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100")}>
                <button
                  type="button"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                  className="absolute right-0 top-0 hidden h-7 w-7 items-center justify-center rounded-full bg-inherit text-muted-foreground opacity-90 group-hover:flex hover:bg-black/5"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isGroup && (
                  <span className="flex font-medium text-sky-500">
                    {message.contact?.name}
                  </span>
                )}
                {(message.mediaUrl || message.mediaType === "location" || message.mediaType === "vcard"
                ) && checkMessageMedia(message)}
                <div className="break-words pb-1 pr-16 pt-0.5">
                  {message.quotedMsg && renderQuotedMessage(message)}
                  <MarkdownWrapper>{message.body}</MarkdownWrapper>
                  <span className="absolute bottom-0.5 right-1.5 text-[11px] text-muted-foreground">
                    {format(parseISO(message.createdAt), "HH:mm")}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderMessageDivider(message, index)}
              <div className={cn(bubbleBase, "group ml-5 self-end bg-emerald-100 text-slate-800 dark:bg-emerald-900/40 dark:text-slate-100")}>
                <button
                  type="button"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                  className="absolute right-0 top-0 hidden h-7 w-7 items-center justify-center rounded-full bg-inherit text-muted-foreground opacity-90 group-hover:flex hover:bg-black/5"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                {(message.mediaUrl || message.mediaType === "location" || message.mediaType === "vcard"
                ) && checkMessageMedia(message)}
                <div
                  className={cn(
                    "break-words pb-1 pr-16 pt-0.5",
                    message.isDeleted && "italic text-muted-foreground"
                  )}
                >
                  {message.isDeleted && (
                    <Ban className="mr-1 inline h-3.5 w-3.5 align-middle" />
                  )}
                  {message.quotedMsg && renderQuotedMessage(message)}
                  <MarkdownWrapper>{message.body}</MarkdownWrapper>
                  <span className="absolute bottom-0.5 right-1.5 flex items-center text-[11px] text-muted-foreground">
                    {format(parseISO(message.createdAt), "HH:mm")}
                    {renderMessageAck(message)}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        }
      });
      return viewMessagesList;
    } else {
      return <div>Say hello to your new contact!</div>;
    }
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <MessageOptionsMenu
        message={selectedMessage}
        anchorEl={anchorEl}
        menuOpen={messageOptionsMenuOpen}
        handleClose={handleCloseMessageOptionsMenu}
      />
      <div
        id="messagesList"
        onScroll={handleScroll}
        className="flex flex-1 flex-col overflow-y-auto bg-repeat p-5 pb-24 sm:pb-5"
        style={{ backgroundImage: `url(${whatsBackground})` }}
      >
        {messagesList.length > 0 ? renderMessages() : []}
      </div>
      {loading && (
        <div className="absolute left-1/2 top-3 -translate-x-1/2">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500 opacity-70" />
        </div>
      )}
    </div>
  );
};

export default MessagesList;
