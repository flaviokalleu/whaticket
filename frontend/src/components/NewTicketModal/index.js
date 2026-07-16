import React, { useState, useEffect, useContext, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Loader2, UserPlus, Search } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ContactModal from "../ContactModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { cn } from "../../lib/utils";

const NewTicketModal = ({ modalOpen, onClose }) => {
	const history = useHistory();

	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [selectedContact, setSelectedContact] = useState(null);
	const [newContact, setNewContact] = useState({});
	const [contactModalOpen, setContactModalOpen] = useState(false);
	const { user } = useContext(AuthContext);
	const inputRef = useRef();

	useEffect(() => {
		if (!modalOpen || searchParam.length < 3) {
			setLoading(false);
			return;
		}
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				try {
					const { data } = await api.get("contacts", {
						params: { searchParam },
					});
					setOptions(data.contacts);
					setLoading(false);
				} catch (err) {
					setLoading(false);
					toastError(err);
				}
			};

			fetchContacts();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, modalOpen]);

	const handleClose = () => {
		onClose();
		setSearchParam("");
		setOptions([]);
		setSelectedContact(null);
	};

	const handleSaveTicket = async (contactId) => {
		if (!contactId) return;
		setLoading(true);
		try {
			const { data: ticket } = await api.post("/tickets", {
				contactId: contactId,
				userId: user.id,
				status: "open",
			});
			history.push(`/tickets/${ticket.id}`);
		} catch (err) {
			toastError(err);
		}
		setLoading(false);
		handleClose();
	};

	const handleSelectOption = (contact) => {
		setSelectedContact(contact);
		setSearchParam(contact.name);
		setOptions([]);
	};

	const handleCloseContactModal = () => {
		setContactModalOpen(false);
	};

	const handleAddNewContactTicket = (contact) => {
		handleSaveTicket(contact.id);
	};

	const showCreateOption =
		searchParam.length >= 3 &&
		!loading &&
		!options.some((o) => o.name.toLowerCase() === searchParam.toLowerCase());

	return (
		<>
			<ContactModal
				open={contactModalOpen}
				initialValues={newContact}
				onClose={handleCloseContactModal}
				onSave={handleAddNewContactTicket}
			/>
			<Dialog open={modalOpen} onOpenChange={(o) => !o && handleClose()}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>{i18n.t("newTicketModal.title")}</DialogTitle>
					</DialogHeader>

					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							ref={inputRef}
							autoFocus
							className="pl-9"
							placeholder={i18n.t("newTicketModal.fieldLabel")}
							value={searchParam}
							onChange={(e) => {
								setSearchParam(e.target.value);
								setSelectedContact(null);
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter" && selectedContact) {
									handleSaveTicket(selectedContact.id);
								}
							}}
						/>
						{loading && (
							<Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
						)}
					</div>

					{(options.length > 0 || showCreateOption) && !selectedContact && (
						<div className="max-h-56 overflow-y-auto rounded-md border">
							{options.map((option) => (
								<button
									key={option.id}
									type="button"
									className={cn(
										"flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-accent"
									)}
									onClick={() => handleSelectOption(option)}
								>
									<span className="font-medium">{option.name}</span>
									<span className="text-xs text-muted-foreground">{option.number}</span>
								</button>
							))}
							{showCreateOption && (
								<button
									type="button"
									className="flex w-full items-center gap-2 border-t px-3 py-2 text-left text-sm text-primary hover:bg-accent"
									onClick={() => {
										setNewContact({ name: searchParam });
										setContactModalOpen(true);
									}}
								>
									<UserPlus className="h-4 w-4" />
									{i18n.t("newTicketModal.add")} "{searchParam}"
								</button>
							)}
						</div>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={handleClose} disabled={loading}>
							{i18n.t("newTicketModal.buttons.cancel")}
						</Button>
						<Button
							disabled={!selectedContact || loading}
							onClick={() => handleSaveTicket(selectedContact.id)}
						>
							{loading && <Loader2 className="h-4 w-4 animate-spin" />}
							{i18n.t("newTicketModal.buttons.ok")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default NewTicketModal;
