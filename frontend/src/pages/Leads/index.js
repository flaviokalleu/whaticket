import React, { useEffect, useState, useCallback } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import openSocket from "../../services/socket-io";
import { toast } from "react-toastify";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent } from "../../components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../../components/ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "../../components/ui/sheet";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "../../components/ui/tabs";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "../../components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ConfirmationModal from "../../components/ConfirmationModal";
import { cn } from "../../lib/utils";

const STATUS_OPTIONS = [
	{ value: "new", label: "Novo" },
	{ value: "contacted", label: "Contatado" },
	{ value: "qualified", label: "Qualificado" },
	{ value: "won", label: "Convertido" },
	{ value: "lost", label: "Perdido" },
];

const STATUS_CLASSES = {
	new: "bg-blue-100 text-blue-700",
	contacted: "bg-yellow-100 text-yellow-700",
	qualified: "bg-purple-100 text-purple-700",
	won: "bg-green-100 text-green-700",
	lost: "bg-red-100 text-red-700",
};

const INTERACTION_TYPES = [
	{ value: "call", label: "Ligação" },
	{ value: "whatsapp", label: "WhatsApp" },
	{ value: "email", label: "E-mail" },
	{ value: "note", label: "Nota" },
];

const statusLabel = (status) =>
	STATUS_OPTIONS.find((s) => s.value === status)?.label || status;

const LeadSchema = Yup.object().shape({
	name: Yup.string().min(2, "Muito curto!").required("Obrigatório"),
	email: Yup.string().email("E-mail inválido"),
});

