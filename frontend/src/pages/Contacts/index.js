import React, { useState, useEffect, useReducer, useContext } from "react";
import openSocket from "../../services/socket-io";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { Search, MessageCircle, Pencil, Trash2, Plus, Upload } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "../../components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal/";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";

const reducer = (state, action) => {
	if (action.type === "LOAD_CONTACTS") {
		const contacts = action.payload;
		const newContacts = [];

		contacts.forEach((contact) => {
			const contactIndex = state.findIndex((c) => c.id === contact.id);
			if (contactIndex !== -1) {
				state[contactIndex] = contact;
			} else {
				newContacts.push(contact);
			}
		});

		return [...state, ...newContacts];
	}

	if (action.type === "UPDATE_CONTACTS") {
		const contact = action.payload;
		const contactIndex = state.findIndex((c) => c.id === contact.id);

		if (contactIndex !== -1) {
			state[contactIndex] = contact;
			return [...state];
		} else {
			return [contact, ...state];
		}
	}

	if (action.type === "DELETE_CONTACT") {
		const contactId = action.payload;

		const contactIndex = state.findIndex((c) => c.id === contactId);
		if (contactIndex !== -1) {
			state.splice(contactIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const Contacts = () => {
	const history = useHistory();

	const { user } = useContext(AuthContext);

	const [loading, setLoading] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);
	const [searchParam, setSearchParam] = useState("");
	const [contacts, dispatch] = useReducer(reducer, []);
	const [selectedContactId, setSelectedContactId] = useState(null);
	const [contactModalOpen, setContactModalOpen] = useState(false);
	const [deletingContact, setDeletingContact] = useState(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [hasMore, setHasMore] = useState(false);

	useEffect(() => {
		dispatch({ type: "RESET" });
		setPageNumber(1);
	}, [searchParam]);

	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				try {
					const { data } = await api.get("/contacts/", {
						params: { searchParam, pageNumber },
					});
					dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
					setHasMore(data.hasMore);
					setLoading(false);
				} catch (err) {
					toastError(err);
				}
			};
			fetchContacts();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, pageNumber]);

	useEffect(() => {
		const socket = openSocket();

		socket.on("contact", (data) => {
			if (data.action === "update" || data.action === "create") {
				dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
			}

			if (data.action === "delete") {
				dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleSearch = (event) => {
		setSearchParam(event.target.value.toLowerCase());
	};

	const handleOpenContactModal = () => {
		setSelectedContactId(null);
		setContactModalOpen(true);
	};

	const handleCloseContactModal = () => {
		setSelectedContactId(null);
		setContactModalOpen(false);
	};

	const handleSaveTicket = async (contactId) => {
		if (!contactId) return;
		setLoading(true);
		try {
			const { data: ticket } = await api.post("/tickets", {
				contactId: contactId,
				userId: user?.id,
				status: "open",
			});
			history.push(`/tickets/${ticket.id}`);
		} catch (err) {
			toastError(err);
		}
		setLoading(false);
	};

	const hadleEditContact = (contactId) => {
		setSelectedContactId(contactId);
		setContactModalOpen(true);
	};

	const handleDeleteContact = async (contactId) => {
		try {
			await api.delete(`/contacts/${contactId}`);
			toast.success(i18n.t("contacts.toasts.deleted"));
		} catch (err) {
			toastError(err);
		}
		setDeletingContact(null);
		setSearchParam("");
		setPageNumber(1);
	};

	const handleimportContact = async () => {
		try {
			await api.post("/contacts/import");
			history.go(0);
		} catch (err) {
			toastError(err);
		}
	};

	const loadMore = () => {
		setPageNumber((prevState) => prevState + 1);
	};

	const handleScroll = (e) => {
		if (!hasMore || loading) return;
		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
		if (scrollHeight - (scrollTop + 100) < clientHeight) {
			loadMore();
		}
	};

	return (
		<MainContainer>
			<ContactModal
				open={contactModalOpen}
				onClose={handleCloseContactModal}
				contactId={selectedContactId}
			></ContactModal>
			<ConfirmationModal
				title={
					deletingContact
						? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${
								deletingContact.name
						  }?`
						: `${i18n.t("contacts.confirmationModal.importTitlte")}`
				}
				open={confirmOpen}
				onClose={setConfirmOpen}
				onConfirm={(e) =>
					deletingContact
						? handleDeleteContact(deletingContact.id)
						: handleimportContact()
				}
			>
				{deletingContact
					? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
					: `${i18n.t("contacts.confirmationModal.importMessage")}`}
			</ConfirmationModal>
			<MainHeader>
				<Title>{i18n.t("contacts.title")}</Title>
				<MainHeaderButtonsWrapper>
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={i18n.t("contacts.searchPlaceholder")}
							type="search"
							value={searchParam}
							onChange={handleSearch}
							className="w-56 pl-9"
						/>
					</div>
					<Button variant="outline" onClick={() => setConfirmOpen(true)}>
						<Upload className="h-4 w-4" />
						{i18n.t("contacts.buttons.import")}
					</Button>
					<Button onClick={handleOpenContactModal}>
						<Plus className="h-4 w-4" />
						{i18n.t("contacts.buttons.add")}
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-auto px-6 pb-6" onScroll={handleScroll}>
			<div className="rounded-xl border bg-card">
				<Table>
					<TableHeader className="sticky top-0 z-10 bg-card">
						<TableRow>
							<TableHead className="w-12" />
							<TableHead>{i18n.t("contacts.table.name")}</TableHead>
							<TableHead className="text-center">
								{i18n.t("contacts.table.whatsapp")}
							</TableHead>
							<TableHead className="text-center">
								{i18n.t("contacts.table.email")}
							</TableHead>
							<TableHead className="text-center">
								{i18n.t("contacts.table.actions")}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{contacts.map((contact) => {
							const initials = (contact.name || "?")
								.split(" ")
								.slice(0, 2)
								.map((n) => n[0])
								.join("")
								.toUpperCase();
							return (
								<TableRow key={contact.id}>
									<TableCell className="pr-0">
										<Avatar className="h-9 w-9">
											<AvatarImage src={contact.profilePicUrl} alt={contact.name} />
											<AvatarFallback className="text-xs">{initials}</AvatarFallback>
										</Avatar>
									</TableCell>
									<TableCell className="font-medium">{contact.name}</TableCell>
									<TableCell className="text-center text-muted-foreground">
										{contact.number}
									</TableCell>
									<TableCell className="text-center text-muted-foreground">
										{contact.email}
									</TableCell>
									<TableCell>
										<TooltipProvider>
											<div className="flex items-center justify-center gap-1">
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8"
															onClick={() => handleSaveTicket(contact.id)}
														>
															<MessageCircle className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>{i18n.t("contacts.table.whatsapp")}</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8"
															onClick={() => hadleEditContact(contact.id)}
														>
															<Pencil className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>{i18n.t("contactModal.buttons.okEdit")}</TooltipContent>
												</Tooltip>
												<Can
													role={user.profile}
													perform="contacts-page:deleteContact"
													yes={() => (
														<Tooltip>
															<TooltipTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-8 w-8 text-destructive hover:text-destructive"
																	onClick={(e) => {
																		setConfirmOpen(true);
																		setDeletingContact(contact);
																	}}
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</TooltipTrigger>
															<TooltipContent>
																{i18n.t("confirmationModal.buttons.confirm")}
															</TooltipContent>
														</Tooltip>
													)}
												/>
											</div>
										</TooltipProvider>
									</TableCell>
								</TableRow>
							);
						})}
						{loading && <TableRowSkeleton avatar columns={3} />}
					</TableBody>
				</Table>
			</div>
			</div>
		</MainContainer>
	);
};

export default Contacts;
