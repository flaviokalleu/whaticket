import React, { useState, useEffect, useContext, useRef } from "react";
import { useHistory } from "react-router-dom";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { cn } from "../../lib/utils";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useQueues from "../../hooks/useQueues";
import useWhatsApps from "../../hooks/useWhatsApps";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";

const TransferTicketModal = ({ modalOpen, onClose, ticketid, ticketWhatsappId }) => {
	const history = useHistory();
	const [userPopoverOpen, setUserPopoverOpen] = useState(false);
	const [options, setOptions] = useState([]);
	const [queues, setQueues] = useState([]);
	const [allQueues, setAllQueues] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searching, setSearching] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [selectedUser, setSelectedUser] = useState(null);
	const [selectedQueue, setSelectedQueue] = useState("");
	const [selectedWhatsapp, setSelectedWhatsapp] = useState(ticketWhatsappId);
	const { findAll: findAllQueues } = useQueues();
	const { loadingWhatsapps, whatsApps } = useWhatsApps();
	const searchInputRef = useRef(null);

	const { user: loggedInUser } = useContext(AuthContext);

	useEffect(() => {
		const loadQueues = async () => {
			const list = await findAllQueues();
			setAllQueues(list);
			setQueues(list);
		};
		loadQueues();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!modalOpen || searchParam.length < 3) {
			setSearching(false);
			return;
		}
		setSearching(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchUsers = async () => {
				try {
					const { data } = await api.get("/users/", {
						params: { searchParam },
					});
					setOptions(data.users);
					setSearching(false);
				} catch (err) {
					setSearching(false);
					toastError(err);
				}
			};

			fetchUsers();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, modalOpen]);

	const handleClose = () => {
		onClose();
		setSearchParam("");
		setSelectedUser(null);
	};

	const handleSelectUser = (user) => {
		setSelectedUser(user);
		setUserPopoverOpen(false);
		if (user != null && Array.isArray(user.queues)) {
			setQueues(user.queues);
		} else {
			setQueues(allQueues);
			setSelectedQueue("");
		}
	};

	const handleSaveTicket = async (e) => {
		e.preventDefault();
		if (!ticketid) return;
		setLoading(true);
		try {
			let data = {};

			if (selectedUser) {
				data.userId = selectedUser.id;
			}

			if (selectedQueue && selectedQueue !== null) {
				data.queueId = selectedQueue;

				if (!selectedUser) {
					data.status = "pending";
					data.userId = null;
				}
			}

			if (selectedWhatsapp) {
				data.whatsappId = selectedWhatsapp;
			}

			await api.put(`/tickets/${ticketid}`, data);

			setLoading(false);
			history.push(`/tickets`);
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	};

	return (
		<Dialog open={modalOpen} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{i18n.t("transferTicketModal.title")}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSaveTicket} className="space-y-4">
					<div className="space-y-1.5">
						<Label>{i18n.t("transferTicketModal.fieldLabel")}</Label>
						<Popover
							open={userPopoverOpen}
							onOpenChange={(o) => {
								setUserPopoverOpen(o);
								if (o) setTimeout(() => searchInputRef.current?.focus(), 0);
							}}
						>
							<PopoverTrigger asChild>
								<button
									type="button"
									className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
								>
									<UserIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
									<span className={cn("flex-1 truncate text-left", !selectedUser && "text-muted-foreground")}>
										{selectedUser ? selectedUser.name : i18n.t("transferTicketModal.fieldLabel")}
									</span>
									<ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
								</button>
							</PopoverTrigger>
							<PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
								<Input
									ref={searchInputRef}
									placeholder={i18n.t("transferTicketModal.fieldLabel")}
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
									{!searching && searchParam.length >= 3 && options.length === 0 && (
										<p className="px-2 py-1.5 text-sm text-muted-foreground">
											{i18n.t("transferTicketModal.noOptions")}
										</p>
									)}
									{!searching &&
										options.map((option) => (
											<button
												type="button"
												key={option.id}
												onClick={() => handleSelectUser(option)}
												className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
											>
												<Check
													className={cn(
														"h-3.5 w-3.5 shrink-0",
														selectedUser?.id === option.id ? "opacity-100" : "opacity-0"
													)}
												/>
												{option.name}
											</button>
										))}
								</div>
							</PopoverContent>
						</Popover>
					</div>

					<div className="space-y-1.5">
						<Label>{i18n.t("transferTicketModal.fieldQueueLabel")}</Label>
						<Select
							value={selectedQueue ? String(selectedQueue) : "none"}
							onValueChange={(v) => setSelectedQueue(v === "none" ? "" : v)}
						>
							<SelectTrigger>
								<SelectValue placeholder={i18n.t("transferTicketModal.fieldQueuePlaceholder")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">&nbsp;</SelectItem>
								{queues.map((queue) => (
									<SelectItem key={queue.id} value={String(queue.id)}>
										{queue.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Can
						role={loggedInUser.profile}
						perform="ticket-options:transferWhatsapp"
						yes={() =>
							!loadingWhatsapps && (
								<div className="space-y-1.5">
									<Label>{i18n.t("transferTicketModal.fieldConnectionLabel")}</Label>
									<Select
										value={selectedWhatsapp ? String(selectedWhatsapp) : undefined}
										onValueChange={(v) => setSelectedWhatsapp(v)}
									>
										<SelectTrigger>
											<SelectValue placeholder={i18n.t("transferTicketModal.fieldConnectionPlaceholder")} />
										</SelectTrigger>
										<SelectContent>
											{whatsApps.map((whasapp) => (
												<SelectItem key={whasapp.id} value={String(whasapp.id)}>
													{whasapp.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)
						}
					/>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
							{i18n.t("transferTicketModal.buttons.cancel")}
						</Button>
						<Button type="submit" disabled={loading}>
							{loading && <Loader2 className="h-4 w-4 animate-spin" />}
							{i18n.t("transferTicketModal.buttons.ok")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default TransferTicketModal;
