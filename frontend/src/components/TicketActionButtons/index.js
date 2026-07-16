import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { RotateCcw, Loader2 } from "lucide-react";

import { Button } from "../ui/button";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import TicketOptionsMenu from "../TicketOptionsMenu";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const TicketActionButtons = ({ ticket }) => {
	const history = useHistory();
	const [loading, setLoading] = useState(false);
	const { user } = useContext(AuthContext);

	const handleUpdateTicketStatus = async (e, status, userId) => {
		setLoading(true);
		try {
			await api.put(`/tickets/${ticket.id}`, {
				status: status,
				userId: userId || null,
			});

			setLoading(false);
			if (status === "open") {
				history.push(`/tickets/${ticket.id}`);
			} else {
				history.push("/tickets");
			}
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	};

	return (
		<div className="ml-auto flex shrink-0 items-center gap-1.5">
			{ticket.status === "closed" && (
				<Button
					size="sm"
					variant="outline"
					disabled={loading}
					onClick={(e) => handleUpdateTicketStatus(e, "open", user?.id)}
				>
					{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
					{i18n.t("messagesList.header.buttons.reopen")}
				</Button>
			)}
			{ticket.status === "open" && (
				<>
					<Button
						size="sm"
						variant="outline"
						disabled={loading}
						onClick={(e) => handleUpdateTicketStatus(e, "pending", null)}
					>
						{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
						{i18n.t("messagesList.header.buttons.return")}
					</Button>
					<Button
						size="sm"
						disabled={loading}
						onClick={(e) => handleUpdateTicketStatus(e, "closed", user?.id)}
					>
						{loading && <Loader2 className="h-4 w-4 animate-spin" />}
						{i18n.t("messagesList.header.buttons.resolve")}
					</Button>
					<TicketOptionsMenu ticket={ticket} />
				</>
			)}
			{ticket.status === "pending" && (
				<Button
					size="sm"
					disabled={loading}
					onClick={(e) => handleUpdateTicketStatus(e, "open", user?.id)}
				>
					{loading && <Loader2 className="h-4 w-4 animate-spin" />}
					{i18n.t("messagesList.header.buttons.accept")}
				</Button>
			)}
		</div>
	);
};

export default TicketActionButtons;