const LeadModal = ({ open, onClose, lead, pipelines, onSaved }) => {
	const initialValues = {
		name: lead?.name || "",
		phone: lead?.phone || "",
		email: lead?.email || "",
		source: lead?.source || "",
		status: lead?.status || "new",
		leadPipelineId: lead?.leadPipelineId ? String(lead.leadPipelineId) : "",
	};

	const handleSave = async (values) => {
		const payload = {
			name: values.name,
			phone: values.phone || null,
			email: values.email || null,
			source: values.source || null,
			status: values.status,
		};
		if (values.leadPipelineId) {
			payload.leadPipelineId = +values.leadPipelineId;
		}
		try {
			if (lead?.id) {
				await api.put(`/crm/leads/${lead.id}`, payload);
			} else {
				await api.post("/crm/leads", payload);
			}
			toast.success("Lead salvo com sucesso.");
			onSaved();
			onClose();
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{lead?.id ? "Editar lead" : "Novo lead"}</DialogTitle>
				</DialogHeader>
				<Formik
					initialValues={initialValues}
					enableReinitialize={true}
					validationSchema={LeadSchema}
					onSubmit={(values, actions) => {
						setTimeout(async () => {
							await handleSave(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values, setFieldValue }) => (
						<Form className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="name">Nome</Label>
								<Field as={Input} id="name" name="name" autoFocus />
								{touched.name && errors.name && (
									<p className="text-xs text-destructive">{errors.name}</p>
								)}
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1.5">
									<Label htmlFor="phone">Telefone</Label>
									<Field as={Input} id="phone" name="phone" />
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="email">E-mail</Label>
									<Field as={Input} id="email" name="email" />
									{touched.email && errors.email && (
										<p className="text-xs text-destructive">{errors.email}</p>
									)}
								</div>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="source">Origem</Label>
								<Field
									as={Input}
									id="source"
									name="source"
									placeholder="Ex.: site, indicação..."
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1.5">
									<Label>Status</Label>
									<Select
										value={values.status}
										onValueChange={(v) => setFieldValue("status", v)}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{STATUS_OPTIONS.map((s) => (
												<SelectItem key={s.value} value={s.value}>
													{s.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label>Funil de leads</Label>
									<Select
										value={values.leadPipelineId || undefined}
										onValueChange={(v) => setFieldValue("leadPipelineId", v)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Opcional" />
										</SelectTrigger>
										<SelectContent>
											{pipelines.map((p) => (
												<SelectItem key={p.id} value={String(p.id)}>
													{p.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={onClose}
									disabled={isSubmitting}
								>
									Cancelar
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
									{lead?.id ? "Salvar" : "Criar"}
								</Button>
							</DialogFooter>
						</Form>
					)}
				</Formik>
			</DialogContent>
		</Dialog>
	);
};

const LeadDetailSheet = ({ lead, open, onClose }) => {
	const [interactions, setInteractions] = useState([]);
	const [tasks, setTasks] = useState([]);
	const [interactionType, setInteractionType] = useState("note");
	const [interactionBody, setInteractionBody] = useState("");
	const [taskTitle, setTaskTitle] = useState("");
	const [taskDueDate, setTaskDueDate] = useState("");
	const [saving, setSaving] = useState(false);

	const fetchDetails = useCallback(async () => {
		if (!lead?.id) return;
		try {
			const [{ data: interactionsData }, { data: tasksData }] =
				await Promise.all([
					api.get(`/crm/leads/${lead.id}/interactions`),
					api.get(`/crm/leads/${lead.id}/tasks`),
				]);
			setInteractions(interactionsData || []);
			setTasks(tasksData || []);
		} catch (err) {
			toastError(err);
		}
	}, [lead]);

	useEffect(() => {
		if (open) {
			setInteractions([]);
			setTasks([]);
			setInteractionBody("");
			setTaskTitle("");
			setTaskDueDate("");
			fetchDetails();
		}
	}, [open, fetchDetails]);

	const handleAddInteraction = async () => {
		if (!interactionBody.trim()) return;
		setSaving(true);
		try {
			await api.post(`/crm/leads/${lead.id}/interactions`, {
				type: interactionType,
				body: interactionBody,
			});
			setInteractionBody("");
			toast.success("Interação registrada.");
			fetchDetails();
		} catch (err) {
			toastError(err);
		}
		setSaving(false);
	};

	const handleAddTask = async () => {
		if (!taskTitle.trim()) return;
		setSaving(true);
		try {
			await api.post(`/crm/leads/${lead.id}/tasks`, {
				title: taskTitle,
				dueDate: taskDueDate || null,
			});
			setTaskTitle("");
			setTaskDueDate("");
			toast.success("Tarefa criada.");
			fetchDetails();
		} catch (err) {
			toastError(err);
		}
		setSaving(false);
	};

	const handleToggleTask = async (task) => {
		try {
			if (task.isCompleted) {
				await api.put(`/crm/leads/${lead.id}/tasks/${task.id}`, {
					isCompleted: false,
				});
			} else {
				await api.post(`/crm/leads/${lead.id}/tasks/${task.id}/complete`);
			}
			fetchDetails();
		} catch (err) {
			toastError(err);
		}
	};

	const interactionTypeLabel = (type) =>
		INTERACTION_TYPES.find((t) => t.value === type)?.label || type;

	return (
		<Sheet open={open} onOpenChange={(o) => !o && onClose()}>
			<SheetContent
				side="right"
				className="w-full overflow-y-auto sm:max-w-lg"
			>
				<SheetHeader>
					<SheetTitle>{lead?.name}</SheetTitle>
					<SheetDescription>
						{[lead?.phone, lead?.email].filter(Boolean).join(" · ") ||
							"Sem contato cadastrado"}
					</SheetDescription>
				</SheetHeader>
				<div className="mt-4">
					<Tabs defaultValue="interactions">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="interactions">Interações</TabsTrigger>
							<TabsTrigger value="tasks">Tarefas</TabsTrigger>
						</TabsList>
						<TabsContent value="interactions" className="space-y-4 pt-3">
							<div className="space-y-2 rounded-lg border p-3">
								<div className="flex gap-2">
									<Select
										value={interactionType}
										onValueChange={setInteractionType}
									>
										<SelectTrigger className="w-40">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{INTERACTION_TYPES.map((t) => (
												<SelectItem key={t.value} value={t.value}>
													{t.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<Textarea
									rows={2}
									placeholder="Descreva a interação..."
									value={interactionBody}
									onChange={(e) => setInteractionBody(e.target.value)}
								/>
								<div className="flex justify-end">
									<Button
										size="sm"
										onClick={handleAddInteraction}
										disabled={saving || !interactionBody.trim()}
									>
										Adicionar
									</Button>
								</div>
							</div>
							<div className="space-y-2">
								{interactions.length === 0 && (
									<p className="text-sm text-muted-foreground">
										Nenhuma interação registrada.
									</p>
								)}
								{interactions.map((interaction) => (
									<div
										key={interaction.id}
										className="rounded-lg border p-3 text-sm"
									>
										<div className="mb-1 flex items-center justify-between">
											<Badge variant="secondary">
												{interactionTypeLabel(interaction.type)}
											</Badge>
											<span className="text-xs text-muted-foreground">
												{interaction.createdAt
													? new Date(interaction.createdAt).toLocaleString(
															"pt-BR"
													  )
													: ""}
											</span>
										</div>
										<p className="whitespace-pre-wrap">{interaction.body}</p>
										{interaction.user?.name && (
											<p className="mt-1 text-xs text-muted-foreground">
												por {interaction.user.name}
											</p>
										)}
									</div>
								))}
							</div>
						</TabsContent>
						<TabsContent value="tasks" className="space-y-4 pt-3">
							<div className="space-y-2 rounded-lg border p-3">
								<Input
									placeholder="Título da tarefa"
									value={taskTitle}
									onChange={(e) => setTaskTitle(e.target.value)}
								/>
								<div className="flex gap-2">
									<Input
										type="date"
										value={taskDueDate}
										onChange={(e) => setTaskDueDate(e.target.value)}
									/>
									<Button
										size="sm"
										onClick={handleAddTask}
										disabled={saving || !taskTitle.trim()}
									>
										Adicionar
									</Button>
								</div>
							</div>
							<div className="space-y-2">
								{tasks.length === 0 && (
									<p className="text-sm text-muted-foreground">
										Nenhuma tarefa cadastrada.
									</p>
								)}
								{tasks.map((task) => (
									<div
										key={task.id}
										className="flex items-center gap-3 rounded-lg border p-3 text-sm"
									>
										<Checkbox
											checked={!!task.isCompleted}
											onCheckedChange={() => handleToggleTask(task)}
										/>
										<div className="flex-1">
											<p
												className={cn(
													task.isCompleted &&
														"text-muted-foreground line-through"
												)}
											>
												{task.title}
											</p>
											{task.dueDate && (
												<p className="text-xs text-muted-foreground">
													Vence em{" "}
													{new Date(
														`${task.dueDate}T00:00:00`
													).toLocaleDateString("pt-BR")}
												</p>
											)}
										</div>
									</div>
								))}
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</SheetContent>
		</Sheet>
	);
};

const Leads = () => {
	const [leads, setLeads] = useState([]);
	const [loading, setLoading] = useState(false);
	const [stats, setStats] = useState({ total: 0, byStatus: {} });
	const [pipelines, setPipelines] = useState([]);

	const [selectedIds, setSelectedIds] = useState([]);
	const [bulkStatus, setBulkStatus] = useState("");
	const [bulkLoading, setBulkLoading] = useState(false);

	const [leadModalOpen, setLeadModalOpen] = useState(false);
	const [selectedLead, setSelectedLead] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [sheetLead, setSheetLead] = useState(null);
	const [sheetOpen, setSheetOpen] = useState(false);

	const fetchLeads = useCallback(async () => {
		try {
			const { data } = await api.get("/crm/leads");
			setLeads(data || []);
		} catch (err) {
			toastError(err);
		}
	}, []);

	const fetchStats = useCallback(async () => {
		try {
			const { data } = await api.get("/crm/leads/stats");
			setStats(data || { total: 0, byStatus: {} });
		} catch (err) {
			toastError(err);
		}
	}, []);

	useEffect(() => {
		(async () => {
			setLoading(true);
			await Promise.all([fetchLeads(), fetchStats()]);
			try {
				const { data } = await api.get("/crm/lead-pipelines");
				setPipelines(data || []);
			} catch (err) {
				toastError(err);
			}
			setLoading(false);
		})();
	}, [fetchLeads, fetchStats]);

	useEffect(() => {
		const socket = openSocket();

		socket.on("lead", (data) => {
			if (
				["update", "delete", "bulk-update-status"].includes(data.action)
			) {
				fetchLeads();
				fetchStats();
			}
			if (data.action === "update-pipeline") {
				setPipelines((prev) => {
					const index = prev.findIndex(
						(p) => p.id === data.leadPipeline.id
					);
					if (index !== -1) {
						const next = [...prev];
						next[index] = data.leadPipeline;
						return next;
					}
					return [...prev, data.leadPipeline];
				});
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [fetchLeads, fetchStats]);

	const handleChangeStatus = async (lead, status) => {
		try {
			await api.put(`/crm/leads/${lead.id}`, { status });
			toast.success("Status atualizado.");
		} catch (err) {
			toastError(err);
		}
	};

	const handleBulkUpdate = async () => {
		if (!bulkStatus || selectedIds.length === 0) return;
		setBulkLoading(true);
		try {
			await api.post("/crm/leads/bulk-update-status", {
				leadIds: selectedIds,
				status: bulkStatus,
			});
			toast.success("Leads atualizados com sucesso.");
			setSelectedIds([]);
			setBulkStatus("");
		} catch (err) {
			toastError(err);
		}
		setBulkLoading(false);
	};

	const handleDeleteLead = async (leadId) => {
		try {
			await api.delete(`/crm/leads/${leadId}`);
			toast.success("Lead excluído com sucesso.");
		} catch (err) {
			toastError(err);
		}
		setSelectedLead(null);
	};

	const toggleSelect = (leadId) => {
		setSelectedIds((prev) =>
			prev.includes(leadId)
				? prev.filter((id) => id !== leadId)
				: [...prev, leadId]
		);
	};

	const allSelected =
		leads.length > 0 && selectedIds.length === leads.length;

	const toggleSelectAll = () => {
		setSelectedIds(allSelected ? [] : leads.map((l) => l.id));
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={selectedLead && `Excluir lead ${selectedLead.name}?`}
				open={confirmModalOpen}
				onClose={() => {
					setConfirmModalOpen(false);
					setSelectedLead(null);
				}}
				onConfirm={() => handleDeleteLead(selectedLead.id)}
			>
				Esta ação não pode ser revertida. Deseja continuar?
			</ConfirmationModal>
			<LeadModal
				open={leadModalOpen}
				onClose={() => {
					setLeadModalOpen(false);
					setSelectedLead(null);
				}}
				lead={selectedLead}
				pipelines={pipelines}
				onSaved={() => {
					fetchLeads();
					fetchStats();
				}}
			/>
			<LeadDetailSheet
				lead={sheetLead}
				open={sheetOpen}
				onClose={() => setSheetOpen(false)}
			/>
			<MainHeader>
				<Title>Leads</Title>
				<MainHeaderButtonsWrapper>
					<Button
						onClick={() => {
							setSelectedLead(null);
							setLeadModalOpen(true);
						}}
					>
						<Plus className="h-4 w-4" />
						Novo lead
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-auto px-6 pb-6">
				<div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
					<Card>
						<CardContent className="p-4">
							<p className="text-xs text-muted-foreground">Total</p>
							<p className="text-2xl font-semibold">{stats.total}</p>
						</CardContent>
					</Card>
					{STATUS_OPTIONS.map((s) => (
						<Card key={s.value}>
							<CardContent className="p-4">
								<p className="text-xs text-muted-foreground">{s.label}</p>
								<p className="text-2xl font-semibold">
									{stats.byStatus?.[s.value] || 0}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				{selectedIds.length > 0 && (
					<div className="mb-3 flex items-center gap-3 rounded-lg border bg-card p-3">
						<span className="text-sm text-muted-foreground">
							{selectedIds.length} selecionado(s)
						</span>
						<Select value={bulkStatus || undefined} onValueChange={setBulkStatus}>
							<SelectTrigger className="w-44">
								<SelectValue placeholder="Novo status" />
							</SelectTrigger>
							<SelectContent>
								{STATUS_OPTIONS.map((s) => (
									<SelectItem key={s.value} value={s.value}>
										{s.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							size="sm"
							onClick={handleBulkUpdate}
							disabled={!bulkStatus || bulkLoading}
						>
							{bulkLoading && <Loader2 className="h-4 w-4 animate-spin" />}
							Atualizar status
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={() => setSelectedIds([])}
						>
							Limpar seleção
						</Button>
					</div>
				)}

				<div className="rounded-xl border bg-card">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-card">
							<TableRow>
								<TableHead className="w-10">
									<Checkbox
										checked={allSelected}
										onCheckedChange={toggleSelectAll}
									/>
								</TableHead>
								<TableHead>Nome</TableHead>
								<TableHead>Telefone</TableHead>
								<TableHead>E-mail</TableHead>
								<TableHead>Origem</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Responsável</TableHead>
								<TableHead className="text-center">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{leads.map((lead) => (
								<TableRow
									key={lead.id}
									className="cursor-pointer"
									onClick={() => {
										setSheetLead(lead);
										setSheetOpen(true);
									}}
								>
									<TableCell onClick={(e) => e.stopPropagation()}>
										<Checkbox
											checked={selectedIds.includes(lead.id)}
											onCheckedChange={() => toggleSelect(lead.id)}
										/>
									</TableCell>
									<TableCell className="font-medium">{lead.name}</TableCell>
									<TableCell>{lead.phone || "-"}</TableCell>
									<TableCell>{lead.email || "-"}</TableCell>
									<TableCell>{lead.source || "-"}</TableCell>
									<TableCell onClick={(e) => e.stopPropagation()}>
										<div className="flex items-center gap-2">
											<Badge
												className={cn(
													"border-transparent",
													STATUS_CLASSES[lead.status] ||
														"bg-slate-200 text-slate-700"
												)}
											>
												{statusLabel(lead.status)}
											</Badge>
											<Select
												value={lead.status}
												onValueChange={(v) => handleChangeStatus(lead, v)}
											>
												<SelectTrigger className="h-7 w-32 text-xs">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{STATUS_OPTIONS.map((s) => (
														<SelectItem key={s.value} value={s.value}>
															{s.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</TableCell>
									<TableCell>{lead.user?.name || "-"}</TableCell>
									<TableCell onClick={(e) => e.stopPropagation()}>
										<div className="flex items-center justify-center gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => {
													setSelectedLead(lead);
													setLeadModalOpen(true);
												}}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive hover:text-destructive"
												onClick={() => {
													setSelectedLead(lead);
													setConfirmModalOpen(true);
												}}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
							{loading && <TableRowSkeleton columns={8} />}
							{!loading && leads.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={8}
										className="py-8 text-center text-sm text-muted-foreground"
									>
										Nenhum lead encontrado.
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

export default Leads;
