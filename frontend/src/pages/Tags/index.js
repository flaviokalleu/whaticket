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
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";

const reducer = (state, action) => {
	if (action.type === "LOAD_TAGS") {
		const tags = action.payload;
		const newTags = [];

		tags.forEach((tag) => {
			const tagIndex = state.findIndex((t) => t.id === tag.id);
			if (tagIndex !== -1) {
				state[tagIndex] = tag;
			} else {
				newTags.push(tag);
			}
		});

		return [...state, ...newTags];
	}

	if (action.type === "UPDATE_TAGS") {
		const tag = action.payload;
		const tagIndex = state.findIndex((t) => t.id === tag.id);

		if (tagIndex !== -1) {
			state[tagIndex] = tag;
			return [...state];
		} else {
			return [tag, ...state];
		}
	}

	if (action.type === "DELETE_TAG") {
		const tagId = action.payload;
		const tagIndex = state.findIndex((t) => t.id === tagId);
		if (tagIndex !== -1) {
			state.splice(tagIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const Tags = () => {
	const [tags, dispatch] = useReducer(reducer, []);
	const [loading, setLoading] = useState(false);

	const [tagModalOpen, setTagModalOpen] = useState(false);
	const [selectedTag, setSelectedTag] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const { data } = await api.get("/tags");
				dispatch({ type: "LOAD_TAGS", payload: data });

				setLoading(false);
			} catch (err) {
				toastError(err);
				setLoading(false);
			}
		})();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on("tag", (data) => {
			if (data.action === "update" || data.action === "create") {
				dispatch({ type: "UPDATE_TAGS", payload: data.tag });
			}

			if (data.action === "delete") {
				dispatch({ type: "DELETE_TAG", payload: data.tagId });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleOpenTagModal = () => {
		setTagModalOpen(true);
		setSelectedTag(null);
	};

	const handleCloseTagModal = () => {
		setTagModalOpen(false);
		setSelectedTag(null);
	};

	const handleEditTag = (tag) => {
		setSelectedTag(tag);
		setTagModalOpen(true);
	};

	const handleCloseConfirmationModal = () => {
		setConfirmModalOpen(false);
		setSelectedTag(null);
	};

	const handleDeleteTag = async (tagId) => {
		try {
			await api.delete(`/tags/${tagId}`);
			toast.success(i18n.t("tags.toasts.deleted"));
		} catch (err) {
			toastError(err);
		}
		setSelectedTag(null);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={
					selectedTag &&
					`${i18n.t("tags.confirmationModal.deleteTitle")} ${selectedTag.name}?`
				}
				open={confirmModalOpen}
				onClose={handleCloseConfirmationModal}
				onConfirm={() => handleDeleteTag(selectedTag.id)}
			>
				{i18n.t("tags.confirmationModal.deleteMessage")}
			</ConfirmationModal>
			<TagModal
				open={tagModalOpen}
				onClose={handleCloseTagModal}
				tagId={selectedTag?.id}
			/>
			<MainHeader>
				<Title>{i18n.t("tags.title")}</Title>
				<MainHeaderButtonsWrapper>
					<Button onClick={handleOpenTagModal}>
						<Plus className="h-4 w-4" />
						{i18n.t("tags.buttons.add")}
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-auto px-6 pb-6">
				<div className="rounded-xl border bg-card">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-card">
							<TableRow>
								<TableHead>{i18n.t("tags.table.name")}</TableHead>
								<TableHead className="text-center">
									{i18n.t("tags.table.color")}
								</TableHead>
								<TableHead className="text-center">
									{i18n.t("tags.table.actions")}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{tags.map((tag) => (
								<TableRow key={tag.id}>
									<TableCell className="font-medium">{tag.name}</TableCell>
									<TableCell className="text-center">
										<div className="flex items-center justify-center">
											<span
												className="h-4 w-14 rounded-sm border"
												style={{ backgroundColor: tag.color }}
											/>
										</div>
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
															onClick={() => handleEditTag(tag)}
														>
															<Pencil className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>{i18n.t("tagModal.buttons.okEdit")}</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-destructive hover:text-destructive"
															onClick={() => {
																setSelectedTag(tag);
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
							{loading && <TableRowSkeleton columns={3} />}
						</TableBody>
					</Table>
				</div>
			</div>
		</MainContainer>
	);
};

export default Tags;
