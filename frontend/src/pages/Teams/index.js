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
import TeamModal from "../../components/TeamModal";
import ConfirmationModal from "../../components/ConfirmationModal";

const reducer = (state, action) => {
	if (action.type === "LOAD_TEAMS") {
		const teams = action.payload;
		const newTeams = [];

		teams.forEach((team) => {
			const teamIndex = state.findIndex((t) => t.id === team.id);
			if (teamIndex !== -1) {
				state[teamIndex] = team;
			} else {
				newTeams.push(team);
			}
		});

		return [...state, ...newTeams];
	}

	if (action.type === "UPDATE_TEAMS") {
		const team = action.payload;
		const teamIndex = state.findIndex((t) => t.id === team.id);

		if (teamIndex !== -1) {
			state[teamIndex] = team;
			return [...state];
		} else {
			return [team, ...state];
		}
	}

	if (action.type === "DELETE_TEAM") {
		const teamId = action.payload;
		const teamIndex = state.findIndex((t) => t.id === teamId);
		if (teamIndex !== -1) {
			state.splice(teamIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const Teams = () => {
	const [teams, dispatch] = useReducer(reducer, []);
	const [loading, setLoading] = useState(false);

	const [teamModalOpen, setTeamModalOpen] = useState(false);
	const [selectedTeam, setSelectedTeam] = useState(null);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const { data } = await api.get("/teams");
				dispatch({ type: "LOAD_TEAMS", payload: data });
				setLoading(false);
			} catch (err) {
				toastError(err);
				setLoading(false);
			}
		})();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on("team", (data) => {
			if (data.action === "update" || data.action === "create") {
				dispatch({ type: "UPDATE_TEAMS", payload: data.team });
			}

			if (data.action === "delete") {
				dispatch({ type: "DELETE_TEAM", payload: data.teamId });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleOpenTeamModal = () => {
		setTeamModalOpen(true);
		setSelectedTeam(null);
	};

	const handleCloseTeamModal = () => {
		setTeamModalOpen(false);
		setSelectedTeam(null);
	};

	const handleEditTeam = (team) => {
		setSelectedTeam(team);
		setTeamModalOpen(true);
	};

	const handleCloseConfirmationModal = () => {
		setConfirmModalOpen(false);
		setSelectedTeam(null);
	};

	const handleDeleteTeam = async (teamId) => {
		try {
			await api.delete(`/teams/${teamId}`);
			toast.success("Equipe excluída com sucesso!");
		} catch (err) {
			toastError(err);
		}
		setSelectedTeam(null);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={selectedTeam && `Excluir equipe ${selectedTeam.name}?`}
				open={confirmModalOpen}
				onClose={handleCloseConfirmationModal}
				onConfirm={() => handleDeleteTeam(selectedTeam.id)}
			>
				Esta ação não pode ser revertida.
			</ConfirmationModal>
			<TeamModal
				open={teamModalOpen}
				onClose={handleCloseTeamModal}
				teamId={selectedTeam?.id}
			/>
			<MainHeader>
				<Title>Equipes</Title>
				<MainHeaderButtonsWrapper>
					<Button onClick={handleOpenTeamModal}>
						<Plus className="h-4 w-4" />
						Adicionar equipe
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-auto px-6 pb-6">
				<div className="rounded-xl border bg-card">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-card">
							<TableRow>
								<TableHead>Nome</TableHead>
								<TableHead className="text-center">Membros</TableHead>
								<TableHead className="text-center">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{teams.map((team) => (
								<TableRow key={team.id}>
									<TableCell className="font-medium">{team.name}</TableCell>
									<TableCell className="text-center">
										{team.users?.length || 0}
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
															onClick={() => handleEditTeam(team)}
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
																setSelectedTeam(team);
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

export default Teams;
