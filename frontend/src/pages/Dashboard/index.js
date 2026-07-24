import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { format, parseISO, startOfDay, subDays } from "date-fns";
import {
	Activity,
	CheckCircle2,
	Clock,
	Gauge as GaugeIcon,
	Hash,
	Inbox,
	Layers,
	MessageCircle,
	Smile,
	Star,
	Tag,
	Timer,
	TrendingUp,
	Users,
} from "lucide-react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { Card, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../components/ui/table";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import useTickets from "../../hooks/useTickets";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useThemeContext } from "../../context/DarkMode";

import {
	AXIS_COLOR,
	ChartCard,
	RadialRings,
	HourRadar,
	SectionHeader,
	DASH,
	EmptyState,
	Gauge,
	STATUS,
	SURFACE,
	TooltipBox,
	formatDecimal,
	formatMinutes,
	formatNumber,
	formatPercent,
	gridColor,
	makeTooltip,
	seriesColor,
} from "./charts";

/* ------------------------------------------------------------------ */
/* Períodos                                                            */
/* ------------------------------------------------------------------ */

const PERIODS = [
	{ value: "today", label: "Hoje", days: 0 },
	{ value: "7", label: "7 dias", days: 6 },
	{ value: "30", label: "30 dias", days: 29 },
	{ value: "90", label: "90 dias", days: 89 },
];

const EMPTY_REPORT = {
	summary: {},
	byDay: [],
	byHour: [],
	byQueue: [],
	byUser: [],
	byTag: [],
	ratings: { total: 0, average: null, distribution: [] },
	nps: { total: 0, score: null, promoters: 0, passives: 0, detractors: 0 },
};

const buildRange = (periodValue) => {
	const period = PERIODS.find((item) => item.value === periodValue) || PERIODS[2];
	const now = new Date();
	return {
		startDate: format(startOfDay(subDays(now, period.days)), "yyyy-MM-dd"),
		endDate: format(now, "yyyy-MM-dd"),
		label: period.label,
	};
};

const safeDate = (value) => {
	try {
		return format(parseISO(value), "dd/MM");
	} catch (err) {
		return value;
	}
};

/* ------------------------------------------------------------------ */
/* KPI                                                                 */
/* ------------------------------------------------------------------ */

const TONES = {
	slate: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
	blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
	emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const ACCENTS = {
	slate: "bg-slate-400 dark:bg-slate-500",
	blue: "bg-blue-500",
	amber: "bg-amber-500",
	emerald: "bg-emerald-500",
};

const KpiCard = ({ icon: Icon, label, value, hint, tone }) => (
	<Card className="relative overflow-hidden">
		<span className={`absolute inset-y-0 left-0 w-1 ${ACCENTS[tone]}`} />
		<CardContent className="flex items-start gap-4 p-5 pl-6">
			<span
				className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}
			>
				<Icon className="h-5 w-5" />
			</span>
			<div className="min-w-0">
				<p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
					{label}
				</p>
				<p className="mt-1 text-3xl font-bold leading-none tracking-tight tabular-nums">
					{value}
				</p>
				{hint ? (
					<p className="mt-1.5 truncate text-xs text-muted-foreground">{hint}</p>
				) : null}
			</div>
		</CardContent>
	</Card>
);

