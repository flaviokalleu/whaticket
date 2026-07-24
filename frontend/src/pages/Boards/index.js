import React, { useState, useEffect, useCallback } from "react";

import { toast } from "react-toastify";
import {
	Plus,
	MoreVertical,
	Pencil,
	Trash2,
	Loader2,
	CalendarDays,
	ArrowRightLeft,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../../components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "../../components/ui/sheet";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import openSocket from "../../services/socket-io";

const getInitials = (name) =>
	(name || "?")
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0])
		.join("")
		.toUpperCase();

const formatDate = (dateStr) => {
	if (!dateStr) return "";
	const onlyDate = String(dateStr).slice(0, 10);
	const [y, m, d] = onlyDate.split("-");
	if (!y || !m || !d) return onlyDate;
	return `${d}/${m}/${y}`;
};

const Boards = () => {
	const [boards, setBoards] = useState([]);
	const [selectedBoardId, setSelectedBoardId] = useState(null);
	const [board, setBoard] = useState(null);
	const [loading, setLoading] = useState(false);
	const [users, setUsers] = useState([]);

	// board dialogs
	const [boardDialogOpen, setBoardDialogOpen] = useState(false);
	const [boardDialogMode, setBoardDialogMode] = useState("create");
	const [boardName, setBoardName] = useState("");
	const [confirmDeleteBoardOpen, setConfirmDeleteBoardOpen] = useState(false);

	// lane dialogs
	const [laneDialogOpen, setLaneDialogOpen] = useState(false);
	const [editingLane, setEditingLane] = useState(null);
	const [laneName, setLaneName] = useState("");
	const [laneColor, setLaneColor] = useState("#7367F0");
	const [deletingLane, setDeletingLane] = useState(null);

	// task dialogs
	const [taskDialogOpen, setTaskDialogOpen] = useState(false);
	const [taskDialogLaneId, setTaskDialogLaneId] = useState(null);
	const [newTaskTitle, setNewTaskTitle] = useState("");

	// task detail sheet
	const [sheetOpen, setSheetOpen] = useState(false);
	const [selectedTask, setSelectedTask] = useState(null);
	const [taskForm, setTaskForm] = useState({
		title: "",
		description: "",
		assignedUserId: "none",
		dueDate: "",
	});
	const [checklist, setChecklist] = useState([]);
	const [newChecklistTitle, setNewChecklistTitle] = useState("");
	const [savingTask, setSavingTask] = useState(false);
	const [confirmDeleteTaskOpen, setConfirmDeleteTaskOpen] = useState(false);

	const fetchBoards = useCallback(async () => {
		try {
			const { data } = await api.get("/boards");
			setBoards(data);
			setSelectedBoardId((prev) => {
				if (prev && data.some((b) => b.id === prev)) return prev;
				return data.length > 0 ? data[0].id : null;
			});
		} catch (err) {
			toastError(err);
		}
	}, []);

	const fetchBoard = useCallback(async (boardId) => {
		if (!boardId) {
			setBoard(null);
			return;
		}
		setLoading(true);
		try {
			const { data } = await api.get(`/boards/${boardId}`);
			const lanes = (data.lanes || [])
				.slice()
				.sort((a, b) => a.position - b.position)
				.map((lane) => ({
					...lane,
					tasks: (lane.tasks || []).slice().sort((a, b) => a.position - b.position),
				}));
			setBoard({ ...data, lanes });
		} catch (err) {
			toastError(err);
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchBoards();
	}, [fetchBoards]);

	useEffect(() => {
		fetchBoard(selectedBoardId);
	}, [selectedBoardId, fetchBoard]);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/users");
				setUsers(data.users || []);
			} catch (err) {
				toastError(err);
			}
		})();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on("board", () => {
			fetchBoards();
			if (selectedBoardId) {
				fetchBoard(selectedBoardId);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [selectedBoardId, fetchBoards, fetchBoard]);

	// ----- Board CRUD -----

	const handleOpenCreateBoard = () => {
		setBoardDialogMode("create");
		setBoardName("");
		setBoardDialogOpen(true);
	};

	const handleOpenRenameBoard = () => {
		setBoardDialogMode("rename");
		setBoardName(board?.name || "");
		setBoardDialogOpen(true);
	};

	const handleSaveBoard = async () => {
		if (!boardName.trim()) return;
		try {
			if (boardDialogMode === "create") {
				const { data } = await api.post("/boards", { name: boardName.trim() });
				toast.success("Quadro criado com sucesso.");
				await fetchBoards();
				setSelectedBoardId(data.id);
			} else {
				await api.put(`/boards/${selectedBoardId}`, { name: boardName.trim() });
				toast.success("Quadro atualizado com sucesso.");
				await fetchBoards();
				await fetchBoard(selectedBoardId);
			}
			setBoardDialogOpen(false);
		} catch (err) {
			toastError(err);
		}
	};

	const handleDeleteBoard = async () => {
		try {
			await api.delete(`/boards/${selectedBoardId}`);
			toast.success("Quadro excluído com sucesso.");
			setSelectedBoardId(null);
			setBoard(null);
			await fetchBoards();
		} catch (err) {
			toastError(err);
		}
	};

	// ----- Lane CRUD -----

	const handleOpenCreateLane = () => {
		setEditingLane(null);
		setLaneName("");
		setLaneColor("#7367F0");
		setLaneDialogOpen(true);
	};

	const handleOpenRenameLane = (lane) => {
		setEditingLane(lane);
		setLaneName(lane.name);
		setLaneColor(lane.color || "#7367F0");
		setLaneDialogOpen(true);
	};

	const handleSaveLane = async () => {
		if (!laneName.trim() || !selectedBoardId) return;
		try {
			if (editingLane) {
				await api.put(`/boards/${selectedBoardId}/lanes/${editingLane.id}`, {
					name: laneName.trim(),
					color: laneColor,
				});
				toast.success("Coluna atualizada com sucesso.");
			} else {
				await api.post(`/boards/${selectedBoardId}/lanes`, {
					name: laneName.trim(),
					color: laneColor,
				});
				toast.success("Coluna criada com sucesso.");
			}
			setLaneDialogOpen(false);
			await fetchBoard(selectedBoardId);
		} catch (err) {
			toastError(err);
		}
	};

	const handleDeleteLane = async (lane) => {
		try {
			await api.delete(`/boards/${selectedBoardId}/lanes/${lane.id}`);
			toast.success("Coluna excluída com sucesso.");
			await fetchBoard(selectedBoardId);
		} catch (err) {
			toastError(err);
		}
	};

	// ----- Task CRUD -----

	const handleOpenCreateTask = (laneId) => {
		setTaskDialogLaneId(laneId);
		setNewTaskTitle("");
		setTaskDialogOpen(true);
	};

	const handleCreateTask = async () => {
		if (!newTaskTitle.trim() || !taskDialogLaneId) return;
		try {
			await api.post(`/boards/${selectedBoardId}/tasks`, {
				laneId: taskDialogLaneId,
				title: newTaskTitle.trim(),
			});
			toast.success("Tarefa criada com sucesso.");
			setTaskDialogOpen(false);
			await fetchBoard(selectedBoardId);
		} catch (err) {
			toastError(err);
		}
	};

	const handleMoveTask = async (task, laneId) => {
		try {
			await api.put(`/boards/${selectedBoardId}/tasks/${task.id}/move`, {
				laneId,
			});
			await fetchBoard(selectedBoardId);
		} catch (err) {
			toastError(err);
		}
	};

	const handleOpenTask = async (task) => {
		setSelectedTask(task);
		setTaskForm({
			title: task.title || "",
			description: task.description || "",
			assignedUserId: task.assignedUserId ? String(task.assignedUserId) : "none",
			dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : "",
		});
		setNewChecklistTitle("");
		setSheetOpen(true);
		try {
			const { data } = await api.get(`/boards/tasks/${task.id}/checklist`);
			setChecklist(data || []);
		} catch (err) {
			toastError(err);
		}
	};

	const handleSaveTask = async () => {
		if (!selectedTask || !taskForm.title.trim()) return;
		setSavingTask(true);
		try {
			await api.put(`/boards/${selectedBoardId}/tasks/${selectedTask.id}`, {
				title: taskForm.title.trim(),
				description: taskForm.description,
				assignedUserId:
					taskForm.assignedUserId === "none" ? null : +taskForm.assignedUserId,
				dueDate: taskForm.dueDate || null,
			});
			toast.success("Tarefa atualizada com sucesso.");
			setSheetOpen(false);
			await fetchBoard(selectedBoardId);
		} catch (err) {
			toastError(err);
		}
		setSavingTask(false);
	};

	const handleDeleteTask = async () => {
		if (!selectedTask) return;
		try {
			await api.delete(`/boards/${selectedBoardId}/tasks/${selectedTask.id}`);
			toast.success("Tarefa excluída com sucesso.");
			setSheetOpen(false);
			await fetchBoard(selectedBoardId);
		} catch (err) {
			toastError(err);
		}
	};

	// ----- Checklist -----

	const handleAddChecklistItem = async () => {
		if (!newChecklistTitle.trim() || !selectedTask) return;
		try {
			const { data } = await api.post(
				`/boards/tasks/${selectedTask.id}/checklist`,
				{ title: newChecklistTitle.trim() }
			);
			setChecklist((prev) => [...prev, data]);
			setNewChecklistTitle("");
		} catch (err) {
			toastError(err);
		}
	};

	const handleToggleChecklistItem = async (item) => {
		try {
			const { data } = await api.put(
				`/boards/tasks/${selectedTask.id}/checklist/${item.id}`,
				{ isCompleted: !item.isCompleted }
			);
			setChecklist((prev) => prev.map((i) => (i.id === item.id ? data : i)));
		} catch (err) {
			toastError(err);
		}
	};

	const handleDeleteChecklistItem = async (item) => {
		try {
			await api.delete(`/boards/tasks/${selectedTask.id}/checklist/${item.id}`);
			setChecklist((prev) => prev.filter((i) => i.id !== item.id));
		} catch (err) {
			toastError(err);
		}
	};

	const getUserName = (userId) => {
		const found = users.find((u) => u.id === userId);
		return found ? found.name : "";
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={board ? `Excluir o quadro ${board.name}?` : ""}
				open={confirmDeleteBoardOpen}
				onClose={() => setConfirmDeleteBoardOpen(false)}
				onConfirm={handleDeleteBoard}
			>
				Todas as colunas e tarefas deste quadro serão excluídas. Esta ação não
				pode ser desfeita.
			</ConfirmationModal>

			<ConfirmationModal
				title={deletingLane ? `Excluir a coluna ${deletingLane.name}?` : ""}
				open={!!deletingLane}
				onClose={() => setDeletingLane(null)}
				onConfirm={() => {
					handleDeleteLane(deletingLane);
					setDeletingLane(null);
				}}
			>
				Todas as tarefas desta coluna serão excluídas. Esta ação não pode ser
				desfeita.
			</ConfirmationModal>

			<ConfirmationModal
				title={selectedTask ? `Excluir a tarefa ${selectedTask.title}?` : ""}
				open={confirmDeleteTaskOpen}
				onClose={() => setConfirmDeleteTaskOpen(false)}
				onConfirm={handleDeleteTask}
			>
				Esta ação não pode ser desfeita.
			</ConfirmationModal>

			<MainHeader>
				<Title>Quadros</Title>
				<MainHeaderButtonsWrapper>
					{boards.length > 0 && (
						<Select
							value={selectedBoardId ? String(selectedBoardId) : undefined}
							onValueChange={(v) => setSelectedBoardId(+v)}
						>
							<SelectTrigger className="w-52">
								<SelectValue placeholder="Selecione um quadro" />
							</SelectTrigger>
							<SelectContent>
								{boards.map((b) => (
									<SelectItem key={b.id} value={String(b.id)}>
										{b.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
					{board && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="icon">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={handleOpenRenameBoard}>
									<Pencil className="mr-2 h-4 w-4" />
									Renomear quadro
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-destructive focus:text-destructive"
									onClick={() => setConfirmDeleteBoardOpen(true)}
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Excluir quadro
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
					<Button onClick={handleOpenCreateBoard}>
						<Plus className="h-4 w-4" />
						Novo quadro
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>

			<div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6">
				{loading && !board && (
					<div className="flex h-full items-center justify-center text-muted-foreground">
						<Loader2 className="mr-2 h-5 w-5 animate-spin" />
						Carregando...
					</div>
				)}

				{!loading && boards.length === 0 && (
					<div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
						<p>Nenhum quadro criado ainda.</p>
						<Button onClick={handleOpenCreateBoard}>
							<Plus className="h-4 w-4" />
							Criar primeiro quadro
						</Button>
					</div>
				)}

				{board && (
					<div className="flex h-full items-start gap-4">
						{board.lanes.map((lane) => (
							<div
								key={lane.id}
								className="flex max-h-full w-72 shrink-0 flex-col rounded-xl border bg-card"
							>
								<div
									className="flex items-center justify-between gap-2 rounded-t-xl border-b px-3 py-2.5"
									style={{
										borderTop: `3px solid ${lane.color || "#7367F0"}`,
									}}
								>
									<div className="flex min-w-0 items-center gap-2">
										<span
											className="h-2.5 w-2.5 shrink-0 rounded-full"
											style={{ backgroundColor: lane.color || "#7367F0" }}
										/>
										<span className="truncate text-sm font-semibold">
											{lane.name}
										</span>
										<Badge variant="secondary" className="shrink-0">
											{lane.tasks.length}
										</Badge>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="h-7 w-7">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => handleOpenRenameLane(lane)}>
												<Pencil className="mr-2 h-4 w-4" />
												Editar coluna
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="text-destructive focus:text-destructive"
												onClick={() => setDeletingLane(lane)}
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Excluir coluna
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								<div className="flex-1 space-y-2 overflow-y-auto p-2">
									{lane.tasks.map((task) => (
										<div
											key={task.id}
											className="group cursor-pointer rounded-lg border bg-background p-3 shadow-sm transition-colors hover:bg-accent"
											onClick={() => handleOpenTask(task)}
										>
											<div className="flex items-start justify-between gap-1">
												<p className="text-sm font-medium leading-snug">
													{task.title}
												</p>
												<div onClick={(e) => e.stopPropagation()}>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
															>
																<MoreVertical className="h-3.5 w-3.5" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuSub>
																<DropdownMenuSubTrigger>
																	<ArrowRightLeft className="mr-2 h-4 w-4" />
																	Mover para
																</DropdownMenuSubTrigger>
																<DropdownMenuSubContent>
																	{board.lanes
																		.filter((l) => l.id !== lane.id)
																		.map((l) => (
																			<DropdownMenuItem
																				key={l.id}
																				onClick={() => handleMoveTask(task, l.id)}
																			>
																				<span
																					className="mr-2 h-2.5 w-2.5 rounded-full"
																					style={{
																						backgroundColor: l.color || "#7367F0",
																					}}
																				/>
																				{l.name}
																			</DropdownMenuItem>
																		))}
																	{board.lanes.length <= 1 && (
																		<DropdownMenuItem disabled>
																			Nenhuma outra coluna
																		</DropdownMenuItem>
																	)}
																</DropdownMenuSubContent>
															</DropdownMenuSub>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
											{(task.assignedUserId || task.dueDate) && (
												<div className="mt-2 flex items-center justify-between gap-2">
													{task.dueDate ? (
														<Badge variant="outline" className="gap-1 font-normal">
															<CalendarDays className="h-3 w-3" />
															{formatDate(task.dueDate)}
														</Badge>
													) : (
														<span />
													)}
													{task.assignedUserId && (
														<Avatar className="h-6 w-6">
															<AvatarFallback className="text-[10px]">
																{getInitials(getUserName(task.assignedUserId))}
															</AvatarFallback>
														</Avatar>
													)}
												</div>
											)}
										</div>
									))}
								</div>

								<div className="border-t p-2">
									<Button
										variant="ghost"
										className="w-full justify-start text-muted-foreground"
										onClick={() => handleOpenCreateTask(lane.id)}
									>
										<Plus className="h-4 w-4" />
										Tarefa
									</Button>
								</div>
							</div>
						))}

						<Button
							variant="outline"
							className="w-72 shrink-0 justify-start border-dashed text-muted-foreground"
							onClick={handleOpenCreateLane}
						>
							<Plus className="h-4 w-4" />
							Nova coluna
						</Button>
					</div>
				)}
			</div>

			{/* Board create/rename dialog */}
			<Dialog open={boardDialogOpen} onOpenChange={setBoardDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{boardDialogMode === "create" ? "Novo quadro" : "Renomear quadro"}
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-1.5">
						<Label htmlFor="board-name">Nome</Label>
						<Input
							id="board-name"
							value={boardName}
							autoFocus
							onChange={(e) => setBoardName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSaveBoard()}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setBoardDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleSaveBoard} disabled={!boardName.trim()}>
							Salvar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Lane create/rename dialog */}
			<Dialog open={laneDialogOpen} onOpenChange={setLaneDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{editingLane ? "Editar coluna" : "Nova coluna"}
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="lane-name">Nome</Label>
							<Input
								id="lane-name"
								value={laneName}
								autoFocus
								onChange={(e) => setLaneName(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSaveLane()}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="lane-color">Cor</Label>
							<div className="flex items-center gap-2">
								<input
									id="lane-color"
									type="color"
									value={laneColor}
									onChange={(e) => setLaneColor(e.target.value)}
									className="h-9 w-12 cursor-pointer rounded-md border bg-transparent p-1"
								/>
								<Input
									value={laneColor}
									onChange={(e) => setLaneColor(e.target.value)}
									className="w-32 font-mono text-xs"
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setLaneDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleSaveLane} disabled={!laneName.trim()}>
							Salvar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Task create dialog */}
			<Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Nova tarefa</DialogTitle>
					</DialogHeader>
					<div className="space-y-1.5">
						<Label htmlFor="task-title">Título</Label>
						<Input
							id="task-title"
							value={newTaskTitle}
							autoFocus
							onChange={(e) => setNewTaskTitle(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
							Criar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Task detail sheet */}
			<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
				<SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-md">
					<SheetHeader>
						<SheetTitle>Detalhes da tarefa</SheetTitle>
					</SheetHeader>

					<div className="flex-1 space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="sheet-task-title">Título</Label>
							<Input
								id="sheet-task-title"
								value={taskForm.title}
								onChange={(e) =>
									setTaskForm((f) => ({ ...f, title: e.target.value }))
								}
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="sheet-task-description">Descrição</Label>
							<Textarea
								id="sheet-task-description"
								rows={4}
								value={taskForm.description}
								onChange={(e) =>
									setTaskForm((f) => ({ ...f, description: e.target.value }))
								}
							/>
						</div>

						<div className="space-y-1.5">
							<Label>Responsável</Label>
							<Select
								value={taskForm.assignedUserId}
								onValueChange={(v) =>
									setTaskForm((f) => ({ ...f, assignedUserId: v }))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Sem responsável" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">Sem responsável</SelectItem>
									{users.map((u) => (
										<SelectItem key={u.id} value={String(u.id)}>
											{u.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="sheet-task-duedate">Data de vencimento</Label>
							<Input
								id="sheet-task-duedate"
								type="date"
								value={taskForm.dueDate}
								onChange={(e) =>
									setTaskForm((f) => ({ ...f, dueDate: e.target.value }))
								}
							/>
						</div>

						<div className="space-y-2">
							<Label>Checklist</Label>
							<div className="space-y-1.5">
								{checklist.map((item) => (
									<div
										key={item.id}
										className="group flex items-center gap-2 rounded-md border px-2 py-1.5"
									>
										<Checkbox
											checked={!!item.isCompleted}
											onCheckedChange={() => handleToggleChecklistItem(item)}
										/>
										<span
											className={`flex-1 text-sm ${
												item.isCompleted
													? "text-muted-foreground line-through"
													: ""
											}`}
										>
											{item.title}
										</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 text-destructive opacity-0 hover:text-destructive group-hover:opacity-100"
											onClick={() => handleDeleteChecklistItem(item)}
										>
											<Trash2 className="h-3.5 w-3.5" />
										</Button>
									</div>
								))}
								{checklist.length === 0 && (
									<p className="text-xs text-muted-foreground">
										Nenhum item na checklist.
									</p>
								)}
							</div>
							<div className="flex gap-2">
								<Input
									placeholder="Novo item..."
									value={newChecklistTitle}
									onChange={(e) => setNewChecklistTitle(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleAddChecklistItem()}
								/>
								<Button
									variant="outline"
									size="icon"
									className="shrink-0"
									onClick={handleAddChecklistItem}
									disabled={!newChecklistTitle.trim()}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					<div className="mt-6 flex items-center justify-between gap-2 border-t pt-4">
						<Button
							variant="outline"
							className="text-destructive hover:text-destructive"
							onClick={() => setConfirmDeleteTaskOpen(true)}
						>
							<Trash2 className="h-4 w-4" />
							Excluir
						</Button>
						<Button onClick={handleSaveTask} disabled={savingTask || !taskForm.title.trim()}>
							{savingTask && <Loader2 className="h-4 w-4 animate-spin" />}
							Salvar
						</Button>
					</div>
				</SheetContent>
			</Sheet>
		</MainContainer>
	);
};

export default Boards;
