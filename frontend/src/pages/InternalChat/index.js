import React, {
	useState,
	useEffect,
	useCallback,
	useContext,
	useRef,
} from "react";

import { toast } from "react-toastify";
import { Users, Plus, Send, MessageSquarePlus, Loader2 } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { MultiSelect } from "../../components/ui/multi-select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../../components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";

import MainContainer from "../../components/MainContainer";
import { AuthContext } from "../../context/Auth/AuthContext";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import openSocket from "../../services/socket-io";

const getInitials = (name) =>
	(name || "?")
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0])
		.join("")
		.toUpperCase();

const formatTime = (dateStr) => {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	const today = new Date();
	const isToday =
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear();
	if (isToday) {
		return date.toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	}
	return date.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
	});
};

const conversationKey = (conv) =>
	conv.type === "group" ? `group-${conv.groupId}` : `direct-${conv.userId}`;

const InternalChat = () => {
	const { user } = useContext(AuthContext);

	const [conversations, setConversations] = useState([]);
	const [selected, setSelected] = useState(null);
	const [messages, setMessages] = useState([]);
	const [loadingMessages, setLoadingMessages] = useState(false);
	const [inputMessage, setInputMessage] = useState("");
	const [users, setUsers] = useState([]);

	const [groupDialogOpen, setGroupDialogOpen] = useState(false);
	const [groupName, setGroupName] = useState("");
	const [groupMemberIds, setGroupMemberIds] = useState([]);

	const [dmDialogOpen, setDmDialogOpen] = useState(false);
	const [dmUserId, setDmUserId] = useState("");

	const messagesEndRef = useRef(null);
	const selectedRef = useRef(null);
	selectedRef.current = selected;

	const scrollToBottom = () => {
		setTimeout(() => {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
	};

	const fetchConversations = useCallback(async () => {
		try {
			const { data } = await api.get("/internal-chat/conversations");
			setConversations(data);
		} catch (err) {
			toastError(err);
		}
	}, []);

	useEffect(() => {
		fetchConversations();
	}, [fetchConversations]);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/users");
				setUsers(data.users || []);
			} catch (err) {
				toastError(err);
			}
		})();
	}, []);

	const markAsRead = useCallback(async (conv) => {
		const id = conv.type === "group" ? conv.groupId : conv.userId;
		try {
			await api.post(`/internal-chat/${id}/read?type=${conv.type}`);
		} catch (err) {
			// silencioso — não bloquear a UI por falha ao marcar como lido
		}
		setConversations((prev) =>
			prev.map((c) =>
				conversationKey(c) === conversationKey(conv)
					? { ...c, unreadCount: 0 }
					: c
			)
		);
	}, []);

	const handleSelectConversation = useCallback(
		async (conv) => {
			setSelected(conv);
			setMessages([]);
			setLoadingMessages(true);
			try {
				const url =
					conv.type === "group"
						? `/internal-chat/groups/${conv.groupId}/messages`
						: `/internal-chat/direct/${conv.userId}/messages`;
				const { data } = await api.get(url, {
					params: { pageSize: 100 },
				});
				setMessages(data.messages || []);
				scrollToBottom();
			} catch (err) {
				toastError(err);
			}
			setLoadingMessages(false);
			markAsRead(conv);
		},
		[markAsRead]
	);

	const belongsToSelected = useCallback(
		(message, conv) => {
			if (!conv) return false;
			if (conv.type === "group") {
				return message.groupId === conv.groupId;
			}
			return (
				!message.groupId &&
				((message.fromUserId === conv.userId && message.toUserId === user?.id) ||
					(message.fromUserId === user?.id && message.toUserId === conv.userId))
			);
		},
		[user]
	);

	useEffect(() => {
		const socket = openSocket();

		socket.on("internalChat:message", (data) => {
			const message = data.message;
			if (!message) return;

			const conv = selectedRef.current;
			if (belongsToSelected(message, conv)) {
				setMessages((prev) => {
					if (prev.some((m) => m.id === message.id)) return prev;
					return [...prev, message];
				});
				scrollToBottom();
				if (message.fromUserId !== user?.id) {
					markAsRead(conv);
				}
			}
			fetchConversations();
		});

		socket.on("internalChat:group", () => {
			fetchConversations();
		});

		return () => {
			socket.disconnect();
		};
	}, [belongsToSelected, fetchConversations, markAsRead, user]);

	const handleSendMessage = async () => {
		const body = inputMessage.trim();
		if (!body || !selected) return;
		setInputMessage("");
		try {
			const url =
				selected.type === "group"
					? `/internal-chat/groups/${selected.groupId}/messages`
					: `/internal-chat/direct/${selected.userId}/messages`;
			const { data } = await api.post(url, { body });
			setMessages((prev) => {
				if (prev.some((m) => m.id === data.id)) return prev;
				return [...prev, data];
			});
			scrollToBottom();
			fetchConversations();
		} catch (err) {
			toastError(err);
		}
	};

	const handleCreateGroup = async () => {
		if (!groupName.trim()) return;
		try {
			const { data } = await api.post("/internal-chat/groups", {
				name: groupName.trim(),
				memberIds: groupMemberIds,
			});
			toast.success("Grupo criado com sucesso.");
			setGroupDialogOpen(false);
			setGroupName("");
			setGroupMemberIds([]);
			await fetchConversations();
			handleSelectConversation({
				type: "group",
				groupId: data.id,
				name: data.name,
				unreadCount: 0,
			});
		} catch (err) {
			toastError(err);
		}
	};

	const handleStartDm = () => {
		if (!dmUserId) return;
		const partner = users.find((u) => u.id === +dmUserId);
		if (!partner) return;
		setDmDialogOpen(false);
		setDmUserId("");
		handleSelectConversation({
			type: "direct",
			userId: partner.id,
			name: partner.name,
			unreadCount: 0,
		});
	};

	const availableUsers = users.filter((u) => u.id !== user?.id);

	return (
		<MainContainer>
			<div className="flex flex-1 overflow-hidden">
				{/* Left column: conversations */}
				<div className="flex w-80 shrink-0 flex-col border-r">
					<div className="flex items-center justify-between gap-2 border-b px-4 py-3">
						<h2 className="text-base font-semibold">Chat interno</h2>
						<div className="flex gap-1">
							<Button
								variant="outline"
								size="icon"
								className="h-8 w-8"
								title="Nova conversa"
								onClick={() => setDmDialogOpen(true)}
							>
								<MessageSquarePlus className="h-4 w-4" />
							</Button>
							<Button
								size="icon"
								className="h-8 w-8"
								title="Novo grupo"
								onClick={() => setGroupDialogOpen(true)}
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>
					</div>
					<div className="flex-1 overflow-y-auto">
						{conversations.length === 0 && (
							<p className="px-4 py-6 text-center text-sm text-muted-foreground">
								Nenhuma conversa ainda. Comece uma nova conversa ou crie um
								grupo.
							</p>
						)}
						{conversations.map((conv) => {
							const isSelected =
								selected && conversationKey(conv) === conversationKey(selected);
							return (
								<button
									key={conversationKey(conv)}
									type="button"
									className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-accent ${
										isSelected ? "bg-accent" : ""
									}`}
									onClick={() => handleSelectConversation(conv)}
								>
									{conv.type === "group" ? (
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
											<Users className="h-5 w-5" />
										</div>
									) : (
										<Avatar className="h-10 w-10 shrink-0">
											<AvatarFallback className="text-xs">
												{getInitials(conv.name)}
											</AvatarFallback>
										</Avatar>
									)}
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between gap-2">
											<p className="truncate text-sm font-medium">{conv.name}</p>
											{conv.lastMessage && (
												<span className="shrink-0 text-[11px] text-muted-foreground">
													{formatTime(conv.lastMessage.createdAt)}
												</span>
											)}
										</div>
										<div className="flex items-center justify-between gap-2">
											<p className="truncate text-xs text-muted-foreground">
												{conv.lastMessage?.body || "Sem mensagens"}
											</p>
											{conv.unreadCount > 0 && (
												<Badge className="h-5 min-w-5 shrink-0 justify-center rounded-full px-1.5 text-[11px]">
													{conv.unreadCount}
												</Badge>
											)}
										</div>
									</div>
								</button>
							);
						})}
					</div>
				</div>

				{/* Right pane: messages */}
				<div className="flex flex-1 flex-col overflow-hidden">
					{!selected ? (
						<div className="flex flex-1 items-center justify-center text-muted-foreground">
							Selecione uma conversa para começar
						</div>
					) : (
						<>
							<div className="flex items-center gap-3 border-b px-4 py-3">
								{selected.type === "group" ? (
									<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
										<Users className="h-4 w-4" />
									</div>
								) : (
									<Avatar className="h-9 w-9">
										<AvatarFallback className="text-xs">
											{getInitials(selected.name)}
										</AvatarFallback>
									</Avatar>
								)}
								<div>
									<p className="text-sm font-semibold">{selected.name}</p>
									<p className="text-xs text-muted-foreground">
										{selected.type === "group" ? "Grupo" : "Conversa direta"}
									</p>
								</div>
							</div>

							<div className="flex-1 space-y-2 overflow-y-auto bg-muted/30 px-4 py-4">
								{loadingMessages && (
									<div className="flex justify-center py-4 text-muted-foreground">
										<Loader2 className="h-5 w-5 animate-spin" />
									</div>
								)}
								{!loadingMessages && messages.length === 0 && (
									<p className="py-6 text-center text-sm text-muted-foreground">
										Nenhuma mensagem ainda. Envie a primeira!
									</p>
								)}
								{messages.map((message) => {
									const isMine = message.fromUserId === user?.id;
									return (
										<div
											key={message.id}
											className={`flex ${isMine ? "justify-end" : "justify-start"}`}
										>
											<div
												className={`max-w-[70%] rounded-2xl px-3 py-2 shadow-sm ${
													isMine
														? "rounded-br-sm bg-primary text-primary-foreground"
														: "rounded-bl-sm border bg-background"
												}`}
											>
												{!isMine && selected.type === "group" && (
													<p className="mb-0.5 text-xs font-semibold text-primary">
														{message.fromUser?.name || "Usuário"}
													</p>
												)}
												<p className="whitespace-pre-wrap break-words text-sm">
													{message.body}
												</p>
												<p
													className={`mt-0.5 text-right text-[10px] ${
														isMine
															? "text-primary-foreground/70"
															: "text-muted-foreground"
													}`}
												>
													{formatTime(message.createdAt)}
												</p>
											</div>
										</div>
									);
								})}
								<div ref={messagesEndRef} />
							</div>

							<div className="flex items-center gap-2 border-t px-4 py-3">
								<Input
									placeholder="Digite uma mensagem..."
									value={inputMessage}
									onChange={(e) => setInputMessage(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleSendMessage();
										}
									}}
								/>
								<Button
									size="icon"
									className="shrink-0"
									onClick={handleSendMessage}
									disabled={!inputMessage.trim()}
								>
									<Send className="h-4 w-4" />
								</Button>
							</div>
						</>
					)}
				</div>
			</div>

			{/* New group dialog */}
			<Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Novo grupo</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="group-name">Nome do grupo</Label>
							<Input
								id="group-name"
								value={groupName}
								autoFocus
								onChange={(e) => setGroupName(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Membros</Label>
							<MultiSelect
								options={availableUsers.map((u) => ({
									value: u.id,
									label: u.name,
								}))}
								value={groupMemberIds}
								onChange={setGroupMemberIds}
								placeholder="Selecione os membros"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setGroupDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleCreateGroup} disabled={!groupName.trim()}>
							Criar grupo
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* New DM dialog */}
			<Dialog open={dmDialogOpen} onOpenChange={setDmDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Nova conversa</DialogTitle>
					</DialogHeader>
					<div className="space-y-1.5">
						<Label>Usuário</Label>
						<Select value={dmUserId} onValueChange={setDmUserId}>
							<SelectTrigger>
								<SelectValue placeholder="Selecione um usuário" />
							</SelectTrigger>
							<SelectContent>
								{availableUsers.map((u) => (
									<SelectItem key={u.id} value={String(u.id)}>
										{u.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDmDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleStartDm} disabled={!dmUserId}>
							Iniciar conversa
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</MainContainer>
	);
};

export default InternalChat;
