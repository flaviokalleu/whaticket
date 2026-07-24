import React, { useState, useEffect, useRef } from "react";

import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { Loader2, ChevronDown, Check, User as UserIcon } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { cn } from "../../lib/utils";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import useWhatsApps from "../../hooks/useWhatsApps";

const ScheduledMessageModal = ({
	open,
	onClose,
	scheduledMessageId,
	onSaved,
}) => {
	const [contactPopoverOpen, setContactPopoverOpen] = useState(false);
	const [contactOptions, setContactOptions] = useState([]);
	const [searchParam, setSearchParam] = useState("");
	const [searching, setSearching] = useState(false);
	const [selectedContact, setSelectedContact] = useState(null);
	const [selectedWhatsappId, setSelectedWhatsappId] = useState("");
	const [body, setBody] = useState("");
	const [scheduledFor, setScheduledFor] = useState("");
	const [saving, setSaving] = useState(false);
	const searchInputRef = useRef(null);

	const { whatsApps, loading: loadingWhatsapps } = useWhatsApps();

	useEffect(() => {
		(async () => {
			if (!scheduledMessageId || !open) return;
			try {
				const { data } = await api.get(
					`/scheduled-messages/${scheduledMessageId}`
				);
				setSelectedContact(data.contact || null);
				setSelectedWhatsappId(data.whatsappId ? String(data.whatsappId) : "");
				setBody(data.body || "");
				if (data.scheduledFor) {
					setScheduledFor(
						format(parseISO(data.scheduledFor), "yyyy-MM-dd'T'HH:mm")
					);
				}
			} catch (err) {
				toastError(err);
			}
		})();
	}, [scheduledMessageId, open]);

	useEffect(() => {
		if (!open || searchParam.length < 2) {
			setSearching(false);
			return;
		}
		setSearching(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				try {
					const { data } = await api.get("/contacts", {
						params: { searchParam },
					});
					setContactOptions(data.contacts || []);
					setSearching(false);
				} catch (err) {
					setSearching(false);
					toastError(err);
				}
			};
			fetchContacts();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, open]);

	const handleClose = () => {
		onClose();
		setSelectedContact(null);
		setSelectedWhatsappId("");
		setBody("");
		setScheduledFor("");
		setSearchParam("");
		setContactOptions([]);
	};

	const handleSelectContact = (contact) => {
		setSelectedContact(contact);
		setContactPopoverOpen(false);
	};

	const handleSave = async (e) => {
		e.preventDefault();
		if (!selectedContact) {
			toast.error("Selecione um contato.");
			return;
		}
		if (!selectedWhatsappId) {
			toast.error("Selecione uma conexão.");
			return;
		}
		if (!body.trim()) {
			toast.error("Digite a mensagem.");
			return;
		}
		if (!scheduledFor) {
			toast.error("Selecione a data e hora.");
			return;
		}

		const payload = {
			contactId: selectedContact.id,
			whatsappId: +selectedWhatsappId,
			body,
			scheduledFor: new Date(scheduledFor).toISOString(),
		};

		setSaving(true);
		try {
			let data;
			if (scheduledMessageId) {
				({ data } = await api.put(
					`/scheduled-messages/${scheduledMessageId}`,
					payload
				));
			} else {
				({ data } = await api.post("/scheduled-messages", payload));
			}
			if (onSaved) {
				onSaved({ ...data, contact: data.contact || selectedContact });
			}
			toast.success("Mensagem agendada com sucesso!");
			handleClose();
		} catch (err) {
			toastError(err);
		}
		setSaving(false);
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{scheduledMessageId ? "Editar agendamento" : "Agendar mensagem"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSave} className="space-y-4">
					<div className="space-y-1.5">
						<Label>Contato</Label>
						<Popover
							open={contactPopoverOpen}
							onOpenChange={(o) => {
								setContactPopoverOpen(o);
								if (o) setTimeout(() => searchInputRef.current?.focus(), 0);
							}}
						>
							<PopoverTrigger asChild>
								<button
									type="button"
									className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
								>
									<UserIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
									<span
										className={cn(
											"flex-1 truncate text-left",
											!selectedContact && "text-muted-foreground"
										)}
									>
										{selectedContact
											? selectedContact.name
											: "Buscar contato"}
									</span>
									<ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
								</button>
							</PopoverTrigger>
							<PopoverContent
								className="w-[--radix-popover-trigger-width] p-1"
								align="start"
							>
								<Input
									ref={searchInputRef}
									placeholder="Digite para buscar"
									value={searchParam}
									onChange={(e) => setSearchParam(e.target.value)}
									className="mb-1"
								/>
								<div className="max-h-52 overflow-y-auto">
									{searching && (
										<div className="flex items-center justify-center py-3">
											<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
										</div>
									)}
									{!searching &&
										searchParam.length >= 2 &&
										contactOptions.length === 0 && (
											<p className="px-2 py-1.5 text-sm text-muted-foreground">
												Nenhum contato encontrado
											</p>
										)}
									{!searching &&
										contactOptions.map((contact) => (
											<button
												type="button"
												key={contact.id}
												onClick={() => handleSelectContact(contact)}
												className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
											>
												<Check
													className={cn(
														"h-3.5 w-3.5 shrink-0",
														selectedContact?.id === contact.id
															? "opacity-100"
															: "opacity-0"
													)}
												/>
												<span className="flex-1 truncate">{contact.name}</span>
												<span className="text-xs text-muted-foreground">
													{contact.number}
												</span>
											</button>
										))}
								</div>
							</PopoverContent>
						</Popover>
					</div>

					<div className="space-y-1.5">
						<Label>Conexão</Label>
						<Select
							value={selectedWhatsappId || undefined}
							onValueChange={(v) => setSelectedWhatsappId(v)}
						>
							<SelectTrigger>
								<SelectValue
									placeholder={
										loadingWhatsapps ? "Carregando..." : "Selecione a conexão"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{whatsApps.map((whatsapp) => (
									<SelectItem key={whatsapp.id} value={String(whatsapp.id)}>
										{whatsapp.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="body">Mensagem</Label>
						<Textarea
							id="body"
							rows={4}
							value={body}
							onChange={(e) => setBody(e.target.value)}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="scheduledFor">Data e hora</Label>
						<Input
							id="scheduledFor"
							type="datetime-local"
							value={scheduledFor}
							onChange={(e) => setScheduledFor(e.target.value)}
						/>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={saving}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={saving}>
							{saving && <Loader2 className="h-4 w-4 animate-spin" />}
							Salvar
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ScheduledMessageModal;
