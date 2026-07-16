import React, { useContext } from "react";
import { MessageCircle, Clock, CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "../../components/ui/card";
import useTickets from "../../hooks/useTickets";

import { AuthContext } from "../../context/Auth/AuthContext";

import { i18n } from "../../translate/i18n";

import Chart from "./Chart";

const useTicketCount = (status, showAll, withUnreadMessages, queueIds) => {
	const { count } = useTickets({
		status,
		showAll,
		withUnreadMessages,
		queueIds: JSON.stringify(queueIds),
	});
	return count;
};

const StatCard = ({ icon: Icon, label, value, tone }) => {
	const tones = {
		blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
		amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
		emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	};

	return (
		<Card className="border-none shadow-sm">
			<CardContent className="flex items-center gap-4 p-5">
				<div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
					<Icon className="h-5 w-5" />
				</div>
				<div className="min-w-0">
					<p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
					<p className="text-2xl font-bold tracking-tight">{value}</p>
				</div>
			</CardContent>
		</Card>
	);
};

const Dashboard = () => {
	const { user } = useContext(AuthContext);
	let userQueueIds = [];

	if (user.queues && user.queues.length > 0) {
		userQueueIds = user.queues.map((q) => q.id);
	}

	const inAttendance = useTicketCount("open", "true", "false", userQueueIds);
	const waiting = useTicketCount("pending", "true", "false", userQueueIds);
	const closed = useTicketCount("closed", "true", "false", userQueueIds);

	return (
		<div className="mx-auto w-full max-w-6xl px-6 py-8">
			<div className="mb-6">
				<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-sm text-muted-foreground">
					Visão geral do atendimento em tempo real.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<StatCard
					icon={MessageCircle}
					label={i18n.t("dashboard.messages.inAttendance.title")}
					value={inAttendance}
					tone="blue"
				/>
				<StatCard
					icon={Clock}
					label={i18n.t("dashboard.messages.waiting.title")}
					value={waiting}
					tone="amber"
				/>
				<StatCard
					icon={CheckCircle2}
					label={i18n.t("dashboard.messages.closed.title")}
					value={closed}
					tone="emerald"
				/>
			</div>

			<Card className="mt-4 border-none shadow-sm">
				<CardContent className="p-5">
					<Chart />
				</CardContent>
			</Card>
		</div>
	);
};

export default Dashboard;
