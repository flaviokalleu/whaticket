import React, { useEffect, useReducer, useState } from "react";

import openSocket from "../../services/socket-io";
import { toast } from "react-toastify";
import { Pencil, Trash2, Plus } from "lucide-react";

import { Button } from "../../components/ui/button";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "../../components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import QueueModal from "../../components/QueueModal";
import ConfirmationModal from "../../components/ConfirmationModal";

const reducer = (state, action) => {
	if (action.type === "LOAD_QUEUES") {
		const queues = action.payload;
		const newQueues = [];

		queues.forEach((queue) => {
			const queueIndex = state.findIndex((q) => q.id === queue.id);
			if (queueIndex !== -1) {
				state[queueIndex] = queue;
			} else {
				newQueues.push(queue);
			}
		});

		return [...state, ...newQueues];
	}

	if (action.type === "UPDATE_QUEUES") {
		const queue = action.payload;
		const queueIndex = state.findIndex((u) => u.id === queue.id);

		if (queueIndex !== -1) {
			state[queueIndex] = queue;
			return [...state];
		} else {
			return [queue, ...state];
		}
	}

	if (action.type === "DELETE_QUEUE") {
		const queueId = action.payload;
		const queueIndex = state.findIndex((q) => q.id === queueId);
		if (queueIndex !== -1) {
			state.splice(queueIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const Queues = () => {
	const [queues, dispatch] = useReducer(reducer, []);
	const [loading, setLoading] = useState(false);

	const [queueModalOpen, setQueueModalOpen] = useState(false);
	const [selectedQueue, setSelectedQueue] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const { data } = await api.get("/queue");
				dispatch({ type: "LOAD_QUEUES", payload: data });

				setLoading(false);
			} catch (err) {
				toastError(err);
				setLoading(false);
			}
		})();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on("queue", (data) => {
			if (data.action === "update" || data.action === "create") {
				dispatch({ type: "UPDATE_QUEUES", payload: data.queue });
			}

			if (data.action === "delete") {
				dispatch({ type: "DELETE_QUEUE", payload: data.queueId });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleOpenQueueModal = () => {
		setQueueModalOpen(true);
		setSelectedQueue(null);
	};

	const handleCloseQueueModal = () => {
		setQueueModalOpen(false);
		setSelectedQueue(null);
	};

	const handleEditQueue = (queue) => {
		setSelectedQueue(queue);
		setQueueModalOpen(true);
	};

	const handleCloseConfirmationModal = () => {
		setConfirmModalOpen(false);
		setSelectedQueue(null);
	};

	const handleDeleteQueue = async (queueId) => {
		try {
			await api.delete(`/queue/${queueId}`);
			toast.success(i18n.t("Queue deleted successfully!"));
		} catch (err) {
			toastError(err);
		}
		setSelectedQueue(null);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={
					selectedQueue &&
					`${i18n.t("queues.confirmationModal.deleteTitle")} ${
						selectedQueue.name
					}?`
				}
				open={confirmModalOpen}
				onClose={handleCloseConfirmationModal}
				onConfirm={() => handleDeleteQueue(selectedQueue.id)}
			>
				{i18n.t("queues.confirmationModal.deleteMessage")}
			</ConfirmationModal>
			<QueueModal
				open={queueModalOpen}
				onClose={handleCloseQueueModal}
				queueId={selectedQueue?.id}
			/>
			<MainHeader>
				<Title>{i18n.t("queues.title")}</Title>
				<MainHeaderButtonsWrapper>
					<Button onClick={handleOpenQueueModal}>
						<Plus className="h-4 w-4" />
						{i18n.t("queues.buttons.add")}
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-auto px-6 pb-6">
				<div className="rounded-xl border bg-card">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-card">
							<TableRow>
								<TableHead>{i18n.t("queues.table.name")}</TableHead>
								<TableHead className="text-center">
									{i18n.t("queues.table.color")}
								</TableHead>
								<TableHead>{i18n.t("queues.table.greeting")}</TableHead>
								<TableHead className="text-center">
									{i18n.t("queues.table.actions")}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{queues.map((queue) => (
								<TableRow key={queue.id}>
									<TableCell className="font-medium">{queue.name}</TableCell>
									<TableCell className="text-center">
										<div className="flex items-center justify-center">
											<span
												className="h-4 w-14 rounded-sm border"
												style={{ backgroundColor: queue.color }}
											/>
										</div>
									</TableCell>
									<TableCell className="max-w-xs truncate text-muted-foreground">
										{queue.greetingMessage}
									</TableCell>
									<TableCell>
										<TooltipProvider>
											<div className="flex items-center justify-center gap-1">
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8"
															onClick={() => handleEditQueue(queue)}
														>
															<Pencil className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>{i18n.t("queueModal.buttons.okEdit")}</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-destructive hover:text-destructive"
															onClick={() => {
																setSelectedQueue(queue);
																setConfirmModalOpen(true);
															}}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														{i18n.t("confirmationModal.buttons.confirm")}
													</TooltipContent>
												</Tooltip>
											</div>
										</TooltipProvider>
									</TableCell>
								</TableRow>
							))}
							{loading && <TableRowSkeleton columns={4} />}
						</TableBody>
					</Table>
				</div>
			</div>
		</MainContainer>
	);
};

export default Queues;
