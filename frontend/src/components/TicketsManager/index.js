import React, { useContext, useEffect, useRef, useState } from "react";
import { Inbox, CheckSquare, Search, Plus } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";

const mainTabs = [
	{ value: "open", icon: Inbox, label: "tickets.tabs.open.title" },
	{ value: "closed", icon: CheckSquare, label: "tickets.tabs.closed.title" },
	{ value: "search", icon: Search, label: "tickets.tabs.search.title" },
];

const TicketsManager = () => {
	const [searchParam, setSearchParam] = useState("");
	const [tab, setTab] = useState("open");
	const [tabOpen, setTabOpen] = useState("open");
	const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
	const [showAllTickets, setShowAllTickets] = useState(false);
	const searchInputRef = useRef();
	const { user } = useContext(AuthContext);
	const [openCount, setOpenCount] = useState(0);
	const [pendingCount, setPendingCount] = useState(0);
	const userQueueIds = user.queues.map((q) => q.id);
	const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

	useEffect(() => {
		if (user.profile.toUpperCase() === "ADMIN") {
			setShowAllTickets(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (tab === "search") {
			searchInputRef.current.focus();
			setSearchParam("");
		}
	}, [tab]);

	let searchTimeout;

	const handleSearch = (e) => {
		const searchedTerm = e.target.value.toLowerCase();

		clearTimeout(searchTimeout);

		if (searchedTerm === "") {
			setSearchParam(searchedTerm);
			setTab("open");
			return;
		}

		searchTimeout = setTimeout(() => {
			setSearchParam(searchedTerm);
		}, 500);
	};

	return (
		<div className="relative flex h-full flex-col overflow-hidden bg-background">
			<NewTicketModal
				modalOpen={newTicketModalOpen}
				onClose={() => setNewTicketModalOpen(false)}
			/>

			{/* Main tabs */}
			<div className="flex shrink-0 gap-1 border-b bg-muted/30 p-2">
				{mainTabs.map((t) => (
					<button
						key={t.value}
						onClick={() => setTab(t.value)}
						className={cn(
							"flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors",
							tab === t.value
								? "bg-background text-primary shadow-sm"
								: "text-muted-foreground hover:bg-background/60 hover:text-foreground"
						)}
					>
						<t.icon className="h-3.5 w-3.5" />
						{i18n.t(t.label)}
					</button>
				))}
			</div>

			{/* Toolbar */}
			<div className="flex shrink-0 items-center gap-2 border-b p-2.5">
				{tab === "search" ? (
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							ref={searchInputRef}
							placeholder={i18n.t("tickets.search.placeholder")}
							type="search"
							onChange={handleSearch}
							className="rounded-full pl-9"
						/>
					</div>
				) : (
					<>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setNewTicketModalOpen(true)}
						>
							<Plus className="h-4 w-4" />
							{i18n.t("ticketsManager.buttons.newTicket")}
						</Button>
						<Can
							role={user.profile}
							perform="tickets-manager:showall"
							yes={() => (
								<div className="flex items-center gap-1.5">
									<Switch
										id="showAllTickets"
										checked={showAllTickets}
										onCheckedChange={() => setShowAllTickets((prev) => !prev)}
									/>
									<Label htmlFor="showAllTickets" className="text-xs font-normal text-muted-foreground">
										{i18n.t("tickets.buttons.showAll")}
									</Label>
								</div>
							)}
						/>
					</>
				)}
				<TicketsQueueSelect
					className="ml-auto"
					selectedQueueIds={selectedQueueIds}
					userQueues={user?.queues}
					onChange={(values) => setSelectedQueueIds(values)}
				/>
			</div>

			<TabPanel value={tab} name="open" className="flex min-h-0 flex-1 flex-col">
				<div className="flex shrink-0 items-center gap-4 border-b px-3">
					<button
						onClick={() => setTabOpen("open")}
						className={cn(
							"relative flex items-center gap-1.5 py-2.5 text-sm font-medium transition-colors",
							tabOpen === "open" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
						)}
					>
						{i18n.t("ticketsList.assignedHeader")}
						{openCount > 0 && (
							<span
								className={cn(
									"flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
									tabOpen === "open"
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground"
								)}
							>
								{openCount}
							</span>
						)}
						{tabOpen === "open" && (
							<span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-primary" />
						)}
					</button>
					<button
						onClick={() => setTabOpen("pending")}
						className={cn(
							"relative flex items-center gap-1.5 py-2.5 text-sm font-medium transition-colors",
							tabOpen === "pending" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
						)}
					>
						{i18n.t("ticketsList.pendingHeader")}
						{pendingCount > 0 && (
							<span
								className={cn(
									"flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
									tabOpen === "pending"
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground"
								)}
							>
								{pendingCount}
							</span>
						)}
						{tabOpen === "pending" && (
							<span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-primary" />
						)}
					</button>
				</div>
				<div className="relative min-h-0 flex-1">
					<div className={cn("absolute inset-0", tabOpen !== "open" && "invisible")}>
						<TicketsList
							status="open"
							showAll={showAllTickets}
							selectedQueueIds={selectedQueueIds}
							updateCount={(val) => setOpenCount(val)}
						/>
					</div>
					<div className={cn("absolute inset-0", tabOpen !== "pending" && "invisible")}>
						<TicketsList
							status="pending"
							selectedQueueIds={selectedQueueIds}
							updateCount={(val) => setPendingCount(val)}
						/>
					</div>
				</div>
			</TabPanel>

			<TabPanel value={tab} name="closed" className="min-h-0 flex-1">
				<TicketsList
					status="closed"
					showAll={true}
					selectedQueueIds={selectedQueueIds}
				/>
			</TabPanel>

			<TabPanel value={tab} name="search" className="min-h-0 flex-1">
				<TicketsList
					searchParam={searchParam}
					showAll={true}
					selectedQueueIds={selectedQueueIds}
				/>
			</TabPanel>
		</div>
	);
};

export default TicketsManager;
