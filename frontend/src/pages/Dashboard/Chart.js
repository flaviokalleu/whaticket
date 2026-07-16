import React, { useState, useEffect, useRef } from "react";
import {
	BarChart,
	CartesianGrid,
	Bar,
	XAxis,
	YAxis,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import { startOfHour, parseISO, format } from "date-fns";

import { i18n } from "../../translate/i18n";
import useTickets from "../../hooks/useTickets";
import { useThemeContext } from "../../context/DarkMode";
import Title from "./Title";

const Chart = () => {
	const { darkMode } = useThemeContext();

	const date = useRef(new Date().toISOString());
	const { tickets } = useTickets({ date: date.current });

	const [chartData, setChartData] = useState([
		{ time: "08:00", amount: 0 },
		{ time: "09:00", amount: 0 },
		{ time: "10:00", amount: 0 },
		{ time: "11:00", amount: 0 },
		{ time: "12:00", amount: 0 },
		{ time: "13:00", amount: 0 },
		{ time: "14:00", amount: 0 },
		{ time: "15:00", amount: 0 },
		{ time: "16:00", amount: 0 },
		{ time: "17:00", amount: 0 },
		{ time: "18:00", amount: 0 },
		{ time: "19:00", amount: 0 },
	]);

	useEffect(() => {
		setChartData((prevState) => {
			let aux = prevState.map((a) => ({ ...a, amount: 0 }));

			aux.forEach((a) => {
				tickets.forEach((ticket) => {
					format(startOfHour(parseISO(ticket.createdAt)), "HH:mm") === a.time &&
						a.amount++;
				});
			});

			return aux;
		});
	}, [tickets]);

	const axisColor = darkMode ? "#94a3b8" : "#64748b";
	const gridColor = darkMode ? "#334155" : "#e2e8f0";
	const barColor = "hsl(217, 91%, 55%)";

	return (
		<div>
			<Title>{`${i18n.t("dashboard.charts.perDay.title")}${tickets.length}`}</Title>
			<div className="mt-4 h-64 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={chartData}
						barSize={28}
						margin={{ top: 16, right: 8, bottom: 0, left: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
						<XAxis
							dataKey="time"
							stroke={axisColor}
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							type="number"
							allowDecimals={false}
							stroke={axisColor}
							fontSize={12}
							tickLine={false}
							axisLine={false}
							width={32}
						/>
						<Tooltip
							cursor={{ fill: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
							contentStyle={{
								borderRadius: 8,
								border: "none",
								backgroundColor: darkMode ? "#1e293b" : "#fff",
								color: darkMode ? "#f1f5f9" : "#0f172a",
								boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
								fontSize: 12,
							}}
						/>
						<Bar dataKey="amount" fill={barColor} radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default Chart;
