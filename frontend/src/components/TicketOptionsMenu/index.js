import React, { useContext, useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModal from "../TransferTicketModal";
import toastError from "../../errors/toastError";
import { Can } from "../Can";
import { AuthContext } from "../../context/Auth/AuthContext";

const TicketOptionsMenu = ({ ticket }) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
	const isMounted = useRef(true);
	const { user } = useContext(AuthContext);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const handleDeleteTicket = async () => {
		try {
			await api.delete(`/tickets/${ticket.id}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleOpenTransferModal = () => {
		setTransferTicketModalOpen(true);
		setMenuOpen(false);
	};

	const handleCloseTransferTicketModal = () => {
		if (isMounted.current) {
			setTransferTicketModalOpen(false);
		}
	};

	return (
		<>
			<DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon">
						<MoreVertical className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={handleOpenTransferModal}>
						{i18n.t("ticketOptionsMenu.transfer")}
					</DropdownMenuItem>
					<Can
						role={user.profile}
						perform="ticket-options:deleteTicket"
						yes={() => (
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								onClick={() => {
									setConfirmationOpen(true);
									setMenuOpen(false);
								}}
							>
								{i18n.t("ticketOptionsMenu.delete")}
							</DropdownMenuItem>
						)}
					/>
				</DropdownMenuContent>
			</DropdownMenu>
			<ConfirmationModal
				title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")}${
					ticket.id
				} ${i18n.t("ticketOptionsMenu.confirmationModal.titleFrom")} ${
					ticket.contact.name
				}?`}
				open={confirmationOpen}
				onClose={setConfirmationOpen}
				onConfirm={handleDeleteTicket}
			>
				{i18n.t("ticketOptionsMenu.confirmationModal.message")}
			</ConfirmationModal>
			<TransferTicketModal
				modalOpen={transferTicketModalOpen}
				onClose={handleCloseTransferTicketModal}
				ticketid={ticket.id}
				ticketWhatsappId={ticket.whatsappId}
			/>
		</>
	);
};

export default TicketOptionsMenu;
