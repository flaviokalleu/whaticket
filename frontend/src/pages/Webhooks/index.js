import React, { useEffect, useReducer, useState } from "react";

import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, Plus, ScrollText, Loader2 } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "../../components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../../components/ui/dialog";
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
import WebhookModal from "../../components/WebhookModal";
import ConfirmationModal from "../../components/ConfirmationModal";

const reducer = (state, action) => {
	if (action.type === "LOAD_WEBHOOKS") {
		return [...action.payload];
	}

	if (action.type === "UPDATE_WEBHOOKS") {
		const webhook = action.payload;
		const webhookIndex = state.findIndex((w) => w.id === webhook.id);

		if (webhookIndex !== -1) {
			state[webhookIndex] = webhook;
			return [...state];
		} else {
			return [webhook, ...state];
		}
	}

	if (action.type === "DELETE_WEBHOOK") {
		const webhookId = action.payload;
		const webhookIndex = state.findIndex((w) => w.id === webhookId);
		if (webhookIndex !== -1) {
			state.splice(webhookIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const Webhooks = () => {
	const [webhooks, dispatch] = useReducer(reducer, []);
	const [loading, setLoading] = useState(false);

	const [webhookModalOpen, setWebhookModalOpen] = useState(false);
	const [selectedWebhook, setSelectedWebhook] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);

	const [logsModalOpen, setLogsModalOpen] = useState(false);
	const [logsWebhook, setLogsWebhook] = useState(null);
	const [logs, setLogs] = useState([]);
	const [logsLoading, setLogsLoading] = useState(false);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const { data } = await api.get("/webhooks");
				dispatch({ type: "LOAD_WEBHOOKS", payload: data });
				setLoading(false);
			} catch (err) {
				toastError(err);
				setLoading(false);
			}
		})();
	}, []);

	const handleOpenWebhookModal = () => {
		setWebhookModalOpen(true);
		setSelectedWebhook(null);
	};

	const handleCloseWebhookModal = () => {
		setWebhookModalOpen(false);
		setSelectedWebhook(null);
	};

	const handleEditWebhook = (webhook) => {
		setSelectedWebhook(webhook);
		setWebhookModalOpen(true);
	};

	const handleWebhookSaved = (webhook) => {
		dispatch({ type: "UPDATE_WEBHOOKS", payload: webhook });
	};

	const handleCloseConfirmationModal = () => {
		setConfirmModalOpen(false);
		setSelectedWebhook(null);
	};

	const handleDeleteWebhook = async (webhookId) => {
		try {
			await api.delete(`/webhooks/${webhookId}`);
			dispatch({ type: "DELETE_WEBHOOK", payload: webhookId });
			toast.success("Webhook excluído com sucesso!");
		} catch (err) {
			toastError(err);
		}
		setSelectedWebhook(null);
	};

	const handleToggleActive = async (webhook) => {
		try {
			const { data } = await api.put(`/webhooks/${webhook.id}`, {
				name: webhook.name,
				url: webhook.url,
				events: webhook.events,
				secret: webhook.secret,
				isActive: !webhook.isActive,
			});
			dispatch({ type: "UPDATE_WEBHOOKS", payload: data });
		} catch (err) {
			toastError(err);
		}
	};

	const handleOpenLogs = async (webhook) => {
		setLogsWebhook(webhook);
		setLogsModalOpen(true);
		setLogsLoading(true);
		setLogs([]);
		try {
			const { data } = await api.get(`/webhooks/${webhook.id}/logs`);
			setLogs(data.logs || []);
		} catch (err) {
			toastError(err);
		}
		setLogsLoading(false);
	};

	const handleCloseLogs = () => {
		setLogsModalOpen(false);
		setLogsWebhook(null);
		setLogs([]);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={
					selectedWebhook && `Excluir webhook ${selectedWebhook.name}?`
				}
				open={confirmModalOpen}
				onClose={handleCloseConfirmationModal}
				onConfirm={() => handleDeleteWebhook(selectedWebhook.id)}
			>
				Esta ação não pode ser revertida.
			</ConfirmationModal>
			<WebhookModal
				open={webhookModalOpen}
				onClose={handleCloseWebhookModal}
				webhookId={selectedWebhook?.id}
				onSaved={handleWebhookSaved}
			/>
			<Dialog open={logsModalOpen} onOpenChange={(o) => !o && handleCloseLogs()}>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{logsWebhook ? `Logs de ${logsWebhook.name}` : "Logs"}
						</DialogTitle>
					</DialogHeader>
					{logsLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
						</div>
					) : (
						<div className="max-h-96 overflow-auto rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Evento</TableHead>
										<TableHead className="text-center">Status</TableHead>
										<TableHead className="text-center">Sucesso</TableHead>
										<TableHead>Data</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{logs.length === 0 && (
										<TableRow>
											<TableCell
												colSpan={4}
												className="py-6 text-center text-muted-foreground"
											>
												Nenhum log encontrado
											</TableCell>
										</TableRow>
									)}
									{logs.map((log) => (
										<TableRow key={log.id}>
											<TableCell className="font-medium">{log.event}</TableCell>
											<TableCell className="text-center">
												{log.statusCode || "-"}
											</TableCell>
											<TableCell className="text-center">
												<Badge
													variant={log.success ? "secondary" : "destructive"}
												>
													{log.success ? "Sim" : "Não"}
												</Badge>
											</TableCell>
											<TableCell>
												{log.createdAt
													? format(parseISO(log.createdAt), "dd/MM/yyyy HH:mm")
													: "-"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</DialogContent>
			</Dialog>
			<MainHeader>
				<Title>Webhooks</Title>
				<MainHeaderButtonsWrapper>
					<Button onClick={handleOpenWebhookModal}>
						<Plus className="h-4 w-4" />
						Adicionar webhook
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-auto px-6 pb-6">
				<div className="rounded-xl border bg-card">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-card">
							<TableRow>
								<TableHead>Nome</TableHead>
								<TableHead>URL</TableHead>
								<TableHead>Eventos</TableHead>
								<TableHead className="text-center">Ativo</TableHead>
								<TableHead className="text-center">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{webhooks.map((webhook) => (
								<TableRow key={webhook.id}>
									<TableCell className="font-medium">{webhook.name}</TableCell>
									<TableCell className="max-w-xs truncate">
										{webhook.url}
									</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{(webhook.events || []).map((event) => (
												<Badge key={event} variant="secondary">
													{event}
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell className="text-center">
										<Switch
											checked={webhook.isActive}
											onCheckedChange={() => handleToggleActive(webhook)}
										/>
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
															onClick={() => handleOpenLogs(webhook)}
														>
															<ScrollText className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>Logs</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8"
															onClick={() => handleEditWebhook(webhook)}
														>
															<Pencil className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>Editar</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-destructive hover:text-destructive"
															onClick={() => {
																setSelectedWebhook(webhook);
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

export default Webhooks;
