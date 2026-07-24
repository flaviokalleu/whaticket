import React, { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "react-toastify";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip as ReTooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	BarChart3,
	CheckCircle2,
	Clock,
	Download,
	Inbox,
	RefreshCw,
	Star,
	Ticket,
	TrendingUp,
} from "lucide-react";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useThemeContext } from "../../context/DarkMode";

const ALL = "all";

const PALETTE = {
	light: {
		created: "#2a78d6",
		closed: "#1baf7a",
		volume: "#4a3aa7",
		neutral: "#94a3b8",
		promoters: "#1baf7a",
		passives: "#eda100",
		detractors: "#e34948",
		categorical: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"],
		rating: ["#e34948", "#eb6834", "#eda100", "#2a78d6", "#1baf7a"],
		grid: "#e2e8f0",
		axis: "#64748b",
		tooltipBg: "#ffffff",
		tooltipBorder: "#e2e8f0",
		tooltipText: "#0f172a",
	},
	dark: {
		created: "#3987e5",
		closed: "#199e70",
		volume: "#9085e9",
		neutral: "#64748b",
		promoters: "#199e70",
		passives: "#c98500",
		detractors: "#e66767",
		categorical: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"],
		rating: ["#e66767", "#d95926", "#c98500", "#3987e5", "#199e70"],
		grid: "#1e293b",
		axis: "#94a3b8",
		tooltipBg: "#0f172a",
		tooltipBorder: "#1e293b",
		tooltipText: "#f8fafc",
	},
};

const EMPTY_REPORT = {
	summary: {
		total: 0,
		open: 0,
		pending: 0,
		closed: 0,
		avgFirstResponseMinutes: null,
		avgResolutionMinutes: null,
		resolutionRate: 0,
	},
	byDay: [],
	byHour: [],
	byQueue: [],
	byUser: [],
	byTag: [],
	ratings: { total: 0, average: null, distribution: [] },
	nps: { total: 0, score: null, promoters: 0, passives: 0, detractors: 0 },
};

const DASH = "—";

const toIsoDate = (date) => {
	const d = new Date(date);
	const month = `${d.getMonth() + 1}`.padStart(2, "0");
	const day = `${d.getDate()}`.padStart(2, "0");
	return `${d.getFullYear()}-${month}-${day}`;
};

const daysAgo = (days) => {
	const d = new Date();
	d.setDate(d.getDate() - days);
	return toIsoDate(d);
};

const isNum = (value) => typeof value === "number" && !Number.isNaN(value);

const formatMinutes = (minutes) => {
	if (!isNum(minutes)) return DASH;
	const total = Math.round(minutes);
	if (total <= 0) return "0min";
	const days = Math.floor(total / 1440);
	const hours = Math.floor((total % 1440) / 60);
	const mins = total % 60;
	if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
	if (hours > 0) return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
	return `${mins}min`;
};

const formatNumber = (value) => (isNum(value) ? value.toLocaleString("pt-BR") : DASH);

const formatPercent = (value, digits = 1) => {
	if (!isNum(value)) return DASH;
	return `${value.toFixed(digits).replace(".", ",")}%`;
};

const formatDecimal = (value, digits = 1) => {
	if (!isNum(value)) return DASH;
	return value.toFixed(digits).replace(".", ",");
};

const ratio = (part, whole) => {
	if (!isNum(part) || !isNum(whole) || whole <= 0) return null;
	return (part / whole) * 100;
};

const formatDayLabel = (value) => {
	if (!value || typeof value !== "string") return "";
	const parts = value.split("-");
	if (parts.length < 3) return value;
	return `${parts[2]}/${parts[1]}`;
};

