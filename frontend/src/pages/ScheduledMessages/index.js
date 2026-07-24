import React, { useEffect, useReducer, useState } from "react";

import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, Plus, Ban } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "../../components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../../components/ui/tooltip";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ScheduledMessageModal from "../../components/ScheduledMessageModal";
import ConfirmationModal from "../../components/ConfirmationModal";

const reducer = (state, action) => {
	if (action.type === "LOAD_SCHEDULED_MESSAGES") {
		return [...action.payload];
	}

	if (action.type === "UPDATE_SCHEDULED_MESSAGES") {
		const scheduledMessage = action.payload;
		const index = state.findIndex((s) => s.id === scheduledMessage.id);

		if (index !== -1) {
			state[index] = { ...state[index], ...scheduledMessage };
			return [...state];
		} else {
			return [scheduledMessage, ...state];
		}
	}

	if (action.type === "DELETE_SCHEDULED_MESSAGE") {
		const id = action.payload;
		const index = state.findIndex((s) => s.id === id);
		if (index !== -1) {
			state.splice(index, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const truncate = (text, length = 60) => {
	if (!text) return "";
	return text.length > length ? `${text.slice(0, length)}...` : text;
};

const statusBadge = (status) => {
	if (status === "pending") {
		return <Badge variant="default">Pendente</Badge>;
	}
	if (status === "sent") {
		return (
			<Badge variant="secondary" className="bg-green-100 text-green-800">
				Enviada
			</Badge>
		);
	}
	if (status === "cancelled") {
		return <Badge variant="outline">Cancelada</Badge>;
	}
	if (status === "failed") {
		return <Badge variant="destructive">Falhou</Badge>;
	}
	return <Badge variant="outline">{status}</Badge>;
};

const ScheduledMessages = () => {
	const [scheduledMessages, dispatch] = useReducer(reducer, []);
	const [loading, setLoading] = useState(false);

	const [modalOpen, setModalOpen] = useState(false);
	const [selectedMessage, setSelectedMessage] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const { data } = await api.get("/scheduled-messages");
				dispatch({ type: "LOAD_SCHEDULED_MESSAGES", payload: data });
				setLoading(false);
			} catch (err) {
				toastError(err);
				setLoading(false);
			}
		})();
	}, []);

	const handleOpenModal = () => {
		setModalOpen(true);
		setSelectedMessage(null);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setSelectedMessage(null);
	};

	const handleEditMessage = (scheduledMessage) => {
		setSelectedMessage(scheduledMessage);
		setModalOpen(true);
	};

	const handleMessageSaved = (scheduledMessage) => {
		dispatch({ type: "UPDATE_SCHEDULED_MESSAGES", payload: scheduledMessage });
	};

	const handleCloseConfirmationModal = () => {
		setConfirmModalOpen(false);
		setSelectedMessage(null);
	};

	const handleDeleteMessage = async (id) => {
		try {
			await api.delete(`/scheduled-messages/${id}`);
			dispatch({ type: "DELETE_SCHEDULED_MESSAGE", payload: id });
			toast.success("Agendamento excluído com sucesso!");
		} catch (err) {
			toastError(err);
		}
		setSelectedMessage(null);
	};

	const handleCancelMessage = async (scheduledMessage) => {
		try {
			const { data } = await api.post(
				`/scheduled-messages/${scheduledMessage.id}/cancel`
			);
			dispatch({ type: "UPDATE_SCHEDULED_MESSAGES", payload: data });
			toast.success("Agendamento cancelado com sucesso!");
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={selectedMessage && "Excluir mensagem agendada?"}
				open={confirmModalOpen}
				onClose={handleCloseConfirmationModal}
				onConfirm={() => handleDeleteMessage(selectedMessage.id)}
			>
				Esta ação não pode ser revertida.
			</ConfirmationModal>
			<ScheduledMessageModal
				open={modalOpen}
				onClose={handleCloseModal}
				scheduledMessageId={selectedMessage?.id}
				onSaved={handleMessageSaved}
			/>
			<MainHeader>
				<Title>Mensagens agendadas</Title>
				<MainHeaderButtonsWrapper>
					<Button onClick={handleOpenModal}>
						<Plus className="h-4 w-4" />
						Agendar mensagem
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-auto px-6 pb-6">
				<div className="rounded-xl border bg-card">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-card">
							<TableRow>
								<TableHead>Contato</TableHead>
								<TableHead>Mensagem</TableHead>
								<TableHead>Agendada para</TableHead>
								<TableHead className="text-center">Status</TableHead>
								<TableHead className="text-center">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{scheduledMessages.map((scheduledMessage) => (
								<TableRow key={scheduledMessage.id}>
									<TableCell className="font-medium">
										{scheduledMessage.contact?.name || "-"}
									</TableCell>
									<TableCell className="max-w-xs truncate text-muted-foreground">
										{truncate(scheduledMessage.body)}
									</TableCell>
									<TableCell>
										{scheduledMessage.scheduledFor
											? format(
													parseISO(scheduledMessage.scheduledFor),
													"dd/MM/yyyy HH:mm"
											  )
											: "-"}
									</TableCell>
									<TableCell className="text-center">
										{statusBadge(scheduledMessage.status)}
									</TableCell>
									<TableCell>
										<TooltipProvider>
											<div className="flex items-center justify-center gap-1">
												{scheduledMessage.status === "pending" && (
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8"
																onClick={() =>
																	handleEditMessage(scheduledMessage)
																}
															>
																<Pencil className="h-4 w-4" />
															</Button>
														</TooltipTrigger>
														<TooltipContent>Editar</TooltipContent>
													</Tooltip>
												)}
												{scheduledMessage.status === "pending" && (
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8"
																onClick={() =>
																	handleCancelMessage(scheduledMessage)
																}
															>
																<Ban className="h-4 w-4" />
															</Button>
														</TooltipTrigger>
														<TooltipContent>Cancelar</TooltipContent>
													</Tooltip>
												)}
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-destructive hover:text-destructive"
															onClick={() => {
																setSelectedMessage(scheduledMessage);
																setConfirmModalOpen(true);
															}}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>Excluir</TooltipContent>
												</Tooltip>
											</div>
										</TooltipProvider>
									</TableCell>
								</TableRow>
							))}
							{loading && <TableRowSkeleton columns={5} />}
						</TableBody>
					</Table>
				</div>
			</div>
		</MainContainer>
	);
};

export default ScheduledMessages;
