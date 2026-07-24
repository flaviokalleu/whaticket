import React, { useEffect, useReducer, useState } from "react";

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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../../components/ui/tooltip";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import MessageTemplateModal from "../../components/MessageTemplateModal";
import ConfirmationModal from "../../components/ConfirmationModal";

const reducer = (state, action) => {
	if (action.type === "LOAD_TEMPLATES") {
		return [...action.payload];
	}

	if (action.type === "UPDATE_TEMPLATES") {
		const template = action.payload;
		const templateIndex = state.findIndex((t) => t.id === template.id);

		if (templateIndex !== -1) {
			state[templateIndex] = template;
			return [...state];
		} else {
			return [template, ...state];
		}
	}

	if (action.type === "DELETE_TEMPLATE") {
		const templateId = action.payload;
		const templateIndex = state.findIndex((t) => t.id === templateId);
		if (templateIndex !== -1) {
			state.splice(templateIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const truncate = (text, length = 80) => {
	if (!text) return "";
	return text.length > length ? `${text.slice(0, length)}...` : text;
};

const MessageTemplates = () => {
	const [templates, dispatch] = useReducer(reducer, []);
	const [loading, setLoading] = useState(false);

	const [templateModalOpen, setTemplateModalOpen] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const { data } = await api.get("/templates");
				dispatch({ type: "LOAD_TEMPLATES", payload: data });
				setLoading(false);
			} catch (err) {
				toastError(err);
				setLoading(false);
			}
		})();
	}, []);

	const handleOpenTemplateModal = () => {
		setTemplateModalOpen(true);
		setSelectedTemplate(null);
	};

	const handleCloseTemplateModal = () => {
		setTemplateModalOpen(false);
		setSelectedTemplate(null);
	};

	const handleEditTemplate = (template) => {
		setSelectedTemplate(template);
		setTemplateModalOpen(true);
	};

	const handleTemplateSaved = (template) => {
		dispatch({ type: "UPDATE_TEMPLATES", payload: template });
	};

	const handleCloseConfirmationModal = () => {
		setConfirmModalOpen(false);
		setSelectedTemplate(null);
	};

	const handleDeleteTemplate = async (templateId) => {
		try {
			await api.delete(`/templates/${templateId}`);
			dispatch({ type: "DELETE_TEMPLATE", payload: templateId });
			toast.success("Modelo excluído com sucesso!");
		} catch (err) {
			toastError(err);
		}
		setSelectedTemplate(null);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={
					selectedTemplate && `Excluir modelo ${selectedTemplate.name}?`
				}
				open={confirmModalOpen}
				onClose={handleCloseConfirmationModal}
				onConfirm={() => handleDeleteTemplate(selectedTemplate.id)}
			>
				Esta ação não pode ser revertida.
			</ConfirmationModal>
			<MessageTemplateModal
				open={templateModalOpen}
				onClose={handleCloseTemplateModal}
				templateId={selectedTemplate?.id}
				onSaved={handleTemplateSaved}
			/>
			<MainHeader>
				<Title>Modelos de mensagem</Title>
				<MainHeaderButtonsWrapper>
					<Button onClick={handleOpenTemplateModal}>
						<Plus className="h-4 w-4" />
						Adicionar modelo
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-auto px-6 pb-6">
				<div className="rounded-xl border bg-card">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-card">
							<TableRow>
								<TableHead>Nome</TableHead>
								<TableHead>Mensagem</TableHead>
								<TableHead className="text-center">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{templates.map((template) => (
								<TableRow key={template.id}>
									<TableCell className="font-medium">
										{template.name}
									</TableCell>
									<TableCell className="max-w-md truncate text-muted-foreground">
										{truncate(template.body)}
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
															onClick={() => handleEditTemplate(template)}
														>
															<Pencil className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>Editar</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-destructive hover:text-destructive"
															onClick={() => {
																setSelectedTemplate(template);
																setConfirmModalOpen(true);
															}}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>Excluir</TooltipContent>
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

export default MessageTemplates;