const csvCell = (value) => {
	if (value === null || value === undefined) return "";
	const text = String(value).replace(/"/g, '""');
	return /[";\n]/.test(text) ? `"${text}"` : text;
};

const csvRow = (cells) => cells.map(csvCell).join(";");

const EmptyState = ({ children }) => (
	<div className="flex h-[280px] flex-col items-center justify-center gap-2 text-center">
		<Inbox className="h-8 w-8 text-muted-foreground/60" />
		<p className="text-sm text-muted-foreground">{children}</p>
	</div>
);

const Panel = ({ title, description, action, children, className }) => (
	<div className={`rounded-xl border bg-card p-5 ${className || ""}`}>
		<div className="mb-4 flex items-start justify-between gap-3">
			<div>
				<h2 className="text-sm font-semibold text-foreground">{title}</h2>
				{description ? (
					<p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
				) : null}
			</div>
			{action}
		</div>
		{children}
	</div>
);

const KpiCard = ({ icon: Icon, label, value, hint, accent }) => (
	<div className="rounded-xl border bg-card p-4">
		<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
			<Icon className={`h-4 w-4 ${accent || "text-muted-foreground"}`} />
			<span className="truncate">{label}</span>
		</div>
		<p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
		{hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
	</div>
);

const Stars = ({ value }) => {
	if (!isNum(value)) return <span className="text-muted-foreground">{DASH}</span>;
	const rounded = Math.round(value);
	return (
		<span className="inline-flex items-center gap-1">
			<span className="inline-flex">
				{[1, 2, 3, 4, 5].map((i) => (
					<Star
						key={i}
						className={`h-3.5 w-3.5 ${
							i <= rounded
								? "fill-amber-400 text-amber-400"
								: "text-muted-foreground/40"
						}`}
					/>
				))}
			</span>
			<span className="text-xs text-muted-foreground">{formatDecimal(value, 1)}</span>
		</span>
	);
};

const Reports = () => {
	const themeContext = useThemeContext();
	const darkMode = !!(themeContext && themeContext.darkMode);
	const colors = darkMode ? PALETTE.dark : PALETTE.light;

	const [startDate, setStartDate] = useState(daysAgo(30));
	const [endDate, setEndDate] = useState(toIsoDate(new Date()));
	const [queueId, setQueueId] = useState(ALL);
	const [userId, setUserId] = useState(ALL);

	const [queues, setQueues] = useState([]);
	const [users, setUsers] = useState([]);

	const [report, setReport] = useState(null);
	const [loading, setLoading] = useState(true);

	const chartTooltipStyle = useMemo(
		() => ({
			backgroundColor: colors.tooltipBg,
			border: `1px solid ${colors.tooltipBorder}`,
			borderRadius: 8,
			fontSize: 12,
			color: colors.tooltipText,
		}),
		[colors]
	);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const [queuesRes, usersRes] = await Promise.all([
					api.get("/queue"),
					api.get("/users"),
				]);
				if (!mounted) return;
				setQueues(Array.isArray(queuesRes.data) ? queuesRes.data : []);
				setUsers(
					usersRes.data && Array.isArray(usersRes.data.users)
						? usersRes.data.users
						: []
				);
			} catch (err) {
				if (mounted) toastError(err);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const fetchReport = useCallback(async () => {
		setLoading(true);
		try {
			const params = {};
			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;
			if (queueId !== ALL) params.queueId = queueId;
			if (userId !== ALL) params.userId = userId;

			const { data } = await api.get("/reports/tickets", { params });
			setReport({ ...EMPTY_REPORT, ...(data || {}) });
		} catch (err) {
			toastError(err);
			setReport(EMPTY_REPORT);
		} finally {
			setLoading(false);
		}
	}, [startDate, endDate, queueId, userId]);

	useEffect(() => {
		fetchReport();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const applyPreset = (days) => {
		setStartDate(days === 0 ? toIsoDate(new Date()) : daysAgo(days));
		setEndDate(toIsoDate(new Date()));
	};

	const data = report || EMPTY_REPORT;
	const summary = data.summary || EMPTY_REPORT.summary;
	const ratings = data.ratings || EMPTY_REPORT.ratings;
	const nps = data.nps || EMPTY_REPORT.nps;
	const byDay = Array.isArray(data.byDay) ? data.byDay : [];
	const byHour = Array.isArray(data.byHour) ? data.byHour : [];
	const byQueue = Array.isArray(data.byQueue) ? data.byQueue : [];
	const byUser = Array.isArray(data.byUser) ? data.byUser : [];
	const byTag = Array.isArray(data.byTag) ? data.byTag : [];

	const sortedUsers = useMemo(
		() => [...byUser].sort((a, b) => (b.total || 0) - (a.total || 0)),
		[byUser]
	);
	const sortedQueues = useMemo(
		() => [...byQueue].sort((a, b) => (b.total || 0) - (a.total || 0)),
		[byQueue]
	);
	const sortedTags = useMemo(
		() => [...byTag].sort((a, b) => (b.total || 0) - (a.total || 0)),
		[byTag]
	);

	const queueTotal = useMemo(
		() => sortedQueues.reduce((acc, item) => acc + (item.total || 0), 0),
		[sortedQueues]
	);

	const hourData = useMemo(
		() => byHour.map((item) => ({ ...item, label: `${`${item.hour}`.padStart(2, "0")}h` })),
		[byHour]
	);

	const dayData = useMemo(
		() => byDay.map((item) => ({ ...item, label: formatDayLabel(item.date) })),
		[byDay]
	);

	const userChartData = useMemo(
		() => sortedUsers.slice(0, 12).map((item) => ({ name: item.name, total: item.total || 0 })),
		[sortedUsers]
	);

	const ratingData = useMemo(() => {
		const distribution = Array.isArray(ratings.distribution) ? ratings.distribution : [];
		return distribution.map((item) => ({
			label: `${item.rate} ★`,
			rate: item.rate,
			total: item.total || 0,
		}));
	}, [ratings]);

	const npsData = useMemo(
		() => [
			{ name: "Promotores", total: nps.promoters || 0, color: colors.promoters },
			{ name: "Neutros", total: nps.passives || 0, color: colors.passives },
			{ name: "Detratores", total: nps.detractors || 0, color: colors.detractors },
		],
		[nps, colors]
	);

	const hasRatings = ratingData.some((item) => item.total > 0);

	const handleExportCsv = () => {
		if (!report) {
			toast.info("Nenhum relatório carregado para exportar.");
			return;
		}

		const lines = [];
		lines.push(csvRow(["Relatório de tickets"]));
		lines.push(csvRow(["Período", `${startDate} a ${endDate}`]));
		lines.push("");

		lines.push(csvRow(["Resumo", "Valor"]));
		lines.push(csvRow(["Total de tickets", summary.total || 0]));
		lines.push(csvRow(["Em atendimento", summary.open || 0]));
		lines.push(csvRow(["Aguardando", summary.pending || 0]));
		lines.push(csvRow(["Resolvidos", summary.closed || 0]));
		lines.push(csvRow(["Taxa de resolução", formatPercent(summary.resolutionRate)]));
		lines.push(csvRow(["Tempo médio 1ª resposta", formatMinutes(summary.avgFirstResponseMinutes)]));
		lines.push(csvRow(["Tempo médio de resolução", formatMinutes(summary.avgResolutionMinutes)]));
		lines.push(csvRow(["Avaliação média", formatDecimal(ratings.average, 2)]));
		lines.push(csvRow(["NPS", isNum(nps.score) ? formatDecimal(nps.score, 0) : DASH]));
		lines.push("");

		lines.push(csvRow(["Atendentes"]));
		lines.push(csvRow(["Atendente", "Total", "Resolvidos", "Taxa de resolução", "Avaliação média"]));
		sortedUsers.forEach((item) => {
			lines.push(
				csvRow([
					item.name,
					item.total || 0,
					item.closed || 0,
					formatPercent(ratio(item.closed, item.total)),
					formatDecimal(item.avgRating, 2),
				])
			);
		});
		if (!sortedUsers.length) lines.push(csvRow(["Sem dados"]));
		lines.push("");

		lines.push(csvRow(["Filas"]));
		lines.push(csvRow(["Fila", "Total", "% do total"]));
		sortedQueues.forEach((item) => {
			lines.push(csvRow([item.name, item.total || 0, formatPercent(ratio(item.total, queueTotal))]));
		});
		if (!sortedQueues.length) lines.push(csvRow(["Sem dados"]));
		lines.push("");

		lines.push(csvRow(["Etiquetas"]));
		lines.push(csvRow(["Etiqueta", "Total"]));
		sortedTags.forEach((item) => {
			lines.push(csvRow([item.name, item.total || 0]));
		});
		if (!sortedTags.length) lines.push(csvRow(["Sem dados"]));

		const csv = `﻿${lines.join("\r\n")}`;
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", `relatorio-tickets-${toIsoDate(new Date())}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		toast.success("Relatório exportado com sucesso!");
	};

	const renderChartSkeleton = () => (
		<div className="grid gap-4 md:grid-cols-2">
			<Skeleton className="h-[320px] w-full rounded-xl" />
			<Skeleton className="h-[320px] w-full rounded-xl" />
		</div>
	);

	return (
		<MainContainer>
			<MainHeader>
				<Title>Relatórios</Title>
				<MainHeaderButtonsWrapper>
					<Button variant="outline" onClick={fetchReport} disabled={loading}>
						<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
						Atualizar
					</Button>
					<Button variant="outline" onClick={handleExportCsv} disabled={loading || !report}>
						<Download className="h-4 w-4" />
						Exportar CSV
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>

			<div className="flex-1 space-y-4 overflow-auto px-6 pb-6">
				{/* Filtros */}
				<div className="rounded-xl border bg-card p-4">
					<div className="grid gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
						<div className="space-y-1.5">
							<Label htmlFor="reports-start">De</Label>
							<Input
								id="reports-start"
								type="date"
								value={startDate}
								max={endDate}
								onChange={(e) => setStartDate(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="reports-end">Até</Label>
							<Input
								id="reports-end"
								type="date"
								value={endDate}
								min={startDate}
								onChange={(e) => setEndDate(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Fila</Label>
							<Select value={queueId} onValueChange={setQueueId}>
								<SelectTrigger>
									<SelectValue placeholder="Todas as filas" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ALL}>Todas as filas</SelectItem>
									{queues.map((queue) => (
										<SelectItem key={queue.id} value={String(queue.id)}>
											{queue.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Atendente</Label>
							<Select value={userId} onValueChange={setUserId}>
								<SelectTrigger>
									<SelectValue placeholder="Todos os atendentes" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ALL}>Todos os atendentes</SelectItem>
									{users.map((user) => (
										<SelectItem key={user.id} value={String(user.id)}>
											{user.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<Button onClick={fetchReport} disabled={loading} className="lg:w-28">
							Aplicar
						</Button>
					</div>
					<div className="mt-3 flex flex-wrap items-center gap-2">
						<span className="text-xs text-muted-foreground">Períodos rápidos:</span>
						<Button variant="outline" size="sm" onClick={() => applyPreset(0)}>
							Hoje
						</Button>
						<Button variant="outline" size="sm" onClick={() => applyPreset(7)}>
							7 dias
						</Button>
						<Button variant="outline" size="sm" onClick={() => applyPreset(30)}>
							30 dias
						</Button>
						<Button variant="outline" size="sm" onClick={() => applyPreset(90)}>
							90 dias
						</Button>
					</div>
				</div>

				{/* KPIs */}
				{loading ? (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
						{[0, 1, 2, 3, 4, 5, 6].map((i) => (
							<Skeleton key={i} className="h-[104px] w-full rounded-xl" />
						))}
					</div>
				) : (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
						<KpiCard
							icon={Ticket}
							label="Total de tickets"
							value={formatNumber(summary.total)}
							hint="No período selecionado"
						/>
						<KpiCard
							icon={BarChart3}
							label="Em atendimento"
							value={formatNumber(summary.open)}
							hint={formatPercent(ratio(summary.open, summary.total))}
						/>
						<KpiCard
							icon={Clock}
							label="Aguardando"
							value={formatNumber(summary.pending)}
							hint={formatPercent(ratio(summary.pending, summary.total))}
						/>
						<KpiCard
							icon={CheckCircle2}
							label="Resolvidos"
							value={formatNumber(summary.closed)}
							hint={formatPercent(ratio(summary.closed, summary.total))}
						/>
						<KpiCard
							icon={TrendingUp}
							label="Taxa de resolução"
							value={formatPercent(summary.resolutionRate)}
							hint="Resolvidos / total"
						/>
						<KpiCard
							icon={Clock}
							label="1ª resposta (média)"
							value={formatMinutes(summary.avgFirstResponseMinutes)}
							hint="Tempo até o primeiro retorno"
						/>
						<KpiCard
							icon={CheckCircle2}
							label="Resolução (média)"
							value={formatMinutes(summary.avgResolutionMinutes)}
							hint="Abertura até o fechamento"
						/>
					</div>
				)}

				{/* Detalhamento */}
				<Tabs defaultValue="overview" className="w-full">
					<TabsList className="flex h-auto flex-wrap justify-start">
						<TabsTrigger value="overview">Visão geral</TabsTrigger>
						<TabsTrigger value="agents">Atendentes</TabsTrigger>
						<TabsTrigger value="queues">Filas &amp; Etiquetas</TabsTrigger>
						<TabsTrigger value="satisfaction">Satisfação</TabsTrigger>
					</TabsList>

					{/* Visão geral */}
					<TabsContent value="overview" className="mt-4 space-y-4">
						{loading ? (
							renderChartSkeleton()
						) : (
							<div className="grid gap-4 xl:grid-cols-2">
								<Panel
									title="Tickets criados x resolvidos"
									description="Evolução diária no período"
								>
									{dayData.length ? (
										<div className="h-[280px] w-full">
											<ResponsiveContainer width="100%" height="100%">
												<AreaChart data={dayData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
													<defs>
														<linearGradient id="reportsCreated" x1="0" y1="0" x2="0" y2="1">
															<stop offset="5%" stopColor={colors.created} stopOpacity={0.35} />
															<stop offset="95%" stopColor={colors.created} stopOpacity={0} />
														</linearGradient>
														<linearGradient id="reportsClosed" x1="0" y1="0" x2="0" y2="1">
															<stop offset="5%" stopColor={colors.closed} stopOpacity={0.35} />
															<stop offset="95%" stopColor={colors.closed} stopOpacity={0} />
														</linearGradient>
													</defs>
													<CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
													<XAxis
														dataKey="label"
														tick={{ fontSize: 11, fill: colors.axis }}
														tickLine={false}
														axisLine={false}
														minTickGap={16}
													/>
													<YAxis
														allowDecimals={false}
														tick={{ fontSize: 11, fill: colors.axis }}
														tickLine={false}
														axisLine={false}
													/>
													<ReTooltip contentStyle={chartTooltipStyle} />
													<Legend wrapperStyle={{ fontSize: 12 }} />
													<Area
														type="monotone"
														dataKey="created"
														name="Criados"
														stroke={colors.created}
														strokeWidth={2}
														fill="url(#reportsCreated)"
													/>
													<Area
														type="monotone"
														dataKey="closed"
														name="Resolvidos"
														stroke={colors.closed}
														strokeWidth={2}
														fill="url(#reportsClosed)"
													/>
												</AreaChart>
											</ResponsiveContainer>
										</div>
									) : (
										<EmptyState>Nenhum ticket no período selecionado.</EmptyState>
									)}
								</Panel>

								<Panel title="Volume por hora do dia" description="Distribuição das aberturas">
									{hourData.length ? (
										<div className="h-[280px] w-full">
											<ResponsiveContainer width="100%" height="100%">
												<BarChart data={hourData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
													<CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
													<XAxis
														dataKey="label"
														tick={{ fontSize: 11, fill: colors.axis }}
														tickLine={false}
														axisLine={false}
														interval={1}
													/>
													<YAxis
														allowDecimals={false}
														tick={{ fontSize: 11, fill: colors.axis }}
														tickLine={false}
														axisLine={false}
													/>
													<ReTooltip cursor={{ fillOpacity: 0.08 }} contentStyle={chartTooltipStyle} />
													<Bar
														dataKey="total"
														name="Tickets"
														fill={colors.volume}
														radius={[4, 4, 0, 0]}
														maxBarSize={22}
													/>
												</BarChart>
											</ResponsiveContainer>
										</div>
									) : (
										<EmptyState>Sem dados de volume por hora.</EmptyState>
									)}
								</Panel>
							</div>
						)}
					</TabsContent>

					{/* Atendentes */}
					<TabsContent value="agents" className="mt-4 space-y-4">
						{loading ? (
							renderChartSkeleton()
						) : (
							<>
								<Panel title="Comparativo de atendimento" description="Total de tickets por atendente">
									{userChartData.length ? (
										<div className="h-[280px] w-full">
											<ResponsiveContainer width="100%" height="100%">
												<BarChart
													data={userChartData}
													layout="vertical"
													margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
												>
													<CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
													<XAxis
														type="number"
														allowDecimals={false}
														tick={{ fontSize: 11, fill: colors.axis }}
														tickLine={false}
														axisLine={false}
													/>
													<YAxis
														type="category"
														dataKey="name"
														width={140}
														tick={{ fontSize: 11, fill: colors.axis }}
														tickLine={false}
														axisLine={false}
													/>
													<ReTooltip cursor={{ fillOpacity: 0.08 }} contentStyle={chartTooltipStyle} />
													<Bar
														dataKey="total"
														name="Tickets"
														fill={colors.created}
														radius={[0, 4, 4, 0]}
														maxBarSize={18}
													/>
												</BarChart>
											</ResponsiveContainer>
										</div>
									) : (
										<EmptyState>Nenhum atendente com tickets no período.</EmptyState>
									)}
								</Panel>

								<div className="rounded-xl border bg-card">
									<Table>
										<TableHeader className="sticky top-0 z-10 bg-card">
											<TableRow>
												<TableHead>Atendente</TableHead>
												<TableHead className="text-center">Total</TableHead>
												<TableHead className="text-center">Resolvidos</TableHead>
												<TableHead className="text-center">Taxa de resolução</TableHead>
												<TableHead className="text-center">Avaliação média</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{sortedUsers.map((item) => (
												<TableRow key={item.userId ?? item.name}>
													<TableCell className="font-medium">{item.name}</TableCell>
													<TableCell className="text-center">{formatNumber(item.total)}</TableCell>
													<TableCell className="text-center text-muted-foreground">
														{formatNumber(item.closed)}
													</TableCell>
													<TableCell className="text-center text-muted-foreground">
														{formatPercent(ratio(item.closed, item.total))}
													</TableCell>
													<TableCell className="text-center">
														<div className="flex justify-center">
															<Stars value={item.avgRating} />
														</div>
													</TableCell>
												</TableRow>
											))}
											{!sortedUsers.length && (
												<TableRow>
													<TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
														Nenhum atendente com tickets no período.
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
								</div>
							</>
						)}
					</TabsContent>

					{/* Filas & Etiquetas */}
					<TabsContent value="queues" className="mt-4 space-y-4">
						{loading ? (
							renderChartSkeleton()
						) : (
							<>
								<div className="grid gap-4 xl:grid-cols-2">
									<Panel title="Distribuição por fila" description="Participação de cada fila no total">
										{sortedQueues.length ? (
											<div className="h-[280px] w-full">
												<ResponsiveContainer width="100%" height="100%">
													<PieChart>
														<Pie
															data={sortedQueues}
															dataKey="total"
															nameKey="name"
															innerRadius={60}
															outerRadius={95}
															paddingAngle={2}
															stroke="none"
														>
															{sortedQueues.map((item, index) => (
																<Cell
																	key={item.queueId ?? `queue-${index}`}
																	fill={item.color || colors.categorical[index % colors.categorical.length]}
																/>
															))}
														</Pie>
														<ReTooltip contentStyle={chartTooltipStyle} />
														<Legend wrapperStyle={{ fontSize: 12 }} />
													</PieChart>
												</ResponsiveContainer>
											</div>
										) : (
											<EmptyState>Nenhuma fila com tickets no período.</EmptyState>
										)}
									</Panel>

									<Panel title="Tickets por fila" description="Volume absoluto e participação">
										{sortedQueues.length ? (
											<div className="max-h-[280px] overflow-auto">
												<Table>
													<TableHeader className="sticky top-0 z-10 bg-card">
														<TableRow>
															<TableHead>Fila</TableHead>
															<TableHead className="text-center">Total</TableHead>
															<TableHead className="text-center">% do total</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{sortedQueues.map((item, index) => (
															<TableRow key={item.queueId ?? `queue-row-${index}`}>
																<TableCell>
																	<div className="flex items-center gap-2">
																		<span
																			className="h-3 w-3 shrink-0 rounded-full border"
																			style={{
																				backgroundColor:
																					item.color ||
																					colors.categorical[index % colors.categorical.length],
																			}}
																		/>
																		<span className="font-medium">{item.name}</span>
																	</div>
																</TableCell>
																<TableCell className="text-center">{formatNumber(item.total)}</TableCell>
																<TableCell className="text-center text-muted-foreground">
																	{formatPercent(ratio(item.total, queueTotal))}
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>
										) : (
											<EmptyState>Nenhuma fila com tickets no período.</EmptyState>
										)}
									</Panel>
								</div>

								<Panel title="Etiquetas mais usadas" description="Contagem de tickets por etiqueta">
									{sortedTags.length ? (
										<>
											<div className="mb-4 flex flex-wrap gap-2">
												{sortedTags.map((tag, index) => (
													<Badge
														key={tag.tagId ?? `tag-${index}`}
														className="border-transparent text-white"
														style={{
															backgroundColor:
																tag.color || colors.categorical[index % colors.categorical.length],
														}}
													>
														{tag.name} · {formatNumber(tag.total)}
													</Badge>
												))}
											</div>
											<div className="h-[280px] w-full">
												<ResponsiveContainer width="100%" height="100%">
													<BarChart
														data={sortedTags.slice(0, 12)}
														margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
													>
														<CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
														<XAxis
															dataKey="name"
															tick={{ fontSize: 11, fill: colors.axis }}
															tickLine={false}
															axisLine={false}
															interval={0}
															height={50}
															angle={-20}
															textAnchor="end"
														/>
														<YAxis
															allowDecimals={false}
															tick={{ fontSize: 11, fill: colors.axis }}
															tickLine={false}
															axisLine={false}
														/>
														<ReTooltip cursor={{ fillOpacity: 0.08 }} contentStyle={chartTooltipStyle} />
														<Bar dataKey="total" name="Tickets" radius={[4, 4, 0, 0]} maxBarSize={40}>
															{sortedTags.slice(0, 12).map((tag, index) => (
																<Cell
																	key={tag.tagId ?? `tag-bar-${index}`}
																	fill={tag.color || colors.categorical[index % colors.categorical.length]}
																/>
															))}
														</Bar>
													</BarChart>
												</ResponsiveContainer>
											</div>
										</>
									) : (
										<EmptyState>Nenhuma etiqueta aplicada no período.</EmptyState>
									)}
								</Panel>
							</>
						)}
					</TabsContent>

					{/* Satisfação */}
					<TabsContent value="satisfaction" className="mt-4 space-y-4">
						{loading ? (
							renderChartSkeleton()
						) : (
							<>
								<div className="grid gap-4 xl:grid-cols-2">
									<Panel
										title="Avaliações (CSAT)"
										description={`${formatNumber(ratings.total)} avaliação(ões) no período`}
										action={
											<div className="text-right">
												<p className="text-2xl font-bold leading-none text-foreground">
													{isNum(ratings.average) ? formatDecimal(ratings.average, 1) : DASH}
												</p>
												<p className="mt-1 text-xs text-muted-foreground">Média geral</p>
											</div>
										}
									>
										{hasRatings ? (
											<div className="h-[280px] w-full">
												<ResponsiveContainer width="100%" height="100%">
													<BarChart data={ratingData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
														<CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
														<XAxis
															dataKey="label"
															tick={{ fontSize: 12, fill: colors.axis }}
															tickLine={false}
															axisLine={false}
														/>
														<YAxis
															allowDecimals={false}
															tick={{ fontSize: 11, fill: colors.axis }}
															tickLine={false}
															axisLine={false}
														/>
														<ReTooltip cursor={{ fillOpacity: 0.08 }} contentStyle={chartTooltipStyle} />
														<Bar dataKey="total" name="Avaliações" radius={[4, 4, 0, 0]} maxBarSize={48}>
															{ratingData.map((item) => (
																<Cell
																	key={item.rate}
																	fill={colors.rating[Math.min(Math.max(item.rate, 1), 5) - 1]}
																/>
															))}
														</Bar>
													</BarChart>
												</ResponsiveContainer>
											</div>
										) : (
											<EmptyState>Sem dados de avaliação no período.</EmptyState>
										)}
									</Panel>

									<Panel
										title="NPS"
										description={`${formatNumber(nps.total)} resposta(s) considerada(s)`}
										action={
											<div className="text-right">
												<p className="text-2xl font-bold leading-none text-foreground">
													{isNum(nps.score) ? formatDecimal(nps.score, 0) : DASH}
												</p>
												<p className="mt-1 text-xs text-muted-foreground">
													{isNum(nps.score) ? "Score NPS" : "Sem dados"}
												</p>
											</div>
										}
									>
										{nps.total > 0 ? (
											<div className="h-[280px] w-full">
												<ResponsiveContainer width="100%" height="100%">
													<BarChart
														data={npsData}
														layout="vertical"
														margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
													>
														<CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
														<XAxis
															type="number"
															allowDecimals={false}
															tick={{ fontSize: 11, fill: colors.axis }}
															tickLine={false}
															axisLine={false}
														/>
														<YAxis
															type="category"
															dataKey="name"
															width={100}
															tick={{ fontSize: 12, fill: colors.axis }}
															tickLine={false}
															axisLine={false}
														/>
														<ReTooltip cursor={{ fillOpacity: 0.08 }} contentStyle={chartTooltipStyle} />
														<Bar dataKey="total" name="Respostas" radius={[0, 4, 4, 0]} maxBarSize={28}>
															{npsData.map((item) => (
																<Cell key={item.name} fill={item.color} />
															))}
														</Bar>
													</BarChart>
												</ResponsiveContainer>
											</div>
										) : (
											<EmptyState>Sem dados de NPS no período.</EmptyState>
										)}
									</Panel>
								</div>

								<div className="grid gap-3 sm:grid-cols-3">
									{npsData.map((item) => (
										<div key={item.name} className="rounded-xl border bg-card p-4">
											<div className="flex items-center gap-2">
												<span
													className="h-3 w-3 rounded-full"
													style={{ backgroundColor: item.color }}
												/>
												<span className="text-xs font-medium text-muted-foreground">{item.name}</span>
											</div>
											<p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
												{formatNumber(item.total)}
											</p>
											<p className="mt-1 text-xs text-muted-foreground">
												{formatPercent(ratio(item.total, nps.total))}
											</p>
										</div>
									))}
								</div>
							</>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</MainContainer>
	);
};

export default Reports;
