import React, { useState, useEffect, useContext, useRef } from "react";
import "emoji-mart/css/emoji-mart.css";
import { useParams } from "react-router-dom";
import { Picker } from "emoji-mart";
import {
  Paperclip,
  Smile,
  Send,
  X,
  Mic,
  MoreVertical,
  XCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "../../lib/utils";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import RecordingTimer from "./RecordingTimer";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import toastError from "../../errors/toastError";

let Mp3Recorder = null;

const initRecorder = async () => {
  if (!Mp3Recorder) {
    try {
      const MicRecorder = (await import("mic-recorder-to-mp3")).default;
      Mp3Recorder = new MicRecorder({ bitRate: 128 });
    } catch (error) {
      console.error("Failed to initialize recorder:", error);
      return null;
    }
  }
  return Mp3Recorder;
};

const MessageInput = ({ ticketStatus }) => {
  const { ticketId } = useParams();

  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [quickAnswers, setQuickAnswer] = useState([]);
  const [typeBar, setTypeBar] = useState(false);
  const inputRef = useRef();
  const emojiBoxRef = useRef();
  const { setReplyingMessage, replyingMessage } =
    useContext(ReplyMessageContext);
  const { user } = useContext(AuthContext);

  const disabled = loading || recording || ticketStatus !== "open";

  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);

  useEffect(() => {
    inputRef.current.focus();
  }, [replyingMessage]);

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setInputMessage("");
      setShowEmoji(false);
      setMedias([]);
      setReplyingMessage(null);
    };
  }, [ticketId, setReplyingMessage]);

  useEffect(() => {
    if (!showEmoji) return;
    const handleClickAway = (e) => {
      if (emojiBoxRef.current && !emojiBoxRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [showEmoji]);

  const handleChangeInput = (e) => {
    setInputMessage(e.target.value);
    handleLoadQuickAnswer(e.target.value);
  };

  const handleQuickAnswersClick = (value) => {
    setInputMessage(value);
    setTypeBar(false);
  };

  const handleAddEmoji = (e) => {
    let emoji = e.native;
    setInputMessage((prevState) => prevState + emoji);
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }

    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  };

  const handleInputPaste = (e) => {
    if (e.clipboardData.files[0]) {
      setMedias([e.clipboardData.files[0]]);
    }
  };

  const handleUploadMedia = async (e) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("fromMe", true);
    medias.forEach((media) => {
      formData.append("medias", media);
      formData.append("body", media.name);
    });

    try {
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
    setMedias([]);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    setLoading(true);

    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: signMessage
        ? `*${user?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim(),
      quotedMsg: replyingMessage,
    };
    try {
      await api.post(`/messages/${ticketId}`, message);
    } catch (err) {
      toastError(err);
    }

    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
  };

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      const recorder = await initRecorder();
      if (!recorder) {
        throw new Error("Recorder not available");
      }
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await recorder.start();
      setRecording(true);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleLoadQuickAnswer = async (value) => {
    if (value && value.indexOf("/") === 0) {
      try {
        const { data } = await api.get("/quickAnswers/", {
          params: { searchParam: inputMessage.substring(1) },
        });
        setQuickAnswer(data.quickAnswers);
        setTypeBar(data.quickAnswers.length > 0);
      } catch (err) {
        setTypeBar(false);
      }
    } else {
      setTypeBar(false);
    }
  };

  const handleUploadAudio = async () => {
    setLoading(true);
    try {
      const recorder = await initRecorder();
      if (!recorder) {
        throw new Error("Recorder not available");
      }
      const [, blob] = await recorder.stop().getMp3();
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        return;
      }

      const formData = new FormData();
      const filename = `${new Date().getTime()}.mp3`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);

      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }

    setRecording(false);
    setLoading(false);
  };

  const handleCancelAudio = async () => {
    try {
      const recorder = await initRecorder();
      if (recorder) {
        await recorder.stop().getMp3();
      }
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  };

  const renderReplyingMessage = (message) => {
    return (
      <div className="flex w-full items-center gap-2 px-3 pt-2">
        <div
          className={cn(
            "flex flex-1 overflow-hidden rounded-lg",
            !message.fromMe ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-black/5 dark:bg-white/10"
          )}
        >
          <span
            className={cn("w-1 shrink-0", !message.fromMe ? "bg-emerald-400" : "bg-sky-400")}
          />
          <div className="min-w-0 flex-1 whitespace-pre-wrap p-2.5 text-sm">
            {!message.fromMe && (
              <span className="flex font-medium text-sky-500">
                {message.contact?.name}
              </span>
            )}
            <span className="line-clamp-2">{message.body}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          disabled={loading || ticketStatus !== "open"}
          onClick={() => setReplyingMessage(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const signToggle = (
    <div className="flex items-center gap-1.5">
      <Switch
        id="signMessage"
        checked={signMessage}
        onCheckedChange={(checked) => setSignMessage(checked)}
      />
      <Label htmlFor="signMessage" className="text-xs font-normal text-muted-foreground">
        {i18n.t("messagesInput.signMessage")}
      </Label>
    </div>
  );

  if (medias.length > 0) {
    return (
      <div className="flex flex-none items-center justify-between gap-3 border-t bg-muted/40 px-4 py-2.5">
        <Button variant="ghost" size="icon" onClick={() => setMedias([])}>
          <X className="h-5 w-5 text-muted-foreground" />
        </Button>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
        ) : (
          <span className="flex-1 truncate text-sm">{medias[0]?.name}</span>
        )}
        <Button variant="ghost" size="icon" onClick={handleUploadMedia} disabled={loading}>
          <Send className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-none flex-col border-t bg-muted/40">
      {replyingMessage && renderReplyingMessage(replyingMessage)}
      <div className="flex w-full items-center gap-1 p-2">
        <div className="hidden items-center gap-0.5 sm:flex">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              disabled={disabled}
              onClick={() => setShowEmoji((prev) => !prev)}
            >
              <Smile className="h-5 w-5 text-muted-foreground" />
            </Button>
            {showEmoji && (
              <div ref={emojiBoxRef} className="absolute bottom-12 left-0 z-20">
                <Picker
                  perLine={16}
                  showPreview={false}
                  showSkinTones={false}
                  onSelect={handleAddEmoji}
                />
              </div>
            )}
          </div>

          <input
            multiple
            type="file"
            id="upload-button"
            className="hidden"
            disabled={disabled}
            onChange={handleChangeMedias}
          />
          <label htmlFor="upload-button">
            <Button variant="ghost" size="icon" asChild disabled={disabled}>
              <span>
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </span>
            </Button>
          </label>

          <div className="ml-1 mr-2">{signToggle}</div>
        </div>

        <div className="flex sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setShowEmoji((prev) => !prev);
                }}
                disabled={disabled}
              >
                <Smile className="h-4 w-4" /> Emoji
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label htmlFor="upload-button" className="flex cursor-pointer items-center gap-2">
                  <Paperclip className="h-4 w-4" /> Anexar
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                {signToggle}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder={
              ticketStatus === "open"
                ? i18n.t("messagesInput.placeholderOpen")
                : i18n.t("messagesInput.placeholderClosed")
            }
            value={inputMessage}
            onChange={handleChangeInput}
            disabled={recording || loading || ticketStatus !== "open"}
            onPaste={(e) => {
              ticketStatus === "open" && handleInputPaste(e);
            }}
            onKeyPress={(e) => {
              if (loading || e.shiftKey) return;
              else if (e.key === "Enter") {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="max-h-32 w-full resize-none rounded-2xl border bg-background px-4 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          />
          {typeBar && (
            <ul className="absolute bottom-full left-0 mb-1 w-full overflow-hidden rounded-lg border bg-popover shadow-md">
              {quickAnswers.map((value, index) => (
                <li key={index} className="list-none">
                  <button
                    type="button"
                    onClick={() => handleQuickAnswersClick(value.message)}
                    className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    {`${value.shortcut} - ${value.message}`}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {inputMessage ? (
          <Button variant="ghost" size="icon" onClick={handleSendMessage} disabled={loading}>
            <Send className="h-5 w-5 text-muted-foreground" />
          </Button>
        ) : recording ? (
          <div className="flex items-center">
            <Button variant="ghost" size="icon" disabled={loading} onClick={handleCancelAudio}>
              <XCircle className="h-5 w-5 text-destructive" />
            </Button>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            ) : (
              <RecordingTimer />
            )}
            <Button variant="ghost" size="icon" onClick={handleUploadAudio} disabled={loading}>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            disabled={loading || ticketStatus !== "open"}
            onClick={handleStartRecording}
          >
            <Mic className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
