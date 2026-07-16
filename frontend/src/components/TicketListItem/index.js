import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";

import { Loader2 } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { cn } from "../../lib/utils";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import MarkdownWrapper from "../MarkdownWrapper";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

const TicketListItem = ({ ticket }) => {
	const history = useHistory();
	const [loading, setLoading] = useState(false);
	const { ticketId } = useParams();
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const handleAcepptTicket = async (id) => {
		setLoading(true);
		try {
			await api.put(`/tickets/${id}`, {
				status: "open",
				userId: user?.id,
			});
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
		if (isMounted.current) {
			setLoading(false);
		}
		history.push(`/tickets/${id}`);
	};

	const handleSelectTicket = (id) => {
		history.push(`/tickets/${id}`);
	};

	const isPending = ticket.status === "pending";
	const isSelected = ticketId && +ticketId === ticket.id;

	const initials = (ticket.contact?.name || "?")
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	return (
		<div
			className={cn(
				"relative flex gap-3 border-b px-4 py-3 transition-colors",
				isPending ? "cursor-default" : "cursor-pointer hover:bg-accent",
				isSelected && "bg-accent"
			)}
			onClick={() => {
				if (isPending) return;
				handleSelectTicket(ticket.id);
			}}
		>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<span
							className="absolute left-0 top-0 h-full w-1 shrink-0"
							style={{ backgroundColor: ticket.queue?.color || "#94a3b8" }}
						/>
					</TooltipTrigger>
					<TooltipContent side="right">
						{ticket.queue?.name || "Sem fila"}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<Avatar className="h-11 w-11 shrink-0">
				<AvatarImage src={ticket?.contact?.profilePicUrl} alt={ticket.contact?.name} />
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>

			<div className={cn("min-w-0 flex-1", isPending && "pb-7")}>
				<div className="flex items-center justify-between gap-2">
					<span className="truncate text-sm font-medium">{ticket.contact.name}</span>
					<div className="flex shrink-0 items-center gap-1.5">
						{ticket.status === "closed" && (
							<Badge variant="secondary" className="text-[10px]">
								closed
							</Badge>
						)}
						{ticket.lastMessage && (
							<span className="text-xs text-muted-foreground">
								{isSameDay(parseISO(ticket.updatedAt), new Date())
									? format(parseISO(ticket.updatedAt), "HH:mm")
									: format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}
							</span>
						)}
					</div>
				</div>

				<div className="mt-0.5 flex items-center justify-between gap-2">
					<span className="truncate text-xs text-muted-foreground">
						{ticket.lastMessage ? (
							<MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
						) : (
							<>&nbsp;</>
						)}
					</span>
					{ticket.unreadMessages > 0 && (
						<span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-semibold text-white">
							{ticket.unreadMessages}
						</span>
					)}
				</div>

				{ticket.whatsappId && (
					<span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
						{ticket.whatsapp?.name}
					</span>
				)}

				{ticket.tags?.length > 0 && (
					<div className="mt-1.5 flex flex-wrap gap-1">
						{ticket.tags.map((tag) => (
							<span
								key={tag.id}
								className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
								style={{ backgroundColor: tag.color }}
							>
								{tag.name}
							</span>
						))}
					</div>
				)}
			</div>

			{isPending && (
				<Button
					size="sm"
					disabled={loading}
					className="absolute bottom-2 left-1/2 -translate-x-1/2"
					onClick={(e) => {
						e.stopPropagation();
						handleAcepptTicket(ticket.id);
					}}
				>
					{loading && <Loader2 className="h-4 w-4 animate-spin" />}
					{i18n.t("ticketsList.buttons.accept")}
				</Button>
			)}
		</div>
	);
};

export default TicketListItem;
