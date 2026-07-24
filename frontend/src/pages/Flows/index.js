import React, { useEffect, useReducer, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { Plus, Pencil, Trash2, Workflow } from "lucide-react";

import openSocket from "../../services/socket-io";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../../components/ui/dialog";
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
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const reducer = (state, action) => {
	if (action.type === "LOAD_FLOWS") {
		const flows = action.payload;
		const newFlows = [];

		flows.forEach((flow) => {
			const index = state.findIndex((f) => f.id === flow.id);
			if (index !== -1) {
				state[index] = flow;
			} else {
				newFlows.push(flow);
			}
		});

		return [...state, ...newFlows];
	}

	if (action.type === "UPDATE_FLOWS") {
		const flow = action.payload;
		const index = state.findIndex((f) => f.id === flow.id);

		if (index !== -1) {
			state[index] = flow;
			return [...state];
		}
		return [flow, ...state];
	}

	if (action.type === "DELETE_FLOW") {
		const flowId = action.payload;
		const index = state.findIndex((f) => f.id === flowId);
		if (index !== -1) {
			state.splice(index, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}

	return state;
};

const defaultTriggerNode = {
	id: "trigger-1",
	type: "trigger",
	position: { x: 80, y: 120 },
	data: { triggerType: "manual" },
};

const Flows = () => {
	const history = useHistory();

	const [flows, dispatch] = useReducer(reducer, []);
	const [loading, setLoading] = useState(false);
	const [newDialogOpen, setNewDialogOpen] = useState(false);
	const [newName, setNewName] = useState("");
	const [saving, setSaving] = useState(false);
	const [deletingFlow, setDeletingFlow] = useState(null);
	const [confirmOpen, setConfirmOpen] = useState(false);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const { data } = await api.get("/flows");
				dispatch({ type: "LOAD_FLOWS", payload: data });
			} catch (err) {
				toastError(err);
			}
			setLoading(false);
		})();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on("flow", (data) => {
			if (data.action === "update") {
				dispatch({ type: "UPDATE_FLOWS", payload: data.flow });
			}
			if (data.action === "delete") {
				dispatch({ type: "DELETE_FLOW", payload: +data.flowId });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleCreateFlow = async () => {
		if (newName.trim().length < 2) {
			toast.error("Informe um nome para o fluxo.");
			return;
		}
		setSaving(true);
		try {
			const { data } = await api.post("/flows", {
				name: newName.trim(),
				nodes: [defaultTriggerNode],
				edges: [],
			});
			toast.success("Fluxo criado com sucesso.");
			setNewDialogOpen(false);
			setNewName("");
			history.push(`/flows/${data.id}/edit`);
		} catch (err) {
			toastError(err);
		}
		setSaving(false);
	};

	const handleToggleActive = async (flow) => {
		try {
			const { data } = await api.put(`/flows/${flow.id}`, {
				isActive: !flow.isActive,
			});
			dispatch({ type: "UPDATE_FLOWS", payload: data });
		} catch (err) {
			toastError(err);
		}
	};

	const handleDeleteFlow = async (flowId) => {
		try {
			await api.delete(`/flows/${flowId}`);
			toast.success("Fluxo excluído com sucesso.");
			dispatch({ type: "DELETE_FLOW", payload: flowId });
		} catch (err) {
			toastError(err);
		}
		setDeletingFlow(null);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={
					deletingFlow ? `Excluir o fluxo ${deletingFlow.name}?` : "Excluir fluxo"
				}
				open={confirmOpen}
				onClose={setConfirmOpen}
				onConfirm={() => handleDeleteFlow(deletingFlow.id)}
			>
				Esta ação não pode ser desfeita. O histórico de execuções também será
				removido.
			</ConfirmationModal>

			<Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Novo fluxo</DialogTitle>
					</DialogHeader>
					<div className="space-y-1.5">
						<Label htmlFor="flowName">Nome do fluxo</Label>
						<Input
							id="flowName"
							autoFocus
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							placeholder="Ex.: Boas-vindas automático"
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setNewDialogOpen(false)}
						>
							Cancelar
						</Button>
						<Button type="button" onClick={handleCreateFlow} disabled={saving}>
							Criar e abrir editor
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<MainHeader>
				<Title>Fluxos</Title>
				<MainHeaderButtonsWrapper>
					<Button onClick={() => setNewDialogOpen(true)}>
						<Plus className="h-4 w-4" />
						Novo fluxo
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>

			<div className="flex-1 overflow-auto px-6 pb-6">
				<div className="rounded-xl border bg-card">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-card">
							<TableRow>
								<TableHead>Nome</TableHead>
								<TableHead className="text-center">Nós</TableHead>
								<TableHead className="text-center">Ativo</TableHead>
								<TableHead>Atualizado em</TableHead>
								<TableHead className="text-center">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{flows.map((flow) => (
								<TableRow key={flow.id}>
									<TableCell className="font-medium">
										<div className="flex items-center gap-2">
											<Workflow className="h-4 w-4 text-muted-foreground" />
											{flow.name}
										</div>
									</TableCell>
									<TableCell className="text-center">
										<Badge variant="secondary">
											{(flow.nodes || []).length}
										</Badge>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex justify-center">
											<Switch
												checked={!!flow.isActive}
												onCheckedChange={() => handleToggleActive(flow)}
											/>
										</div>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{flow.updatedAt
											? format(parseISO(flow.updatedAt), "dd/MM/yyyy HH:mm")
											: "-"}
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
															onClick={() =>
																history.push(`/flows/${flow.id}/edit`)
															}
														>
															<Pencil className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>Abrir editor</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-destructive hover:text-destructive"
															onClick={() => {
																setDeletingFlow(flow);
																setConfirmOpen(true);
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
							{!loading && flows.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={5}
										className="py-10 text-center text-sm text-muted-foreground"
									>
										Nenhum fluxo criado ainda.
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

export default Flows;
