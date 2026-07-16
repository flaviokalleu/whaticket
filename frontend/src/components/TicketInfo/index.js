import React from "react";
import { UserRound } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

import { i18n } from "../../translate/i18n";
import TagSelect from "../TagSelect";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const TicketInfo = ({ contact, ticket, onClick }) => {
	const handleChangeTags = async (tagIds) => {
		try {
			await api.put(`/tickets/${ticket.id}/tags`, { tagIds });
		} catch (err) {
			toastError(err);
		}
	};

	const initials = (contact?.name || "?")
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	return (
		<div className="flex min-w-0 flex-1 items-center gap-3">
			<button
				type="button"
				onClick={onClick}
				className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-lg py-1 pl-1 pr-2.5 text-left transition-colors hover:bg-accent"
			>
				<Avatar className="h-10 w-10 shrink-0">
					<AvatarImage src={contact?.profilePicUrl} alt={contact?.name} />
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
				<div className="min-w-0">
					<div className="flex items-baseline gap-1.5">
						<p className="truncate text-sm font-semibold leading-tight">
							{contact?.name}
						</p>
						<span className="shrink-0 text-xs font-normal text-muted-foreground">
							#{ticket.id}
						</span>
					</div>
					{ticket.user && (
						<p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
							<UserRound className="h-3 w-3 shrink-0" />
							{i18n.t("messagesList.header.assignedTo")} {ticket.user.name}
						</p>
					)}
				</div>
			</button>

			{ticket.id && (
				<div className="hidden min-w-0 max-w-[220px] sm:block">
					<TagSelect
						selectedTagIds={ticket.tags ? ticket.tags.map((tag) => tag.id) : []}
						onChange={handleChangeTags}
					/>
				</div>
			)}
		</div>
	);
};

export default TicketInfo;
