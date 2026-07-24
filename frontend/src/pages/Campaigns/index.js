import React, { useEffect, useReducer, useState, useCallback } from "react";

import openSocket from "../../services/socket-io";
import { toast } from "react-toastify";
import {
	Pencil,
	Trash2,
	Plus,
	Play,
	Pause,
	XCircle,
	Copy,
} from "lucide-react";

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
import CampaignModal from "../../components/CampaignModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { cn } from "../../lib/utils";

const STATUS_LABELS = {
	draft: "Rascunho",
	scheduled: "Agendada",
	running: "Em andamento",
	paused: "Pausada",
	completed: "Concluída",
	cancelled: "Cancelada",
};

const STATUS_CLASSES = {
	draft: "bg-slate-200 text-slate-700 hover:bg-slate-200",
	scheduled: "bg-blue-100 text-blue-700 hover:bg-blue-100",
	running: "bg-green-100 text-green-700 hover:bg-green-100",
	paused: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
	completed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
	cancelled: "bg-red-100 text-red-700 hover:bg-red-100",
};

const reducer = (state, action) => {
	if (action.type === "LOAD_CAMPAIGNS") {
		const campaigns = action.payload;
		const newCampaigns = [];

		campaigns.forEach((campaign) => {
			const index = state.findIndex((c) => c.id === campaign.id);
			if (index !== -1) {
				state[index] = campaign;
			} else {
				newCampaigns.push(campaign);
			}
		});

		return [...state, ...newCampaigns];
	}

	if (action.type === "UPDATE_CAMPAIGNS") {
		const campaign = action.payload;
		const index = state.findIndex((c) => c.id === campaign.id);

		if (index !== -1) {
			state[index] = { ...state[index], ...campaign };
			return [...state];
		} else {
			return [campaign, ...state];
		}
	}

	if (action.type === "DELETE_CAMPAIGN") {
		const campaignId = action.payload;
		const index = state.findIndex((c) => c.id === campaignId);
		if (index !== -1) {
			state.splice(index, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const CampaignStatusBadge = ({ status }) => (
	<Badge
		className={cn(
			"border-transparent",
			STATUS_CLASSES[status] || STATUS_CLASSES.draft
		)}
	>
		{STATUS_LABELS[status] || status}
	</Badge>
);

const Campaigns = () => {
	const [campaigns, dispatch] = useReducer(reducer, []);
	const [loading, setLoading] = useState(false);
	const [statsMap, setStatsMap] = useState({});

	const [campaignModalOpen, setCampaignModalOpen] = useState(false);
	const [selectedCampaign, setSelectedCampaign] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);

	const fetchStats = useCallback(async (campaignId) => {
		try {
			const { data } = await api.get(`/campaigns/${campaignId}/stats`);
			setStatsMap((prev) => ({ ...prev, [campaignId]: data }));
		} catch (err) {
			// silencioso: stats são informativas
		}
	}, []);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const { data } = await api.get("/campaigns");
				dispatch({ type: "LOAD_CAMPAIGNS", payload: data });
				setLoading(false);
				data.forEach((campaign) => fetchStats(campaign.id));
			} catch (err) {
				toastError(err);
				setLoading(false);
			}
		})();
	}, [fetchStats]);

	useEffect(() => {
		const socket = openSocket();

		socket.on("campaign", (data) => {
			if (data.action === "update" || data.action === "create") {
				dispatch({ type: "UPDATE_CAMPAIGNS", payload: data.campaign });
				fetchStats(data.campaign.id);
			}

			if (data.action === "delete") {
				dispatch({ type: "DELETE_CAMPAIGN", payload: data.campaignId });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [fetchStats]);

	const handleOpenCampaignModal = () => {
		setSelectedCampaign(null);
		setCampaignModalOpen(true);
	};

	const handleCloseCampaignModal = () => {
		setCampaignModalOpen(false);
		setSelectedCampaign(null);
	};

	const handleEditCampaign = (campaign) => {
		setSelectedCampaign(campaign);
		setCampaignModalOpen(true);
	};

	const handleDeleteCampaign = async (campaignId) => {
		try {
			await api.delete(`/campaigns/${campaignId}`);
			toast.success("Campanha excluída com sucesso.");
		} catch (err) {
			toastError(err);
		}
		setSelectedCampaign(null);
	};

	const handleAction = async (campaignId, action, successMessage) => {
		try {
			await api.post(`/campaigns/${campaignId}/${action}`);
			toast.success(successMessage);
		} catch (err) {
			toastError(err);
		}
	};

	const renderStats = (campaignId) => {
		const stats = statsMap[campaignId];
		if (!stats) {
			return <span className="text-xs text-muted-foreground">-</span>;
		}
		return (
			<span className="text-xs text-muted-foreground">
				{stats.sent} enviados / {stats.pending} pendentes / {stats.failed}{" "}
				falhas
			</span>
		);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={
					selectedCampaign &&
					`Excluir campanha ${selectedCampaign.name}?`
				}
				open={confirmModalOpen}
				onClose={() => {
					setConfirmModalOpen(false);
					setSelectedCampaign(null);
				}}
				onConfirm={() => handleDeleteCampaign(selectedCampaign.id)}
			>
				Esta ação não pode ser revertida. Deseja continuar?
			</ConfirmationModal>
			<CampaignModal
				open={campaignModalOpen}
				onClose={handleCloseCampaignModal}
				campaignId={selectedCampaign?.id}
			/>
			<MainHeader>
				<Title>Campanhas</Title>
				<MainHeaderButtonsWrapper>
					<Button onClick={handleOpenCampaignModal}>
						<Plus className="h-4 w-4" />
						Nova campanha
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-auto px-6 pb-6">
				<div className="rounded-xl border bg-card">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-card">
							<TableRow>
								<TableHead>Nome</TableHead>
								<TableHead>Conexão</TableHead>
								<TableHead className="text-center">Status</TableHead>
								<TableHead className="text-center">Progresso</TableHead>
								<TableHead className="text-center">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{campaigns.map((campaign) => (
								<TableRow key={campaign.id}>
									<TableCell className="font-medium">{campaign.name}</TableCell>
									<TableCell>
										{campaign.whatsapp?.name || "-"}
									</TableCell>
									<TableCell className="text-center">
										<CampaignStatusBadge status={campaign.status} />
									</TableCell>
									<TableCell className="text-center">
										{renderStats(campaign.id)}
									</TableCell>
									<TableCell>
										<TooltipProvider>
											<div className="flex items-center justify-center gap-1">
												{["draft", "paused", "scheduled"].includes(
													campaign.status
												) && (
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-green-600 hover:text-green-600"
																onClick={() =>
																	handleAction(
																		campaign.id,
																		"start",
																		"Campanha iniciada."
																	)
																}
															>
																<Play className="h-4 w-4" />
															</Button>
														</TooltipTrigger>
														<TooltipContent>Iniciar</TooltipContent>
													</Tooltip>
												)}
												{campaign.status === "running" && (
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-yellow-600 hover:text-yellow-600"
																onClick={() =>
																	handleAction(
																		campaign.id,
																		"pause",
																		"Campanha pausada."
																	)
																}
															>
																<Pause className="h-4 w-4" />
															</Button>
														</TooltipTrigger>
														<TooltipContent>Pausar</TooltipContent>
													</Tooltip>
												)}
												{["scheduled", "running", "paused"].includes(
													campaign.status
												) && (
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8"
																onClick={() =>
																	handleAction(
																		campaign.id,
																		"cancel",
																		"Campanha cancelada."
																	)
																}
															>
																<XCircle className="h-4 w-4" />
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
															className="h-8 w-8"
															onClick={() =>
																handleAction(
																	campaign.id,
																	"duplicate",
																	"Campanha duplicada."
																)
															}
														>
															<Copy className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>Duplicar</TooltipContent>
												</Tooltip>
												{["draft", "scheduled", "paused"].includes(
													campaign.status
												) && (
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8"
																onClick={() => handleEditCampaign(campaign)}
															>
																<Pencil className="h-4 w-4" />
															</Button>
														</TooltipTrigger>
														<TooltipContent>Editar</TooltipContent>
													</Tooltip>
												)}
												{campaign.status !== "running" && (
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-destructive hover:text-destructive"
																onClick={() => {
																	setSelectedCampaign(campaign);
																	setConfirmModalOpen(true);
																}}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</TooltipTrigger>
														<TooltipContent>Excluir</TooltipContent>
													</Tooltip>
												)}
											</div>
										</TooltipProvider>
									</TableCell>
								</TableRow>
							))}
							{loading && <TableRowSkeleton columns={5} />}
							{!loading && campaigns.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={5}
										className="py-8 text-center text-sm text-muted-foreground"
									>
										Nenhuma campanha encontrada.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
		</MainContainer>
	);
};

export default Campaigns;
