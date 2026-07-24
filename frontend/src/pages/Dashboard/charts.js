import React from "react";
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	RadialBar,
	RadialBarChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

import { Card, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { cn } from "../../lib/utils";

/**
 * Paleta de séries validada para os dois temas (claro/escuro).
 * As cores só são usadas nas séries de dados — todo o "chrome" do gráfico
 * (fundo, borda, grade, tooltip) vem de tokens Tailwind, para funcionar
 * corretamente com a classe `.dark` no <html>.
 */
export const SERIES = {
	blue: { light: "#2a78d6", dark: "#3987e5" },
	aqua: { light: "#1baf7a", dark: "#199e70" },
	violet: { light: "#4a3aa7", dark: "#9085e9" },
	orange: { light: "#eb6834", dark: "#d95926" },
};

export const STATUS = {
	good: "#0ca30c",
	warning: "#fab219",
	critical: "#d03b3b",
};

export const seriesColor = (name, darkMode) =>
	darkMode ? SERIES[name].dark : SERIES[name].light;

/** Cor de eixos/rótulos — invariante entre temas, legível nos dois fundos. */
export const AXIS_COLOR = "#898781";

export const gridColor = (darkMode) => (darkMode ? "#2c2c2a" : "#e1e0d9");

/** Superfície do card — usada como "respiro" de 2px entre fatias/barras. */
export const SURFACE = "hsl(var(--card))";

export const TRACK = "hsl(var(--muted))";

/* ------------------------------------------------------------------ */
/* Formatadores                                                        */
/* ------------------------------------------------------------------ */

export const DASH = "—";

export const formatMinutes = (value) => {
	if (value === null || value === undefined || value === "") return DASH;
	const num = Number(value);
	if (!Number.isFinite(num) || num < 0) return DASH;

	const total = Math.round(num);
	if (total === 0) return "< 1 min";
	if (total < 60) return `${total} min`;

	const hours = Math.floor(total / 60);
	const minutes = total % 60;
	if (hours < 24) return minutes ? `${hours}h ${minutes}min` : `${hours}h`;

	const days = Math.floor(hours / 24);
	const restHours = hours % 24;
	return restHours ? `${days}d ${restHours}h` : `${days}d`;
};

export const formatNumber = (value) => {
	const num = Number(value);
	if (!Number.isFinite(num)) return DASH;
	return num.toLocaleString("pt-BR");
};

export const formatDecimal = (value, digits = 1) => {
	if (value === null || value === undefined || value === "") return DASH;
	const num = Number(value);
	if (!Number.isFinite(num)) return DASH;
	return num.toLocaleString("pt-BR", {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	});
};

export const formatPercent = (value) => {
	if (value === null || value === undefined || value === "") return DASH;
	const num = Number(value);
	if (!Number.isFinite(num)) return DASH;
	return `${Math.round(num)}%`;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/* ------------------------------------------------------------------ */
/* Blocos de layout                                                    */
/* ------------------------------------------------------------------ */

export const ChartCard = ({
	title,
	description,
	icon: Icon,
	action,
	className,
	bodyClassName,
	children,
}) => (
	<Card className={cn("flex flex-col overflow-hidden", className)}>
		<div className="flex items-start justify-between gap-3 p-5 pb-3">
			<div className="flex min-w-0 items-start gap-3">
				{Icon ? (
					<span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
						<Icon className="h-4 w-4" />
					</span>
				) : null}
				<div className="min-w-0">
					<h2 className="truncate text-sm font-semibold tracking-tight">{title}</h2>
					{description ? (
						<p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
					) : null}
				</div>
			</div>
			{action}
		</div>
		<CardContent className={cn("flex-1 px-5 pb-5 pt-0", bodyClassName)}>
			{children}
		</CardContent>
	</Card>
);

export const EmptyState = ({ message = "Sem dados no período", className }) => (
	<div
		className={cn(
			"flex h-full min-h-[160px] w-full flex-col items-center justify-center rounded-lg border border-dashed text-center",
			className
		)}
	>
		<p className="px-4 text-sm text-muted-foreground">{message}</p>
	</div>
);

export const ChartSkeleton = ({ className }) => (
	<div className={cn("space-y-3", className)}>
		<Skeleton className="h-[200px] w-full rounded-lg" />
		<Skeleton className="h-3 w-2/3" />
	</div>
);

/* ------------------------------------------------------------------ */
/* Tooltip                                                             */
/* ------------------------------------------------------------------ */

export const TooltipBox = ({ label, rows }) => (
	<div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
		{label ? (
			<p className="mb-1 text-xs font-semibold tracking-tight">{label}</p>
		) : null}
		<div className="space-y-1">
			{rows.map((row) => (
				<div key={row.key} className="flex items-center gap-2 text-xs">
					{row.color ? (
						<span
							className="h-2 w-2 shrink-0 rounded-full"
							style={{ backgroundColor: row.color }}
						/>
					) : null}
					<span className="text-muted-foreground">{row.name}</span>
					<span className="ml-auto font-semibold tabular-nums">{row.value}</span>
				</div>
			))}
		</div>
	</div>
);

/** Conteúdo genérico de tooltip para gráficos cartesianos. */
export const makeTooltip = (formatLabel) =>
	function ChartTooltipContent({ active, payload, label }) {
		if (!active || !payload || payload.length === 0) return null;
		return (
			<TooltipBox
				label={formatLabel ? formatLabel(label, payload) : label}
				rows={payload.map((item, index) => ({
					key: `${item.dataKey || item.name}-${index}`,
					name: item.name,
					color: item.color || item.fill,
					value: formatNumber(item.value),
				}))}
			/>
		);
	};

/* ------------------------------------------------------------------ */
/* Gauge radial                                                        */
/* ------------------------------------------------------------------ */

/**
 * Gauge radial padrão do recharts: o preenchimento é controlado pelo
 * PolarAngleAxis com domain=[0, max] e tick={false}; o valor central é um
 * div absolutamente posicionado sobre o SVG.
 */
export const Gauge = ({
	value,
	max = 100,
	color,
	display,
	caption,
	hint,
	height = 200,
}) => {
	const hasValue = value !== null && value !== undefined && Number.isFinite(Number(value));
	const filled = hasValue ? clamp(Number(value), 0, max) : 0;
	const data = [{ name: "valor", value: filled }];

	return (
		<div className="relative w-full" style={{ height }}>
			<ResponsiveContainer width="100%" height="100%">
				<RadialBarChart
					data={data}
					innerRadius="74%"
					outerRadius="100%"
					startAngle={90}
					endAngle={-270}
					barSize={14}
				>
					<PolarAngleAxis
						type="number"
						domain={[0, max]}
						angleAxisId={0}
						tick={false}
					/>
					<RadialBar
						angleAxisId={0}
						dataKey="value"
						background={{ fill: TRACK }}
						cornerRadius={10}
						fill={hasValue ? color : TRACK}
						isAnimationActive={false}
					/>
				</RadialBarChart>
			</ResponsiveContainer>

			<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
				<span className="text-3xl font-bold leading-none tracking-tight tabular-nums">
					{display}
				</span>
				{caption ? (
					<span className="mt-1.5 text-xs text-muted-foreground">{caption}</span>
				) : null}
				{hint ? (
					<span className="mt-0.5 text-[11px] text-muted-foreground/80">{hint}</span>
				) : null}
			</div>
		</div>
	);
};

/* ------------------------------------------------------------------ */
/* Gráficos radiais de distribuição                                    */
/* ------------------------------------------------------------------ */

/**
 * Anéis radiais concêntricos: um anel por categoria, cada um com a cor da
 * própria categoria e comprimento proporcional ao maior valor da série.
 * Substitui a rosca (pizza) mantendo a leitura de ranking.
 *
 * items: [{ key, name, total, color }]
 */
export const RadialRings = ({
	items,
	height = 230,
	centerValue,
	centerCaption,
	maxRings = 6,
}) => {
	const visible = items.slice(0, maxRings);
	const max = visible.reduce((acc, item) => Math.max(acc, item.total), 0) || 1;

	// O recharts desenha o primeiro item no anel mais externo; invertemos para
	// que a categoria com maior volume fique na borda.
	const data = visible.map((item) => ({
		name: item.name,
		value: item.total,
		fill: item.color,
	}));

	return (
		<div className="relative w-full" style={{ height }}>
			<ResponsiveContainer width="100%" height="100%">
				<RadialBarChart
					data={data}
					innerRadius="32%"
					outerRadius="100%"
					startAngle={90}
					endAngle={-270}
					barSize={12}
				>
					<PolarAngleAxis
						type="number"
						domain={[0, max]}
						angleAxisId={0}
						tick={false}
					/>
					<RadialBar
						angleAxisId={0}
						dataKey="value"
						background={{ fill: TRACK }}
						cornerRadius={8}
						isAnimationActive={false}
					/>
					<Tooltip
						content={function RingTooltip({ active, payload }) {
							if (!active || !payload || payload.length === 0) return null;
							const item = payload[0];
							return (
								<TooltipBox
									rows={[
										{
											key: "ring",
											name: item.payload && item.payload.name,
											color: item.payload && item.payload.fill,
											value: formatNumber(item.value),
										},
									]}
								/>
							);
						}}
					/>
				</RadialBarChart>
			</ResponsiveContainer>

			{centerValue !== undefined ? (
				<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
					<span className="text-2xl font-bold leading-none tracking-tight tabular-nums">
						{centerValue}
					</span>
					{centerCaption ? (
						<span className="mt-1 text-xs text-muted-foreground">
							{centerCaption}
						</span>
					) : null}
				</div>
			) : null}
		</div>
	);
};

/**
 * Radar polar para dados cíclicos (horas do dia). A forma circular
 * comunica a natureza cíclica melhor que barras lineares.
 *
 * data: [{ hour, total }]
 */
export const HourRadar = ({ data, color, grid, height = 260 }) => {
	const chartData = data.map((item) => ({
		...item,
		label: `${String(item.hour).padStart(2, "0")}h`,
	}));

	return (
		<div className="w-full" style={{ height }}>
			<ResponsiveContainer width="100%" height="100%">
				<RadarChart data={chartData} outerRadius="72%">
					<PolarGrid stroke={grid} />
					<PolarAngleAxis
						dataKey="label"
						tick={{ fill: AXIS_COLOR, fontSize: 10 }}
						tickLine={false}
					/>
					<PolarRadiusAxis
						tick={{ fill: AXIS_COLOR, fontSize: 10 }}
						axisLine={false}
						allowDecimals={false}
					/>
					<Radar
						name="Tickets"
						dataKey="total"
						stroke={color}
						strokeWidth={2}
						fill={color}
						fillOpacity={0.28}
						isAnimationActive={false}
					/>
					<Tooltip
						content={function HourTooltip({ active, payload }) {
							if (!active || !payload || payload.length === 0) return null;
							const item = payload[0];
							return (
								<TooltipBox
									label={`${item.payload && item.payload.label}`}
									rows={[
										{
											key: "hour",
											name: "Tickets",
											color,
											value: formatNumber(item.value),
										},
									]}
								/>
							);
						}}
					/>
				</RadarChart>
			</ResponsiveContainer>
		</div>
	);
};

/** Cabeçalho de seção — organiza o dashboard em blocos temáticos. */
export const SectionHeader = ({ icon: Icon, title, description, action }) => (
	<div className="mb-3 mt-2 flex items-end justify-between gap-4">
		<div className="flex items-center gap-2.5">
			{Icon ? (
				<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
					<Icon className="h-4 w-4" />
				</span>
			) : null}
			<div>
				<h2 className="text-sm font-semibold tracking-tight">{title}</h2>
				{description ? (
					<p className="text-xs text-muted-foreground">{description}</p>
				) : null}
			</div>
		</div>
		{action}
	</div>
);
