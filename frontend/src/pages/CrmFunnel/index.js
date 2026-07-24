import React, { useEffect, useState, useCallback, useRef } from "react";

import openSocket from "../../services/socket-io";
import { toast } from "react-toastify";
import {
	Plus,
	Settings2,
	MoreVertical,
	Loader2,
	ChevronDown,
	Check,
	User as UserIcon,
	Trash2,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
	DropdownMenuPortal,
} from "../../components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "../../components/ui/popover";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ConfirmationModal from "../../components/ConfirmationModal";
import { cn } from "../../lib/utils";

const formatBRL = (value) => {
	if (value === null || value === undefined || value === "") return null;
	const number = Number(value);
	if (Number.isNaN(number)) return null;
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(number);
};

const sortedStages = (pipeline) =>
	[...(pipeline?.stages || [])].sort(
		(a, b) => (a.position || 0) - (b.position || 0)
	);

const PipelineDialog = ({ open, onClose, onCreated }) => {
	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (open) setName("");
	}, [open]);

	const handleSave = async () => {
		if (!name.trim()) return;
		setSaving(true);
		try {
			const { data } = await api.post("/crm/pipelines", { name });
			toast.success("Funil criado com sucesso.");
			onCreated(data);
			onClose();
		} catch (err) {
			toastError(err);
		}
		setSaving(false);
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Novo funil</DialogTitle>
				</DialogHeader>
				<div className="space-y-1.5">
					<Label htmlFor="pipelineName">Nome</Label>
					<Input
						id="pipelineName"
						value={name}
						onChange={(e) => setName(e.target.value)}
						autoFocus
					/>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={saving}>
						Cancelar
					</Button>
					<Button onClick={handleSave} disabled={saving || !name.trim()}>
						{saving && <Loader2 className="h-4 w-4 animate-spin" />}
						Criar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const StagesDialog = ({ open, onClose, pipeline, onChanged }) => {
	const [newStageName, setNewStageName] = useState("");
	const [newStageColor, setNewStageColor] = useState("#3b82f6");
	const [saving, setSaving] = useState(false);

	const stages = sortedStages(pipeline);

	const handleAddStage = async () => {
		if (!newStageName.trim() || !pipeline) return;
		setSaving(true);
		try {
			await api.post(`/crm/pipelines/${pipeline.id}/stages`, {
				name: newStageName,
				color: newStageColor,
				position: stages.length,
			});
			setNewStageName("");
			toast.success("Etapa criada.");
			onChanged();
		} catch (err) {
			toastError(err);
		}
		setSaving(false);
	};

	const handleUpdateStage = async (stage, changes) => {
		try {
			await api.put(`/crm/pipelines/${pipeline.id}/stages/${stage.id}`, changes);
			toast.success("Etapa atualizada.");
			onChanged();
		} catch (err) {
			toastError(err);
		}
	};

	const handleDeleteStage = async (stage) => {
		try {
			await api.delete(`/crm/pipelines/${pipeline.id}/stages/${stage.id}`);
			toast.success("Etapa excluída.");
			onChanged();
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Gerenciar etapas</DialogTitle>
				</DialogHeader>
				<div className="space-y-2">
					{stages.length === 0 && (
						<p className="text-sm text-muted-foreground">
							Nenhuma etapa cadastrada.
						</p>
					)}
					{stages.map((stage) => (
						<StageRow
							key={stage.id}
							stage={stage}
							onSave={(changes) => handleUpdateStage(stage, changes)}
							onDelete={() => handleDeleteStage(stage)}
						/>
					))}
				</div>
				<div className="mt-2 flex items-end gap-2 border-t pt-4">
					<div className="flex-1 space-y-1.5">
						<Label htmlFor="newStageName">Nova etapa</Label>
						<Input
							id="newStageName"
							value={newStageName}
							onChange={(e) => setNewStageName(e.target.value)}
							placeholder="Nome da etapa"
						/>
					</div>
					<input
						type="color"
						value={newStageColor}
						onChange={(e) => setNewStageColor(e.target.value)}
						className="h-9 w-10 cursor-pointer rounded-md border bg-transparent p-1"
						title="Cor da etapa"
					/>
					<Button
						onClick={handleAddStage}
						disabled={saving || !newStageName.trim()}
					>
						<Plus className="h-4 w-4" />
						Adicionar
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

const StageRow = ({ stage, onSave, onDelete }) => {
	const [name, setName] = useState(stage.name);
	const [color, setColor] = useState(stage.color || "#3b82f6");

	useEffect(() => {
		setName(stage.name);
		setColor(stage.color || "#3b82f6");
	}, [stage]);

	const dirty = name !== stage.name || color !== (stage.color || "#3b82f6");

	return (
		<div className="flex items-center gap-2">
			<input
				type="color"
				value={color}
				onChange={(e) => setColor(e.target.value)}
				className="h-9 w-10 cursor-pointer rounded-md border bg-transparent p-1"
				title="Cor da etapa"
			/>
			<Input value={name} onChange={(e) => setName(e.target.value)} />
			<Button
				variant="outline"
				size="sm"
				disabled={!dirty || !name.trim()}
				onClick={() => onSave({ name, color })}
			>
				Salvar
			</Button>
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
				onClick={onDelete}
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
};

const ContactCombobox = ({ selectedContact, onSelect }) => {
	const [open, setOpen] = useState(false);
	const [options, setOptions] = useState([]);
	const [searchParam, setSearchParam] = useState("");
	const [searching, setSearching] = useState(false);
	const searchInputRef = useRef(null);

	useEffect(() => {
		if (!open) return;
		setSearching(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				try {
					const { data } = await api.get("/contacts/", {
						params: { searchParam },
					});
					setOptions(data.contacts || []);
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

	return (
		<Popover
			open={open}
			onOpenChange={(o) => {
				setOpen(o);
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
						{selectedContact ? selectedContact.name : "Selecionar contato"}
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
					placeholder="Buscar contato..."
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
					{!searching && options.length === 0 && (
						<p className="px-2 py-1.5 text-sm text-muted-foreground">
							Nenhum contato encontrado
						</p>
					)}
					{!searching && selectedContact && (
						<button
							type="button"
							onClick={() => {
								onSelect(null);
								setOpen(false);
							}}
							className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent"
						>
							Remover contato
						</button>
					)}
					{!searching &&
						options.map((option) => (
							<button
								type="button"
								key={option.id}
								onClick={() => {
									onSelect(option);
									setOpen(false);
								}}
								className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
							>
								<Check
									className={cn(
										"h-3.5 w-3.5 shrink-0",
										selectedContact?.id === option.id
											? "opacity-100"
											: "opacity-0"
									)}
								/>
								{option.name}
							</button>
						))}
				</div>
			</PopoverContent>
		</Popover>
	);
};

const DealModal = ({ open, onClose, deal, pipeline, onSaved }) => {
	const [title, setTitle] = useState("");
	const [value, setValue] = useState("");
	const [stageId, setStageId] = useState("");
	const [selectedContact, setSelectedContact] = useState(null);
	const [userId, setUserId] = useState("");
	const [users, setUsers] = useState([]);
	const [saving, setSaving] = useState(false);

	const stages = sortedStages(pipeline);

	useEffect(() => {
		if (!open) return;
		setTitle(deal?.title || "");
		setValue(
			deal?.value !== null && deal?.value !== undefined
				? String(deal.value)
				: ""
		);
		setStageId(
			deal?.stageId
				? String(deal.stageId)
				: stages.length > 0
				? String(stages[0].id)
				: ""
		);
		setSelectedContact(deal?.contact || null);
		setUserId(deal?.userId ? String(deal.userId) : "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, deal]);

	useEffect(() => {
		if (!open) return;
		(async () => {
			try {
				const { data } = await api.get("/users/");
				setUsers(data.users || []);
			} catch (err) {
				toastError(err);
			}
		})();
	}, [open]);

	const handleSave = async () => {
		if (!title.trim() || !stageId) return;
		setSaving(true);
		const payload = {
			title,
			value: value === "" ? null : +value,
			stageId: +stageId,
			contactId: selectedContact ? selectedContact.id : null,
			userId: userId ? +userId : null,
		};
		try {
			if (deal?.id) {
				await api.put(`/crm/deals/${deal.id}`, payload);
			} else {
				await api.post("/crm/deals", {
					...payload,
					pipelineId: pipeline.id,
				});
			}
			toast.success("Oportunidade salva com sucesso.");
			onSaved();
			onClose();
		} catch (err) {
			toastError(err);
		}
		setSaving(false);
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{deal?.id ? "Editar oportunidade" : "Nova oportunidade"}
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="dealTitle">Título</Label>
						<Input
							id="dealTitle"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							autoFocus
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label htmlFor="dealValue">Valor (R$)</Label>
							<Input
								id="dealValue"
								type="number"
								step="0.01"
								min="0"
								value={value}
								onChange={(e) => setValue(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Etapa</Label>
							<Select
								value={stageId || undefined}
								onValueChange={setStageId}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecione" />
								</SelectTrigger>
								<SelectContent>
									{stages.map((stage) => (
										<SelectItem key={stage.id} value={String(stage.id)}>
											{stage.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="space-y-1.5">
						<Label>Contato (opcional)</Label>
						<ContactCombobox
							selectedContact={selectedContact}
							onSelect={setSelectedContact}
						/>
					</div>
					<div className="space-y-1.5">
						<Label>Responsável (opcional)</Label>
						<Select
							value={userId || "none"}
							onValueChange={(v) => setUserId(v === "none" ? "" : v)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Selecione" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">Sem responsável</SelectItem>
								{users.map((user) => (
									<SelectItem key={user.id} value={String(user.id)}>
										{user.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={saving}>
						Cancelar
					</Button>
					<Button
						onClick={handleSave}
						disabled={saving || !title.trim() || !stageId}
					>
						{saving && <Loader2 className="h-4 w-4 animate-spin" />}
						{deal?.id ? "Salvar" : "Criar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const DealSheet = ({ deal, open, onClose }) => {
	const [notes, setNotes] = useState([]);
	const [newNote, setNewNote] = useState("");
	const [saving, setSaving] = useState(false);

	const fetchNotes = useCallback(async () => {
		if (!deal?.id) return;
		try {
			const { data } = await api.get(`/crm/deals/${deal.id}/notes`);
			setNotes(data || []);
		} catch (err) {
			toastError(err);
		}
	}, [deal]);

	useEffect(() => {
		if (open) {
			setNotes([]);
			setNewNote("");
			fetchNotes();
		}
	}, [open, fetchNotes]);

	const handleAddNote = async () => {
		if (!newNote.trim()) return;
		setSaving(true);
		try {
			await api.post(`/crm/deals/${deal.id}/notes`, { body: newNote });
			setNewNote("");
			toast.success("Nota adicionada.");
			fetchNotes();
		} catch (err) {
			toastError(err);
		}
		setSaving(false);
	};

	const valueBRL = formatBRL(deal?.value);

	return (
		<Sheet open={open} onOpenChange={(o) => !o && onClose()}>
			<SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>{deal?.title}</SheetTitle>
					<SheetDescription>
						{deal?.stage?.name || ""}
						{valueBRL ? ` · ${valueBRL}` : ""}
					</SheetDescription>
				</SheetHeader>
				<div className="mt-4 space-y-4">
					<div className="grid grid-cols-2 gap-3 text-sm">
						<div>
							<p className="text-xs text-muted-foreground">Contato</p>
							<p>{deal?.contact?.name || "-"}</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Responsável</p>
							<p>{deal?.user?.name || "-"}</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Status</p>
							<p>
								{deal?.status === "won"
									? "Ganho"
									: deal?.status === "lost"
									? "Perdido"
									: "Aberto"}
							</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Criado em</p>
							<p>
								{deal?.createdAt
									? new Date(deal.createdAt).toLocaleDateString("pt-BR")
									: "-"}
							</p>
						</div>
					</div>

					<div className="border-t pt-4">
						<h4 className="mb-2 text-sm font-semibold">Notas</h4>
						<div className="space-y-2 rounded-lg border p-3">
							<Textarea
								rows={2}
								placeholder="Adicionar nota..."
								value={newNote}
								onChange={(e) => setNewNote(e.target.value)}
							/>
							<div className="flex justify-end">
								<Button
									size="sm"
									onClick={handleAddNote}
									disabled={saving || !newNote.trim()}
								>
									Adicionar
								</Button>
							</div>
						</div>
						<div className="mt-3 space-y-2">
							{notes.length === 0 && (
								<p className="text-sm text-muted-foreground">
									Nenhuma nota registrada.
								</p>
							)}
							{notes.map((note) => (
								<div key={note.id} className="rounded-lg border p-3 text-sm">
									<p className="whitespace-pre-wrap">{note.body}</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{note.user?.name ? `${note.user.name} · ` : ""}
										{note.createdAt
											? new Date(note.createdAt).toLocaleString("pt-BR")
											: ""}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};

const CrmFunnel = () => {
	const [pipelines, setPipelines] = useState([]);
	const [selectedPipelineId, setSelectedPipelineId] = useState("");
	const [deals, setDeals] = useState([]);
	const [loading, setLoading] = useState(false);

	const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false);
	const [stagesDialogOpen, setStagesDialogOpen] = useState(false);
	const [dealModalOpen, setDealModalOpen] = useState(false);
	const [selectedDeal, setSelectedDeal] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [sheetDeal, setSheetDeal] = useState(null);
	const [sheetOpen, setSheetOpen] = useState(false);

	const selectedPipeline = pipelines.find(
		(p) => String(p.id) === String(selectedPipelineId)
	);

	const fetchPipelines = useCallback(async () => {
		try {
			const { data } = await api.get("/crm/pipelines");
			setPipelines(data || []);
			return data || [];
		} catch (err) {
			toastError(err);
			return [];
		}
	}, []);

	const fetchDeals = useCallback(async (pipelineId) => {
		if (!pipelineId) {
			setDeals([]);
			return;
		}
		try {
			const { data } = await api.get("/crm/deals", {
				params: { pipelineId },
			});
			setDeals(data || []);
		} catch (err) {
			toastError(err);
		}
	}, []);

	useEffect(() => {
		(async () => {
			setLoading(true);
			const list = await fetchPipelines();
			if (list.length > 0) {
				setSelectedPipelineId((prev) => prev || String(list[0].id));
			}
			setLoading(false);
		})();
	}, [fetchPipelines]);

	useEffect(() => {
		fetchDeals(selectedPipelineId);
	}, [selectedPipelineId, fetchDeals]);

	useEffect(() => {
		const socket = openSocket();

		socket.on("pipeline", () => {
			fetchPipelines();
		});

		socket.on("deal", (data) => {
			if (data.action === "update" && data.deal) {
				setDeals((prev) => {
					if (
						String(data.deal.pipelineId) !== String(selectedPipelineId)
					) {
						return prev.filter((d) => d.id !== data.deal.id);
					}
					const index = prev.findIndex((d) => d.id === data.deal.id);
					if (index !== -1) {
						const next = [...prev];
						next[index] = data.deal;
						return next;
					}
					return [data.deal, ...prev];
				});
			}
			if (data.action === "delete") {
				setDeals((prev) => prev.filter((d) => d.id !== data.dealId));
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [fetchPipelines, selectedPipelineId]);

	const handleMoveDeal = async (deal, stageId) => {
		try {
			await api.post(`/crm/deals/${deal.id}/move`, { stageId: +stageId });
			toast.success("Oportunidade movida.");
		} catch (err) {
			toastError(err);
		}
	};

	const handleSetStatus = async (deal, status) => {
		try {
			await api.put(`/crm/deals/${deal.id}`, { status });
			toast.success(
				status === "won"
					? "Oportunidade marcada como ganha."
					: status === "lost"
					? "Oportunidade marcada como perdida."
					: "Oportunidade reaberta."
			);
		} catch (err) {
			toastError(err);
		}
	};

	const handleDeleteDeal = async (dealId) => {
		try {
			await api.delete(`/crm/deals/${dealId}`);
			toast.success("Oportunidade excluída.");
		} catch (err) {
			toastError(err);
		}
		setSelectedDeal(null);
	};

	const stages = sortedStages(selectedPipeline);

	return (
		<MainContainer>
			<ConfirmationModal
				title={
					selectedDeal && `Excluir oportunidade ${selectedDeal.title}?`
				}
				open={confirmModalOpen}
				onClose={() => {
					setConfirmModalOpen(false);
					setSelectedDeal(null);
				}}
				onConfirm={() => handleDeleteDeal(selectedDeal.id)}
			>
				Esta ação não pode ser revertida. Deseja continuar?
			</ConfirmationModal>
			<PipelineDialog
				open={pipelineDialogOpen}
				onClose={() => setPipelineDialogOpen(false)}
				onCreated={(pipeline) => {
					fetchPipelines();
					setSelectedPipelineId(String(pipeline.id));
				}}
			/>
			<StagesDialog
				open={stagesDialogOpen}
				onClose={() => setStagesDialogOpen(false)}
				pipeline={selectedPipeline}
				onChanged={fetchPipelines}
			/>
			<DealModal
				open={dealModalOpen}
				onClose={() => {
					setDealModalOpen(false);
					setSelectedDeal(null);
				}}
				deal={selectedDeal}
				pipeline={selectedPipeline}
				onSaved={() => fetchDeals(selectedPipelineId)}
			/>
			<DealSheet
				deal={sheetDeal}
				open={sheetOpen}
				onClose={() => setSheetOpen(false)}
			/>
			<MainHeader>
				<Title>Funil de vendas</Title>
				<MainHeaderButtonsWrapper>
					<Select
						value={selectedPipelineId || undefined}
						onValueChange={setSelectedPipelineId}
					>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Selecione o funil" />
						</SelectTrigger>
						<SelectContent>
							{pipelines.map((pipeline) => (
								<SelectItem key={pipeline.id} value={String(pipeline.id)}>
									{pipeline.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						onClick={() => setPipelineDialogOpen(true)}
					>
						<Plus className="h-4 w-4" />
						Novo funil
					</Button>
					{selectedPipeline && (
						<Button
							variant="outline"
							onClick={() => setStagesDialogOpen(true)}
						>
							<Settings2 className="h-4 w-4" />
							Gerenciar etapas
						</Button>
					)}
					{selectedPipeline && stages.length > 0 && (
						<Button
							onClick={() => {
								setSelectedDeal(null);
								setDealModalOpen(true);
							}}
						>
							<Plus className="h-4 w-4" />
							Nova oportunidade
						</Button>
					)}
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-x-auto px-6 pb-6">
				{loading && (
					<div className="flex items-center justify-center py-10">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				)}
				{!loading && !selectedPipeline && (
					<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
						<p className="text-sm text-muted-foreground">
							Nenhum funil cadastrado. Crie um funil para começar.
						</p>
						<Button onClick={() => setPipelineDialogOpen(true)}>
							<Plus className="h-4 w-4" />
							Novo funil
						</Button>
					</div>
				)}
				{!loading && selectedPipeline && stages.length === 0 && (
					<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
						<p className="text-sm text-muted-foreground">
							Este funil ainda não possui etapas.
						</p>
						<Button onClick={() => setStagesDialogOpen(true)}>
							<Settings2 className="h-4 w-4" />
							Gerenciar etapas
						</Button>
					</div>
				)}
				{!loading && selectedPipeline && stages.length > 0 && (
					<div className="flex h-full gap-4">
						{stages.map((stage) => {
							const stageDeals = deals.filter(
								(deal) => deal.stageId === stage.id
							);
							return (
								<div
									key={stage.id}
									className="flex w-72 shrink-0 flex-col rounded-xl border bg-card"
								>
									<div className="flex items-center gap-2 border-b p-3">
										<span
											className="h-2.5 w-2.5 shrink-0 rounded-full"
											style={{
												backgroundColor: stage.color || "#94a3b8",
											}}
										/>
										<span className="flex-1 truncate text-sm font-semibold">
											{stage.name}
										</span>
										<Badge variant="secondary">{stageDeals.length}</Badge>
									</div>
									<div className="flex-1 space-y-2 overflow-y-auto p-2">
										{stageDeals.map((deal) => (
											<div
												key={deal.id}
												className={cn(
													"cursor-pointer rounded-lg border bg-background p-3 shadow-sm transition-colors hover:bg-accent/50",
													deal.status === "won" &&
														"border-green-500 bg-green-50 dark:bg-green-950/30",
													deal.status === "lost" &&
														"border-red-500 bg-red-50 dark:bg-red-950/30"
												)}
												onClick={() => {
													setSheetDeal(deal);
													setSheetOpen(true);
												}}
											>
												<div className="flex items-start justify-between gap-1">
													<p className="flex-1 text-sm font-medium">
														{deal.title}
													</p>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-6 w-6 shrink-0"
																onClick={(e) => e.stopPropagation()}
															>
																<MoreVertical className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent
															align="end"
															onClick={(e) => e.stopPropagation()}
														>
															<DropdownMenuSub>
																<DropdownMenuSubTrigger>
																	Mover para
																</DropdownMenuSubTrigger>
																<DropdownMenuPortal>
																	<DropdownMenuSubContent>
																		{stages
																			.filter((s) => s.id !== stage.id)
																			.map((s) => (
																				<DropdownMenuItem
																					key={s.id}
																					onClick={() =>
																						handleMoveDeal(deal, s.id)
																					}
																				>
																					<span
																						className="mr-2 h-2 w-2 rounded-full"
																						style={{
																							backgroundColor:
																								s.color || "#94a3b8",
																						}}
																					/>
																					{s.name}
																				</DropdownMenuItem>
																			))}
																	</DropdownMenuSubContent>
																</DropdownMenuPortal>
															</DropdownMenuSub>
															<DropdownMenuSeparator />
															{deal.status !== "won" && (
																<DropdownMenuItem
																	onClick={() =>
																		handleSetStatus(deal, "won")
																	}
																>
																	Marcar como ganho
																</DropdownMenuItem>
															)}
															{deal.status !== "lost" && (
																<DropdownMenuItem
																	onClick={() =>
																		handleSetStatus(deal, "lost")
																	}
																>
																	Marcar como perdido
																</DropdownMenuItem>
															)}
															{deal.status !== "open" && (
																<DropdownMenuItem
																	onClick={() =>
																		handleSetStatus(deal, "open")
																	}
																>
																	Reabrir
																</DropdownMenuItem>
															)}
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onClick={() => {
																	setSelectedDeal(deal);
																	setDealModalOpen(true);
																}}
															>
																Editar
															</DropdownMenuItem>
															<DropdownMenuItem
																className="text-destructive focus:text-destructive"
																onClick={() => {
																	setSelectedDeal(deal);
																	setConfirmModalOpen(true);
																}}
															>
																Excluir
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
												{formatBRL(deal.value) && (
													<p className="mt-1 text-sm font-semibold text-primary">
														{formatBRL(deal.value)}
													</p>
												)}
												{deal.contact?.name && (
													<p className="mt-1 truncate text-xs text-muted-foreground">
														{deal.contact.name}
													</p>
												)}
												{deal.status !== "open" && (
													<Badge
														className={cn(
															"mt-2 border-transparent",
															deal.status === "won"
																? "bg-green-100 text-green-700 hover:bg-green-100"
																: "bg-red-100 text-red-700 hover:bg-red-100"
														)}
													>
														{deal.status === "won" ? "Ganho" : "Perdido"}
													</Badge>
												)}
											</div>
										))}
										{stageDeals.length === 0 && (
											<p className="px-2 py-4 text-center text-xs text-muted-foreground">
												Nenhuma oportunidade
											</p>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</MainContainer>
	);
};

export default CrmFunnel;