const StatTile = ({ icon: Icon, label, value, hint }) => (
	<div className="rounded-lg border bg-background/40 p-4">
		<div className="flex items-center gap-2 text-muted-foreground">
			<Icon className="h-4 w-4" />
			<span className="text-xs font-medium">{label}</span>
		</div>
		<p className="mt-2 text-2xl font-bold leading-none tracking-tight tabular-nums">
			{value}
		</p>
		{hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
	</div>
);

const LegendDot = ({ color, label, value }) => (
	<div className="flex items-center gap-2 text-xs">
		<span
			className="h-2.5 w-2.5 shrink-0 rounded-full"
			style={{ backgroundColor: color }}
		/>
		<span className="truncate text-muted-foreground">{label}</span>
		<span className="ml-auto font-semibold tabular-nums">{value}</span>
	</div>
);

const dayTooltip = makeTooltip((label) => safeDate(label));
const hourTooltip = makeTooltip((label) => `${String(label).padStart(2, "0")}:00`);

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

const Dashboard = () => {
	const { user } = useContext(AuthContext);
	const { darkMode } = useThemeContext();

	const [period, setPeriod] = useState("30");
	const [report, setReport] = useState(null);
	const [loading, setLoading] = useState(true);

	const range = useMemo(() => buildRange(period), [period]);

	const userQueueIds = useMemo(() => {
		if (user && user.queues && user.queues.length > 0) {
			return user.queues.map((q) => q.id);
		}
		return [];
	}, [user]);

	const queueIdsParam = useMemo(
		() => JSON.stringify(userQueueIds),
		[userQueueIds]
	);

	// Contadores "agora" (tempo real) — independentes do período do relatório.
	const { count: liveOpen } = useTickets({
		status: "open",
		showAll: "true",
		withUnreadMessages: "false",
		queueIds: queueIdsParam,
	});
	const { count: livePending } = useTickets({
		status: "pending",
		showAll: "true",
		withUnreadMessages: "false",
		queueIds: queueIdsParam,
	});

	const fetchReport = useCallback(
		async (signal) => {
			setLoading(true);
			try {
				const { data } = await api.get("/reports/tickets", {
					params: { startDate: range.startDate, endDate: range.endDate },
				});
				if (signal && signal.cancelled) return;
				setReport(data || EMPTY_REPORT);
			} catch (err) {
				if (signal && signal.cancelled) return;
				setReport(EMPTY_REPORT);
				toastError(err);
			} finally {
				if (!signal || !signal.cancelled) setLoading(false);
			}
		},
		[range.startDate, range.endDate]
	);

	useEffect(() => {
		const signal = { cancelled: false };
		fetchReport(signal);
		return () => {
			signal.cancelled = true;
		};
	}, [fetchReport]);

	const data = report || EMPTY_REPORT;
	const summary = data.summary || {};
	const ratings = data.ratings || EMPTY_REPORT.ratings;
	const nps = data.nps || EMPTY_REPORT.nps;

	const blue = seriesColor("blue", darkMode);
	const aqua = seriesColor("aqua", darkMode);
	const violet = seriesColor("violet", darkMode);
	const grid = gridColor(darkMode);

	const byDay = useMemo(
		() => (Array.isArray(data.byDay) ? data.byDay : []),
		[data.byDay]
	);

	const byHour = useMemo(() => {
		const source = Array.isArray(data.byHour) ? data.byHour : [];
		if (source.length === 0) return [];
		const map = new Map(source.map((item) => [Number(item.hour), Number(item.total) || 0]));
		return Array.from({ length: 24 }, (_, hour) => ({
			hour,
			total: map.get(hour) || 0,
		}));
	}, [data.byHour]);

	const hasHourData = useMemo(
		() => byHour.some((item) => item.total > 0),
		[byHour]
	);

	const byQueue = useMemo(() => {
		const source = Array.isArray(data.byQueue) ? data.byQueue : [];
		return source
			.map((item, index) => ({
				...item,
				key: item.queueId === null || item.queueId === undefined
					? `sem-fila-${index}`
					: `fila-${item.queueId}`,
				total: Number(item.total) || 0,
				color: item.color || "#94a3b8",
			}))
			.filter((item) => item.total > 0)
			.sort((a, b) => b.total - a.total);
	}, [data.byQueue]);

	const queueTotal = useMemo(
		() => byQueue.reduce((acc, item) => acc + item.total, 0),
		[byQueue]
	);

	const byTag = useMemo(() => {
		const source = Array.isArray(data.byTag) ? data.byTag : [];
		return source
			.map((item, index) => ({
				...item,
				key: `tag-${item.tagId != null ? item.tagId : index}`,
				total: Number(item.total) || 0,
				color: item.color || "#94a3b8",
			}))
			.filter((item) => item.total > 0)
			.sort((a, b) => b.total - a.total)
			.slice(0, 8);
	}, [data.byTag]);

	const tagMax = byTag.length > 0 ? byTag[0].total : 0;

	const byUser = useMemo(() => {
		const source = Array.isArray(data.byUser) ? data.byUser : [];
		return source
			.map((item, index) => ({
				...item,
				key: `user-${item.userId != null ? item.userId : `na-${index}`}`,
				name: item.name || "Não atribuído",
				total: Number(item.total) || 0,
				closed: Number(item.closed) || 0,
			}))
			.sort((a, b) => b.total - a.total);
	}, [data.byUser]);

	const ratingDistribution = useMemo(() => {
		const source = Array.isArray(ratings.distribution) ? ratings.distribution : [];
		const map = new Map(source.map((item) => [Number(item.rate), Number(item.total) || 0]));
		return [5, 4, 3, 2, 1].map((rate) => ({ rate, total: map.get(rate) || 0 }));
	}, [ratings.distribution]);

	const ratingMax = useMemo(
		() => ratingDistribution.reduce((acc, item) => Math.max(acc, item.total), 0),
		[ratingDistribution]
	);

	const npsScore = nps.score;
	const hasNps = npsScore !== null && npsScore !== undefined && Number.isFinite(Number(npsScore));
	const npsGaugeValue = hasNps ? (Number(npsScore) + 100) / 2 : null;

	const hasCsat = ratings.average !== null && ratings.average !== undefined;

	const firstLoad = loading && !report;

	/* ---------------------------------------------------------------- */

	return (
		<div className="w-full px-4 py-6 sm:px-6 lg:px-8">
			{/* Cabeçalho */}
			<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Indicadores de atendimento de{" "}
						<span className="font-medium text-foreground">{safeDate(range.startDate)}</span>{" "}
						a{" "}
						<span className="font-medium text-foreground">{safeDate(range.endDate)}</span>.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs">
						<span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
						<span className="text-muted-foreground">Em atendimento agora</span>
						<span className="font-semibold tabular-nums">{formatNumber(liveOpen)}</span>
					</span>
					<span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs">
						<span className="h-2 w-2 rounded-full bg-amber-500" />
						<span className="text-muted-foreground">Na fila agora</span>
						<span className="font-semibold tabular-nums">{formatNumber(livePending)}</span>
					</span>

					<Select value={period} onValueChange={setPeriod}>
						<SelectTrigger className="h-9 w-[140px] bg-card">
							<SelectValue placeholder="Período" />
						</SelectTrigger>
						<SelectContent>
							{PERIODS.map((item) => (
								<SelectItem key={item.value} value={item.value}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{firstLoad ? (
				<div className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						{[0, 1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-[104px] rounded-xl" />
						))}
					</div>
					<div className="grid gap-4 md:grid-cols-3">
						{[0, 1, 2].map((i) => (
							<Skeleton key={i} className="h-[300px] rounded-xl" />
						))}
					</div>
					<div className="grid gap-4 xl:grid-cols-3">
						<Skeleton className="h-[340px] rounded-xl xl:col-span-2" />
						<Skeleton className="h-[340px] rounded-xl" />
					</div>
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{[0, 1, 2].map((i) => (
							<Skeleton key={i} className="h-[300px] rounded-xl" />
						))}
					</div>
				</div>
			) : (
				<div
					className={`space-y-4 transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}
				>
					{/* KPIs */}
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<KpiCard
							icon={Inbox}
							tone="slate"
							label="Total de tickets"
							value={formatNumber(summary.total || 0)}
							hint={`Período: ${range.label.toLowerCase()}`}
						/>
						<KpiCard
							icon={MessageCircle}
							tone="blue"
							label="Em atendimento"
							value={formatNumber(summary.open || 0)}
							hint="Tickets abertos no período"
						/>
						<KpiCard
							icon={Clock}
							tone="amber"
							label="Aguardando"
							value={formatNumber(summary.pending || 0)}
							hint="Na fila, sem atendente"
						/>
						<KpiCard
							icon={CheckCircle2}
							tone="emerald"
							label="Resolvidos"
							value={formatNumber(summary.closed || 0)}
							hint={`Taxa de resolução: ${formatPercent(summary.resolutionRate)}`}
						/>
					</div>

					{/* Qualidade */}
					<SectionHeader
						icon={GaugeIcon}
						title="Qualidade do atendimento"
						description="Resolução, satisfação e recomendação no período"
					/>
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						<ChartCard
							title="Taxa de resolução"
							description="Tickets resolvidos sobre o total do período"
							icon={GaugeIcon}
						>
							<Gauge
								value={summary.resolutionRate}
								max={100}
								color={blue}
								display={formatPercent(summary.resolutionRate)}
								caption="resolvidos"
								hint={`${formatNumber(summary.closed || 0)} de ${formatNumber(
									summary.total || 0
								)} tickets`}
								height={210}
							/>
						</ChartCard>

						<ChartCard
							title="Satisfação (CSAT)"
							description="Média das avaliações de 1 a 5"
							icon={Smile}
						>
							<Gauge
								value={ratings.average}
								max={5}
								color={aqua}
								display={hasCsat ? formatDecimal(ratings.average, 1) : DASH}
								caption={hasCsat ? "de 5,0" : "Sem dados"}
								hint={`${formatNumber(ratings.total || 0)} avaliações`}
								height={210}
							/>
							<div className="mt-3 space-y-1.5">
								{ratingDistribution.map((item) => (
									<div key={item.rate} className="flex items-center gap-2">
										<span className="flex w-8 shrink-0 items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
											{item.rate}
											<Star className="h-3 w-3" />
										</span>
										<span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
											<span
												className="block h-full rounded-full"
												style={{
													width: `${ratingMax > 0 ? (item.total / ratingMax) * 100 : 0}%`,
													backgroundColor: aqua,
												}}
											/>
										</span>
										<span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums">
											{formatNumber(item.total)}
										</span>
									</div>
								))}
							</div>
						</ChartCard>

						<ChartCard
							title="NPS"
							description="Net Promoter Score (-100 a 100)"
							icon={TrendingUp}
						>
							<Gauge
								value={npsGaugeValue}
								max={100}
								color={violet}
								display={hasNps ? formatNumber(Math.round(Number(npsScore))) : DASH}
								caption={hasNps ? "score" : "Sem dados"}
								hint={`${formatNumber(nps.total || 0)} respostas`}
								height={210}
							/>
							<div className="mt-3 space-y-1.5">
								<LegendDot
									color={STATUS.good}
									label="Promotores"
									value={formatNumber(nps.promoters || 0)}
								/>
								<LegendDot
									color={STATUS.warning}
									label="Neutros"
									value={formatNumber(nps.passives || 0)}
								/>
								<LegendDot
									color={STATUS.critical}
									label="Detratores"
									value={formatNumber(nps.detractors || 0)}
								/>
							</div>
						</ChartCard>
					</div>

					{/* Evolução */}
					<SectionHeader
						icon={Activity}
						title="Evolução e velocidade"
						description="Volume ao longo do tempo e tempos médios de atendimento"
					/>
					<div className="grid gap-4 xl:grid-cols-3">
						<ChartCard
							className="xl:col-span-2"
							title="Evolução no período"
							description="Tickets criados e resolvidos por dia"
							icon={Activity}
							action={
								<div className="flex shrink-0 items-center gap-3 text-xs">
									<span className="flex items-center gap-1.5">
										<span
											className="h-2.5 w-2.5 rounded-full"
											style={{ backgroundColor: blue }}
										/>
										<span className="text-muted-foreground">Criados</span>
									</span>
									<span className="flex items-center gap-1.5">
										<span
											className="h-2.5 w-2.5 rounded-full"
											style={{ backgroundColor: aqua }}
										/>
										<span className="text-muted-foreground">Resolvidos</span>
									</span>
								</div>
							}
						>
							{byDay.length === 0 ? (
								<EmptyState className="h-[260px]" />
							) : (
								<div className="h-[260px] w-full">
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart
											data={byDay}
											margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
										>
											<defs>
												<linearGradient id="dashCreated" x1="0" y1="0" x2="0" y2="1">
													<stop offset="0%" stopColor={blue} stopOpacity={0.35} />
													<stop offset="100%" stopColor={blue} stopOpacity={0.02} />
												</linearGradient>
												<linearGradient id="dashClosed" x1="0" y1="0" x2="0" y2="1">
													<stop offset="0%" stopColor={aqua} stopOpacity={0.3} />
													<stop offset="100%" stopColor={aqua} stopOpacity={0.02} />
												</linearGradient>
											</defs>
											<CartesianGrid
												strokeDasharray="3 3"
												stroke={grid}
												vertical={false}
											/>
											<XAxis
												dataKey="date"
												tickFormatter={safeDate}
												stroke={AXIS_COLOR}
												fontSize={11}
												tickLine={false}
												axisLine={false}
												minTickGap={24}
											/>
											<YAxis
												allowDecimals={false}
												stroke={AXIS_COLOR}
												fontSize={11}
												tickLine={false}
												axisLine={false}
												width={32}
											/>
											<Tooltip
												content={dayTooltip}
												cursor={{ stroke: AXIS_COLOR, strokeOpacity: 0.35 }}
											/>
											<Area
												type="monotone"
												dataKey="created"
												name="Criados"
												stroke={blue}
												strokeWidth={2}
												fill="url(#dashCreated)"
												dot={false}
												activeDot={{ r: 4, strokeWidth: 2, stroke: SURFACE }}
											/>
											<Area
												type="monotone"
												dataKey="closed"
												name="Resolvidos"
												stroke={aqua}
												strokeWidth={2}
												fill="url(#dashClosed)"
												dot={false}
												activeDot={{ r: 4, strokeWidth: 2, stroke: SURFACE }}
											/>
										</AreaChart>
									</ResponsiveContainer>
								</div>
							)}
						</ChartCard>

						<ChartCard
							title="Tempo médio"
							description="Velocidade de resposta e de resolução"
							icon={Timer}
						>
							<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
								<StatTile
									icon={Clock}
									label="Primeira resposta"
									value={formatMinutes(summary.avgFirstResponseMinutes)}
									hint="Da abertura até a primeira mensagem do atendente"
								/>
								<StatTile
									icon={CheckCircle2}
									label="Resolução"
									value={formatMinutes(summary.avgResolutionMinutes)}
									hint="Da abertura até o encerramento do ticket"
								/>
							</div>
							<div className="mt-3 rounded-lg border border-dashed p-4">
								<div className="flex items-center gap-2 text-muted-foreground">
									<Users className="h-4 w-4" />
									<span className="text-xs font-medium">Atendentes ativos</span>
								</div>
								<p className="mt-2 text-2xl font-bold leading-none tracking-tight tabular-nums">
									{formatNumber(byUser.filter((item) => item.total > 0).length)}
								</p>
							</div>
						</ChartCard>
					</div>

					{/* Distribuições */}
					<SectionHeader
						icon={Layers}
						title="Distribuição"
						description="Como os tickets se espalham entre filas, horários e etiquetas"
					/>
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						<ChartCard
							title="Tickets por fila"
							description="Distribuição entre as filas de atendimento"
							icon={Layers}
						>
							{byQueue.length === 0 ? (
								<EmptyState className="h-[220px]" />
							) : (
								<>
									<RadialRings
										items={byQueue}
										height={230}
										centerValue={formatNumber(queueTotal)}
										centerCaption="tickets"
									/>
									<div className="mt-3 space-y-1.5">
										{byQueue.slice(0, 6).map((item) => (
											<LegendDot
												key={item.key}
												color={item.color}
												label={item.name}
												value={formatNumber(item.total)}
											/>
										))}
									</div>
								</>
							)}
						</ChartCard>

						<ChartCard
							title="Pico por hora"
							description="Distribuição cíclica das aberturas ao longo do dia"
							icon={Hash}
						>
							{!hasHourData ? (
								<EmptyState className="h-[220px]" />
							) : (
								<HourRadar data={byHour} color={blue} grid={grid} height={280} />
							)}
						</ChartCard>

						<ChartCard
							title="Tags mais usadas"
							description="Etiquetas com maior volume no período"
							icon={Tag}
						>
							{byTag.length === 0 ? (
								<EmptyState className="h-[220px]" />
							) : (
								<>
									<RadialRings
										items={byTag}
										height={230}
										centerValue={formatNumber(byTag.length)}
										centerCaption={byTag.length === 1 ? "etiqueta" : "etiquetas"}
									/>
									<div className="mt-3 space-y-1.5">
										{byTag.slice(0, 6).map((item) => (
											<LegendDot
												key={item.key}
												color={item.color}
												label={item.name}
												value={formatNumber(item.total)}
											/>
										))}
									</div>
								</>
							)}
						</ChartCard>
					</div>

					{/* Equipe */}
					<SectionHeader
						icon={Users}
						title="Equipe"
						description="Desempenho individual dos atendentes no período"
					/>
					<ChartCard
						title="Ranking de atendentes"
						description="Ordenado por volume de tickets no período"
						icon={Users}
						bodyClassName="px-0 pb-0"
					>
						{byUser.length === 0 ? (
							<div className="px-5 pb-5">
								<EmptyState className="min-h-[140px]" />
							</div>
						) : (
							<div className="w-full overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-12 pl-5">#</TableHead>
											<TableHead>Atendente</TableHead>
											<TableHead className="text-right">Total</TableHead>
											<TableHead className="text-right">Resolvidos</TableHead>
											<TableHead className="text-right">Taxa</TableHead>
											<TableHead className="pr-5 text-right">Avaliação</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{byUser.map((item, index) => {
											const rate =
												item.total > 0 ? Math.round((item.closed / item.total) * 100) : null;
											return (
												<TableRow key={item.key}>
													<TableCell className="pl-5 text-xs text-muted-foreground tabular-nums">
														{index + 1}
													</TableCell>
													<TableCell className="font-medium">
														<div className="flex items-center gap-2">
															<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold uppercase text-muted-foreground">
																{item.name.slice(0, 2)}
															</span>
															<span className="truncate">{item.name}</span>
														</div>
													</TableCell>
													<TableCell className="text-right tabular-nums">
														{formatNumber(item.total)}
													</TableCell>
													<TableCell className="text-right tabular-nums">
														{formatNumber(item.closed)}
													</TableCell>
													<TableCell className="text-right text-muted-foreground tabular-nums">
														{rate === null ? DASH : `${rate}%`}
													</TableCell>
													<TableCell className="pr-5 text-right">
														{item.avgRating === null || item.avgRating === undefined ? (
															<span className="text-muted-foreground">{DASH}</span>
														) : (
															<span className="inline-flex items-center gap-1 font-medium tabular-nums">
																<Star
																	className="h-3.5 w-3.5"
																	style={{ color: STATUS.warning }}
																/>
																{formatDecimal(item.avgRating, 1)}
															</span>
														)}
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</div>
						)}
					</ChartCard>
				</div>
			)}
		</div>
	);
};

export default Dashboard;
