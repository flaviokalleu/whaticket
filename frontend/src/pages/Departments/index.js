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
import DepartmentModal from "../../components/DepartmentModal";
import ConfirmationModal from "../../components/ConfirmationModal";

const reducer = (state, action) => {
	if (action.type === "LOAD_DEPARTMENTS") {
		const departments = action.payload;
		const newDepartments = [];

		departments.forEach((department) => {
			const departmentIndex = state.findIndex((d) => d.id === department.id);
			if (departmentIndex !== -1) {
				state[departmentIndex] = department;
			} else {
				newDepartments.push(department);
			}
		});

		return [...state, ...newDepartments];
	}

	if (action.type === "UPDATE_DEPARTMENTS") {
		const department = action.payload;
		const departmentIndex = state.findIndex((d) => d.id === department.id);

		if (departmentIndex !== -1) {
			state[departmentIndex] = department;
			return [...state];
		} else {
			return [department, ...state];
		}
	}

	if (action.type === "DELETE_DEPARTMENT") {
		const departmentId = action.payload;
		const departmentIndex = state.findIndex((d) => d.id === departmentId);
		if (departmentIndex !== -1) {
			state.splice(departmentIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const Departments = () => {
	const [departments, dispatch] = useReducer(reducer, []);
	const [loading, setLoading] = useState(false);

	const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
	const [selectedDepartment, setSelectedDepartment] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const { data } = await api.get("/departments");
				dispatch({ type: "LOAD_DEPARTMENTS", payload: data });
				setLoading(false);
			} catch (err) {
				toastError(err);
				setLoading(false);
			}
		})();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on("department", (data) => {
			if (data.action === "update" || data.action === "create") {
				dispatch({ type: "UPDATE_DEPARTMENTS", payload: data.department });
			}

			if (data.action === "delete") {
				dispatch({ type: "DELETE_DEPARTMENT", payload: data.departmentId });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleOpenDepartmentModal = () => {
		setDepartmentModalOpen(true);
		setSelectedDepartment(null);
	};

	const handleCloseDepartmentModal = () => {
		setDepartmentModalOpen(false);
		setSelectedDepartment(null);
	};

	const handleEditDepartment = (department) => {
		setSelectedDepartment(department);
		setDepartmentModalOpen(true);
	};

	const handleCloseConfirmationModal = () => {
		setConfirmModalOpen(false);
		setSelectedDepartment(null);
	};

	const handleDeleteDepartment = async (departmentId) => {
		try {
			await api.delete(`/departments/${departmentId}`);
			toast.success("Departamento excluído com sucesso!");
		} catch (err) {
			toastError(err);
		}
		setSelectedDepartment(null);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={
					selectedDepartment &&
					`Excluir departamento ${selectedDepartment.name}?`
				}
				open={confirmModalOpen}
				onClose={handleCloseConfirmationModal}
				onConfirm={() => handleDeleteDepartment(selectedDepartment.id)}
			>
				Esta ação não pode ser revertida.
			</ConfirmationModal>
			<DepartmentModal
				open={departmentModalOpen}
				onClose={handleCloseDepartmentModal}
				departmentId={selectedDepartment?.id}
			/>
			<MainHeader>
				<Title>Departamentos</Title>
				<MainHeaderButtonsWrapper>
					<Button onClick={handleOpenDepartmentModal}>
						<Plus className="h-4 w-4" />
						Adicionar departamento
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-auto px-6 pb-6">
				<div className="rounded-xl border bg-card">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-card">
							<TableRow>
								<TableHead>Nome</TableHead>
								<TableHead className="text-center">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{departments.map((department) => (
								<TableRow key={department.id}>
									<TableCell className="font-medium">
										{department.name}
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
															onClick={() => handleEditDepartment(department)}
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
																setSelectedDepartment(department);
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
							{loading && <TableRowSkeleton columns={2} />}
						</TableBody>
					</Table>
				</div>
			</div>
		</MainContainer>
	);
};

export default Departments;
