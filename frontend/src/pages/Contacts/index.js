import React, { useState, useEffect, useReducer, useContext } from "react";
import openSocket from "../../services/socket-io";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import {
	Search,
	MessageCircle,
	Pencil,
	Trash2,
	Plus,
	Upload,
	Copy,
	MoreVertical,
	FileDown,
	UserX,
	Loader2,
	Merge,
} from "lucide-react";

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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../../components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Badge } from "../../components/ui/badge";

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

	// Duplicados / dedup
	const [dedupDialogOpen, setDedupDialogOpen] = useState(false);
	const [dedupLoading, setDedupLoading] = useState(false);
	const [duplicateGroups, setDuplicateGroups] = useState([]);
	const [primarySelection, setPrimarySelection] = useState({});
	const [mergingKey, setMergingKey] = useState(null);

	// LGPD
	const [anonymizingContact, setAnonymizingContact] = useState(null);

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

	const fetchDuplicates = async () => {
		setDedupLoading(true);
		try {
			const { data } = await api.get("/contacts/dedup/find");
			const groups = data.duplicateGroups || [];
			setDuplicateGroups(groups);
			setPrimarySelection((prev) => {
				const next = { ...prev };
				groups.forEach((group) => {
					if (!next[group.key] || !group.contacts.some((c) => c.id === next[group.key])) {
						next[group.key] = group.contacts[0]?.id;
					}
				});
				return next;
			});
		} catch (err) {
			toastError(err);
		}
		setDedupLoading(false);
	};

	const handleOpenDedupDialog = () => {
		setDedupDialogOpen(true);
		fetchDuplicates();
	};

	const handleMergeGroup = async (group) => {
		const primaryContactId = primarySelection[group.key];
		if (!primaryContactId) return;
		const duplicateContactIds = group.contacts
			.filter((c) => c.id !== primaryContactId)
			.map((c) => c.id);
		if (duplicateContactIds.length === 0) return;
		setMergingKey(group.key);
		try {
			await api.post("/contacts/dedup/merge", {
				primaryContactId,
				duplicateContactIds,
			});
			toast.success("Contatos mesclados com sucesso.");
			await fetchDuplicates();
			dispatch({ type: "RESET" });
			setPageNumber(1);
			setSearchParam("");
		} catch (err) {
			toastError(err);
		}
		setMergingKey(null);
	};

	const handleExportLGPD = async (contact) => {
		try {
			const { data } = await api.get(`/contacts/${contact.id}/lgpd/export`);
			const blob = new Blob([JSON.stringify(data, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `contato-${contact.id}-lgpd.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			toast.success("Dados exportados com sucesso.");
		} catch (err) {
			toastError(err);
		}
	};

	const handleAnonymizeContact = async () => {
		if (!anonymizingContact) return;
		try {
			await api.delete(`/contacts/${anonymizingContact.id}/lgpd/anonymize`);
			toast.success("Contato anonimizado com sucesso.");
			dispatch({ type: "RESET" });
			setPageNumber(1);
			setSearchParam("");
		} catch (err) {
			toastError(err);
		}
		setAnonymizingContact(null);
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
			<ConfirmationModal
				title={
					anonymizingContact
						? `Anonimizar o contato ${anonymizingContact.name}?`
						: ""
				}
				open={!!anonymizingContact}
				onClose={() => setAnonymizingContact(null)}
				onConfirm={handleAnonymizeContact}
			>
				Os dados pessoais deste contato serão removidos permanentemente
				(LGPD). Esta ação não pode ser desfeita.
			</ConfirmationModal>

			<Dialog open={dedupDialogOpen} onOpenChange={setDedupDialogOpen}>
				<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Contatos duplicados</DialogTitle>
					</DialogHeader>
					{dedupLoading && (
						<div className="flex justify-center py-6 text-muted-foreground">
							<Loader2 className="h-5 w-5 animate-spin" />
						</div>
					)}
					{!dedupLoading && duplicateGroups.length === 0 && (
						<p className="py-4 text-center text-sm text-muted-foreground">
							Nenhum contato duplicado encontrado.
						</p>
					)}
					{!dedupLoading && duplicateGroups.length > 0 && (
						<div className="space-y-4">
							{duplicateGroups.map((group) => (
								<div key={group.key} className="rounded-lg border p-3">
									<div className="mb-2 flex items-center justify-between gap-2">
										<Badge variant="secondary">
											{group.contacts.length} contatos
										</Badge>
										<Button
											size="sm"
											onClick={() => handleMergeGroup(group)}
											disabled={mergingKey === group.key}
										>
											{mergingKey === group.key ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Merge className="h-4 w-4" />
											)}
											Mesclar
										</Button>
									</div>
									<p className="mb-2 text-xs text-muted-foreground">
										Selecione o contato principal. Os demais serão mesclados
										nele.
									</p>
									<div className="space-y-1">
										{group.contacts.map((c) => (
											<label
												key={c.id}
												className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
											>
												<input
													type="radio"
													name={`primary-${group.key}`}
													className="h-4 w-4 accent-primary"
													checked={primarySelection[group.key] === c.id}
													onChange={() =>
														setPrimarySelection((prev) => ({
															...prev,
															[group.key]: c.id,
														}))
													}
												/>
												<span className="flex-1 truncate font-medium">
													{c.name}
												</span>
												<span className="shrink-0 text-muted-foreground">
													{c.number}
												</span>
											</label>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</DialogContent>
			</Dialog>
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
					<Button variant="outline" onClick={handleOpenDedupDialog}>
						<Copy className="h-4 w-4" />
						Duplicados
					</Button>
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
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon" className="h-8 w-8">
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => handleExportLGPD(contact)}>
															<FileDown className="mr-2 h-4 w-4" />
															Exportar dados (LGPD)
														</DropdownMenuItem>
														<DropdownMenuItem
															className="text-destructive focus:text-destructive"
															onClick={() => setAnonymizingContact(contact)}
														>
															<UserX className="mr-2 h-4 w-4" />
															Anonimizar (LGPD)
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
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
