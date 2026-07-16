import React, { useState, useEffect, useReducer } from "react";
import openSocket from "../../services/socket-io";
import { toast } from "react-toastify";
import { Search, Pencil, Trash2, Plus } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import QuickAnswersModal from "../../components/QuickAnswersModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";

const reducer = (state, action) => {
	if (action.type === "LOAD_QUICK_ANSWERS") {
		const quickAnswers = action.payload;
		const newQuickAnswers = [];

		quickAnswers.forEach((quickAnswer) => {
			const quickAnswerIndex = state.findIndex((q) => q.id === quickAnswer.id);
			if (quickAnswerIndex !== -1) {
				state[quickAnswerIndex] = quickAnswer;
			} else {
				newQuickAnswers.push(quickAnswer);
			}
		});

		return [...state, ...newQuickAnswers];
	}

	if (action.type === "UPDATE_QUICK_ANSWERS") {
		const quickAnswer = action.payload;
		const quickAnswerIndex = state.findIndex((q) => q.id === quickAnswer.id);

		if (quickAnswerIndex !== -1) {
			state[quickAnswerIndex] = quickAnswer;
			return [...state];
		} else {
			return [quickAnswer, ...state];
		}
	}

	if (action.type === "DELETE_QUICK_ANSWERS") {
		const quickAnswerId = action.payload;

		const quickAnswerIndex = state.findIndex((q) => q.id === quickAnswerId);
		if (quickAnswerIndex !== -1) {
			state.splice(quickAnswerIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const QuickAnswers = () => {
	const [loading, setLoading] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);
	const [searchParam, setSearchParam] = useState("");
	const [quickAnswers, dispatch] = useReducer(reducer, []);
	const [selectedQuickAnswers, setSelectedQuickAnswers] = useState(null);
	const [quickAnswersModalOpen, setQuickAnswersModalOpen] = useState(false);
	const [deletingQuickAnswers, setDeletingQuickAnswers] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [hasMore, setHasMore] = useState(false);

	useEffect(() => {
		dispatch({ type: "RESET" });
		setPageNumber(1);
	}, [searchParam]);

	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchQuickAnswers = async () => {
				try {
					const { data } = await api.get("/quickAnswers/", {
						params: { searchParam, pageNumber },
					});
					dispatch({ type: "LOAD_QUICK_ANSWERS", payload: data.quickAnswers });
					setHasMore(data.hasMore);
					setLoading(false);
				} catch (err) {
					toastError(err);
				}
			};
			fetchQuickAnswers();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, pageNumber]);

	useEffect(() => {
		const socket = openSocket();

		socket.on("quickAnswer", (data) => {
			if (data.action === "update" || data.action === "create") {
				dispatch({ type: "UPDATE_QUICK_ANSWERS", payload: data.quickAnswer });
			}

			if (data.action === "delete") {
				dispatch({
					type: "DELETE_QUICK_ANSWERS",
					payload: +data.quickAnswerId,
				});
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleSearch = (event) => {
		setSearchParam(event.target.value.toLowerCase());
	};

	const handleOpenQuickAnswersModal = () => {
		setSelectedQuickAnswers(null);
		setQuickAnswersModalOpen(true);
	};

	const handleCloseQuickAnswersModal = () => {
		setSelectedQuickAnswers(null);
		setQuickAnswersModalOpen(false);
	};

	const handleEditQuickAnswers = (quickAnswer) => {
		setSelectedQuickAnswers(quickAnswer);
		setQuickAnswersModalOpen(true);
	};

	const handleDeleteQuickAnswers = async (quickAnswerId) => {
		try {
			await api.delete(`/quickAnswers/${quickAnswerId}`);
			toast.success(i18n.t("quickAnswers.toasts.deleted"));
		} catch (err) {
			toastError(err);
		}
		setDeletingQuickAnswers(null);
		setSearchParam("");
		setPageNumber(1);
	};

	const loadMore = () => {
		setPageNumber((prevState) => prevState + 1);
	};

	const handleScroll = (e) => {
		if (!hasMore || loading) return;
		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
		if (scrollHeight - (scrollTop + 100) < clientHeight) {
			loadMore();
		}
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={
					deletingQuickAnswers &&
					`${i18n.t("quickAnswers.confirmationModal.deleteTitle")} ${
						deletingQuickAnswers.shortcut
					}?`
				}
				open={confirmModalOpen}
				onClose={setConfirmModalOpen}
				onConfirm={() => handleDeleteQuickAnswers(deletingQuickAnswers.id)}
			>
				{i18n.t("quickAnswers.confirmationModal.deleteMessage")}
			</ConfirmationModal>
			<QuickAnswersModal
				open={quickAnswersModalOpen}
				onClose={handleCloseQuickAnswersModal}
				quickAnswerId={selectedQuickAnswers && selectedQuickAnswers.id}
			></QuickAnswersModal>
			<MainHeader>
				<Title>{i18n.t("quickAnswers.title")}</Title>
				<MainHeaderButtonsWrapper>
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={i18n.t("quickAnswers.searchPlaceholder")}
							type="search"
							value={searchParam}
							onChange={handleSearch}
							className="w-56 pl-9"
						/>
					</div>
					<Button onClick={handleOpenQuickAnswersModal}>
						<Plus className="h-4 w-4" />
						{i18n.t("quickAnswers.buttons.add")}
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-auto px-6 pb-6" onScroll={handleScroll}>
				<div className="rounded-xl border bg-card">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-card">
							<TableRow>
								<TableHead className="text-center">
									{i18n.t("quickAnswers.table.shortcut")}
								</TableHead>
								<TableHead>{i18n.t("quickAnswers.table.message")}</TableHead>
								<TableHead className="text-center">
									{i18n.t("quickAnswers.table.actions")}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{quickAnswers.map((quickAnswer) => (
								<TableRow key={quickAnswer.id}>
									<TableCell className="text-center font-medium">
										{quickAnswer.shortcut}
									</TableCell>
									<TableCell className="max-w-md truncate text-muted-foreground">
										{quickAnswer.message}
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
															onClick={() => handleEditQuickAnswers(quickAnswer)}
														>
															<Pencil className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														{i18n.t("quickAnswersModal.buttons.okEdit")}
													</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-destructive hover:text-destructive"
															onClick={(e) => {
																setConfirmModalOpen(true);
																setDeletingQuickAnswers(quickAnswer);
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
							{loading && <TableRowSkeleton columns={3} />}
						</TableBody>
					</Table>
				</div>
			</div>
		</MainContainer>
	);
};

export default QuickAnswers;
