import React, { useState, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import openSocket from "../../services/socket-io";
import { Search, Pencil, Trash2, Plus } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
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
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";

const reducer = (state, action) => {
	if (action.type === "LOAD_USERS") {
		const users = action.payload;
		const newUsers = [];

		users.forEach((user) => {
			const userIndex = state.findIndex((u) => u.id === user.id);
			if (userIndex !== -1) {
				state[userIndex] = user;
			} else {
				newUsers.push(user);
			}
		});

		return [...state, ...newUsers];
	}

	if (action.type === "UPDATE_USERS") {
		const user = action.payload;
		const userIndex = state.findIndex((u) => u.id === user.id);

		if (userIndex !== -1) {
			state[userIndex] = user;
			return [...state];
		} else {
			return [user, ...state];
		}
	}

	if (action.type === "DELETE_USER") {
		const userId = action.payload;

		const userIndex = state.findIndex((u) => u.id === userId);
		if (userIndex !== -1) {
			state.splice(userIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

const Users = () => {
	const [loading, setLoading] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [deletingUser, setDeletingUser] = useState(null);
	const [userModalOpen, setUserModalOpen] = useState(false);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [users, dispatch] = useReducer(reducer, []);

	useEffect(() => {
		dispatch({ type: "RESET" });
		setPageNumber(1);
	}, [searchParam]);

	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchUsers = async () => {
				try {
					const { data } = await api.get("/users/", {
						params: { searchParam, pageNumber },
					});
					dispatch({ type: "LOAD_USERS", payload: data.users });
					setHasMore(data.hasMore);
					setLoading(false);
				} catch (err) {
					toastError(err);
				}
			};
			fetchUsers();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, pageNumber]);

	useEffect(() => {
		const socket = openSocket();

		socket.on("user", (data) => {
			if (data.action === "update" || data.action === "create") {
				dispatch({ type: "UPDATE_USERS", payload: data.user });
			}

			if (data.action === "delete") {
				dispatch({ type: "DELETE_USER", payload: +data.userId });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleOpenUserModal = () => {
		setSelectedUser(null);
		setUserModalOpen(true);
	};

	const handleCloseUserModal = () => {
		setSelectedUser(null);
		setUserModalOpen(false);
	};

	const handleSearch = (event) => {
		setSearchParam(event.target.value.toLowerCase());
	};

	const handleEditUser = (user) => {
		setSelectedUser(user);
		setUserModalOpen(true);
	};

	const handleDeleteUser = async (userId) => {
		try {
			await api.delete(`/users/${userId}`);
			toast.success(i18n.t("users.toasts.deleted"));
		} catch (err) {
			toastError(err);
		}
		setDeletingUser(null);
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
					deletingUser &&
					`${i18n.t("users.confirmationModal.deleteTitle")} ${
						deletingUser.name
					}?`
				}
				open={confirmModalOpen}
				onClose={setConfirmModalOpen}
				onConfirm={() => handleDeleteUser(deletingUser.id)}
			>
				{i18n.t("users.confirmationModal.deleteMessage")}
			</ConfirmationModal>
			<UserModal
				open={userModalOpen}
				onClose={handleCloseUserModal}
				userId={selectedUser && selectedUser.id}
			/>
			<MainHeader>
				<Title>{i18n.t("users.title")}</Title>
				<MainHeaderButtonsWrapper>
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={i18n.t("contacts.searchPlaceholder")}
							type="search"
							value={searchParam}
							onChange={handleSearch}
							className="w-56 pl-9"
						/>
					</div>
					<Button onClick={handleOpenUserModal}>
						<Plus className="h-4 w-4" />
						{i18n.t("users.buttons.add")}
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<div className="flex-1 overflow-auto px-6 pb-6" onScroll={handleScroll}>
				<div className="rounded-xl border bg-card">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-card">
							<TableRow>
								<TableHead>{i18n.t("users.table.name")}</TableHead>
								<TableHead>{i18n.t("users.table.email")}</TableHead>
								<TableHead className="text-center">
									{i18n.t("users.table.profile")}
								</TableHead>
								<TableHead className="text-center">
									{i18n.t("users.table.whatsapp")}
								</TableHead>
								<TableHead className="text-center">
									{i18n.t("users.table.actions")}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="font-medium">{user.name}</TableCell>
									<TableCell className="text-muted-foreground">{user.email}</TableCell>
									<TableCell className="text-center">
										<Badge variant={user.profile === "admin" ? "default" : "secondary"}>
											{user.profile}
										</Badge>
									</TableCell>
									<TableCell className="text-center text-muted-foreground">
										{user.whatsapp?.name}
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
															onClick={() => handleEditUser(user)}
														>
															<Pencil className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>{i18n.t("userModal.buttons.okEdit")}</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-destructive hover:text-destructive"
															onClick={(e) => {
																setConfirmModalOpen(true);
																setDeletingUser(user);
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

export default Users;
