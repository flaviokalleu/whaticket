import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import {
	ReactFlow,
	Background,
	Controls,
	MiniMap,
	addEdge,
	useNodesState,
	useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
	ArrowLeft,
	Save,
	Play,
	History,
	Trash2,
	Copy,
	MessageSquare,
	Clock,
	GitBranch,
	Globe,
	Loader2,
	RefreshCw,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
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
} from "../../components/ui/sheet";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import useWhatsApps from "../../hooks/useWhatsApps";
import { getBackendUrl } from "../../config";
import { nodeTypes, NODE_DEFAULTS, NODE_LABELS } from "./nodes";

const PALETTE = [
	{ type: "sendMessage", label: "Enviar mensagem", icon: MessageSquare },
	{ type: "delay", label: "Atraso", icon: Clock },
	{ type: "condition", label: "Condição", icon: GitBranch },
	{ type: "httpRequest", label: "Requisição HTTP", icon: Globe },
];

const statusVariant = {
	pending: "secondary",
	running: "default",
	completed: "secondary",
	failed: "destructive",
};

const statusLabel = {
	pending: "Pendente",
	running: "Executando",
	completed: "Concluída",
	failed: "Falhou",
};

const FlowBuilder = () => {
	const history = useHistory();
	const { flowId } = useParams();
	const { whatsApps } = useWhatsApps();

	const [flow, setFlow] = useState(null);
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [selectedNodeId, setSelectedNodeId] = useState(null);

	const [testDialogOpen, setTestDialogOpen] = useState(false);
	const [testInput, setTestInput] = useState('{\n  "name": "Cliente"\n}');
	const [executionsOpen, setExecutionsOpen] = useState(false);
	const [executions, setExecutions] = useState([]);
	const [loadingExecutions, setLoadingExecutions] = useState(false);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const { data } = await api.get(`/flows/${flowId}`);
				setFlow(data);
				setName(data.name);
				setNodes(
					(data.nodes || []).map((node) => ({
						...node,
						deletable: node.type !== "trigger",
					}))
				);
				setEdges(data.edges || []);
			} catch (err) {
				toastError(err);
			}
			setLoading(false);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [flowId]);

	const selectedNode = useMemo(
		() => nodes.find((n) => n.id === selectedNodeId) || null,
		[nodes, selectedNodeId]
	);

	const onConnect = useCallback(
		(params) => setEdges((eds) => addEdge(params, eds)),
		[setEdges]
	);

	const handleAddNode = (type) => {
		const id = `${type}-${Date.now()}`;
		const offset = nodes.length * 30;
		setNodes((nds) => [
			...nds,
			{
				id,
				type,
				position: { x: 360 + (offset % 180), y: 100 + offset },
				data: { ...NODE_DEFAULTS[type] },
				deletable: true,
			},
		]);
		setSelectedNodeId(id);
	};

	const updateSelectedNodeData = (patch) => {
		setNodes((nds) =>
			nds.map((node) =>
				node.id === selectedNodeId
					? { ...node, data: { ...node.data, ...patch } }
					: node
			)
		);
	};

	const handleRemoveSelectedNode = () => {
		if (!selectedNode || selectedNode.type === "trigger") return;
		setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
		setEdges((eds) =>
			eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
		);
		setSelectedNodeId(null);
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const cleanNodes = nodes.map(({ id, type, position, data }) => ({
				id,
				type,
				position,
				data,
			}));
			const cleanEdges = edges.map(({ id, source, target, sourceHandle }) => ({
				id,
				source,
				target,
				sourceHandle: sourceHandle || null,
			}));
			const { data } = await api.put(`/flows/${flowId}`, {
				name,
				nodes: cleanNodes,
				edges: cleanEdges,
			});
			setFlow(data);
			toast.success("Fluxo salvo com sucesso.");
		} catch (err) {
			toastError(err);
		}
		setSaving(false);
	};

	const fetchExecutions = async () => {
		setLoadingExecutions(true);
		try {
			const { data } = await api.get(`/flows/${flowId}/executions`);
			setExecutions(data);
		} catch (err) {
			toastError(err);
		}
		setLoadingExecutions(false);
	};

	const handleOpenExecutions = () => {
		setExecutionsOpen(true);
		fetchExecutions();
	};

	const handleRunTest = async () => {
		let parsed = {};
		if (testInput.trim()) {
			try {
				parsed = JSON.parse(testInput);
			} catch (err) {
				toast.error("O payload de teste não é um JSON válido.");
				return;
			}
		}
		try {
			await api.post(`/flows/${flowId}/execute`, { input: parsed });
			toast.success("Execução iniciada.");
			setTestDialogOpen(false);
			handleOpenExecutions();
		} catch (err) {
			toastError(err);
		}
	};

	const webhookUrl =
		flow?.webhookToken && `${getBackendUrl()}/flow-webhooks/${flow.webhookToken}`;

	const handleCopyWebhook = () => {
		navigator.clipboard.writeText(webhookUrl);
		toast.success("URL do webhook copiada.");
	};

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col overflow-hidden">
			{/* Barra superior */}
			<div className="flex shrink-0 items-center gap-3 border-b bg-background px-4 py-2.5">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => history.push("/flows")}
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<Input
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="h-9 max-w-xs font-medium"
				/>
				{flow?.nodes?.some?.(
					(n) => n.type === "trigger" && n.data?.triggerType === "webhook"
				) && (
					<button
						type="button"
						onClick={handleCopyWebhook}
						className="hidden items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground hover:bg-muted lg:flex"
						title={webhookUrl}
					>
						<Copy className="h-3 w-3" />
						Copiar URL do webhook
					</button>
				)}
				<div className="ml-auto flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={handleOpenExecutions}>
						<History className="h-4 w-4" />
						Execuções
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setTestDialogOpen(true)}
					>
						<Play className="h-4 w-4" />
						Executar teste
					</Button>
					<Button size="sm" onClick={handleSave} disabled={saving}>
						{saving ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Save className="h-4 w-4" />
						)}
						Salvar
					</Button>
				</div>
			</div>

			<div className="flex min-h-0 flex-1">
				{/* Paleta */}
				<div className="w-52 shrink-0 space-y-2 overflow-y-auto border-r bg-muted/20 p-3">
					<p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Adicionar nó
					</p>
					{PALETTE.map((item) => (
						<button
							key={item.type}
							type="button"
							onClick={() => handleAddNode(item.type)}
							className="flex w-full items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-accent"
						>
							<item.icon className="h-4 w-4 text-muted-foreground" />
							{item.label}
						</button>
					))}
				</div>

				{/* Canvas */}
				<div className="min-w-0 flex-1">
					<ReactFlow
						nodes={nodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						onNodeClick={(_, node) => setSelectedNodeId(node.id)}
						onPaneClick={() => setSelectedNodeId(null)}
						nodeTypes={nodeTypes}
						fitView
						proOptions={{ hideAttribution: true }}
					>
						<Background gap={16} />
						<Controls />
						<MiniMap pannable zoomable />
					</ReactFlow>
				</div>

				{/* Painel de configuração */}
				{selectedNode && (
					<div className="w-80 shrink-0 space-y-4 overflow-y-auto border-l bg-background p-4">
						<div className="flex items-center justify-between">
							<p className="text-sm font-semibold">
								{NODE_LABELS[selectedNode.type] || selectedNode.type}
							</p>
							{selectedNode.type !== "trigger" && (
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-destructive hover:text-destructive"
									onClick={handleRemoveSelectedNode}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							)}
						</div>

						{selectedNode.type === "trigger" && (
							<div className="space-y-1.5">
								<Label>Tipo de gatilho</Label>
								<Select
									value={selectedNode.data.triggerType || "manual"}
									onValueChange={(v) => updateSelectedNodeData({ triggerType: v })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="manual">Manual</SelectItem>
										<SelectItem value="webhook">Webhook</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}

						{selectedNode.type === "sendMessage" && (
							<>
								<div className="space-y-1.5">
									<Label>Conexão</Label>
									<Select
										value={
											selectedNode.data.whatsappId
												? String(selectedNode.data.whatsappId)
												: undefined
										}
										onValueChange={(v) =>
											updateSelectedNodeData({ whatsappId: v })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Selecione a conexão" />
										</SelectTrigger>
										<SelectContent>
											{whatsApps.map((w) => (
												<SelectItem key={w.id} value={String(w.id)}>
													{w.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="nodeNumber">Número</Label>
									<Input
										id="nodeNumber"
										value={selectedNode.data.number || ""}
										onChange={(e) =>
											updateSelectedNodeData({ number: e.target.value })
										}
										placeholder="5511999999999"
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="nodeBody">Mensagem</Label>
									<Textarea
										id="nodeBody"
										rows={4}
										value={selectedNode.data.body || ""}
										onChange={(e) =>
											updateSelectedNodeData({ body: e.target.value })
										}
										placeholder="Olá {{name}}!"
									/>
									<p className="text-xs text-muted-foreground">
										Use {"{{name}}"} para inserir o nome vindo do gatilho.
									</p>
								</div>
							</>
						)}

						{selectedNode.type === "delay" && (
							<div className="space-y-1.5">
								<Label htmlFor="nodeSeconds">Segundos</Label>
								<Input
									id="nodeSeconds"
									type="number"
									min={0}
									max={300}
									value={selectedNode.data.seconds ?? 0}
									onChange={(e) =>
										updateSelectedNodeData({ seconds: Number(e.target.value) })
									}
								/>
								<p className="text-xs text-muted-foreground">Máximo de 300s.</p>
							</div>
						)}

						{selectedNode.type === "condition" && (
							<>
								<div className="space-y-1.5">
									<Label htmlFor="nodeField">Campo</Label>
									<Input
										id="nodeField"
										value={selectedNode.data.field || ""}
										onChange={(e) =>
											updateSelectedNodeData({ field: e.target.value })
										}
										placeholder="ex.: message.body"
									/>
								</div>
								<div className="space-y-1.5">
									<Label>Operador</Label>
									<Select
										value={selectedNode.data.operator || "equals"}
										onValueChange={(v) => updateSelectedNodeData({ operator: v })}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="equals">É igual a</SelectItem>
											<SelectItem value="contains">Contém</SelectItem>
											<SelectItem value="exists">Existe</SelectItem>
										</SelectContent>
									</Select>
								</div>
								{selectedNode.data.operator !== "exists" && (
									<div className="space-y-1.5">
										<Label htmlFor="nodeValue">Valor</Label>
										<Input
											id="nodeValue"
											value={selectedNode.data.value || ""}
											onChange={(e) =>
												updateSelectedNodeData({ value: e.target.value })
											}
										/>
									</div>
								)}
							</>
						)}

						{selectedNode.type === "httpRequest" && (
							<>
								<div className="space-y-1.5">
									<Label>Método</Label>
									<Select
										value={selectedNode.data.method || "GET"}
										onValueChange={(v) => updateSelectedNodeData({ method: v })}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="GET">GET</SelectItem>
											<SelectItem value="POST">POST</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="nodeUrl">URL</Label>
									<Input
										id="nodeUrl"
										value={selectedNode.data.url || ""}
										onChange={(e) =>
											updateSelectedNodeData({ url: e.target.value })
										}
										placeholder="https://api.exemplo.com/hook"
									/>
								</div>
								{selectedNode.data.method === "POST" && (
									<div className="space-y-1.5">
										<Label htmlFor="nodeHttpBody">Corpo (JSON)</Label>
										<Textarea
											id="nodeHttpBody"
											rows={4}
											value={selectedNode.data.body || ""}
											onChange={(e) =>
												updateSelectedNodeData({ body: e.target.value })
											}
										/>
									</div>
								)}
							</>
						)}
					</div>
				)}
			</div>

			{/* Dialog de teste */}
			<Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Executar teste</DialogTitle>
					</DialogHeader>
					<div className="space-y-1.5">
						<Label htmlFor="testInput">Payload de entrada (JSON)</Label>
						<Textarea
							id="testInput"
							rows={6}
							value={testInput}
							onChange={(e) => setTestInput(e.target.value)}
							className="font-mono text-xs"
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setTestDialogOpen(false)}
						>
							Cancelar
						</Button>
						<Button type="button" onClick={handleRunTest}>
							<Play className="h-4 w-4" />
							Executar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Painel de execuções */}
			<Sheet open={executionsOpen} onOpenChange={setExecutionsOpen}>
				<SheetContent className="w-full sm:max-w-lg">
					<SheetHeader>
						<SheetTitle className="flex items-center gap-2">
							Execuções
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7"
								onClick={fetchExecutions}
							>
								<RefreshCw
									className={`h-3.5 w-3.5 ${
										loadingExecutions ? "animate-spin" : ""
									}`}
								/>
							</Button>
						</SheetTitle>
					</SheetHeader>
					<div className="mt-4 space-y-3 overflow-y-auto pb-6">
						{executions.length === 0 && !loadingExecutions && (
							<p className="text-sm text-muted-foreground">
								Nenhuma execução registrada ainda.
							</p>
						)}
						{executions.map((execution) => (
							<div key={execution.id} className="rounded-lg border bg-card p-3">
								<div className="flex items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<Badge variant={statusVariant[execution.status] || "secondary"}>
											{statusLabel[execution.status] || execution.status}
										</Badge>
										<span className="text-xs text-muted-foreground">
											#{execution.id}
										</span>
									</div>
									<span className="text-xs text-muted-foreground">
										{execution.createdAt
											? format(parseISO(execution.createdAt), "dd/MM HH:mm:ss")
											: ""}
									</span>
								</div>
								{(execution.log || []).length > 0 && (
									<ul className="mt-2 space-y-1 border-t pt-2">
										{execution.log.map((entry, index) => (
											<li
												key={`${execution.id}-${index}`}
												className="flex items-start gap-2 text-xs"
											>
												<span
													className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
														entry.status === "failed"
															? "bg-destructive"
															: entry.status === "skipped"
															? "bg-muted-foreground"
															: "bg-emerald-500"
													}`}
												/>
												<span className="text-muted-foreground">
													<span className="font-medium text-foreground">
														{NODE_LABELS[entry.type] || entry.type}
													</span>{" "}
													— {entry.message}
												</span>
											</li>
										))}
									</ul>
								)}
							</div>
						))}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
};

export default FlowBuilder;
