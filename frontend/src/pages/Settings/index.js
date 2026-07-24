import React, { useState, useEffect, useContext, useRef } from "react";
import openSocket from "../../services/socket-io";
import { toast } from "react-toastify";
import {
	Copy,
	Loader2,
	Cake,
	ShieldCheck,
	Palette,
	SlidersHorizontal,
	KeyRound,
	Upload,
	Check,
} from "lucide-react";

import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";
import useWhatsApps from "../../hooks/useWhatsApps";
import { AuthContext } from "../../context/Auth/AuthContext";

const SECTIONS = [
	{ id: "geral", label: "Geral", icon: SlidersHorizontal },
	{ id: "aparencia", label: "Aparência", icon: Palette },
	{ id: "automacoes", label: "Automações", icon: Cake },
	{ id: "seguranca", label: "Segurança", icon: ShieldCheck },
	{ id: "api", label: "API", icon: KeyRound },
];

const SettingsCard = ({
	icon: Icon,
	title,
	description,
	action,
	footer,
	children,
}) => (
	<div className="overflow-hidden rounded-xl border bg-card">
		<div className="flex items-start justify-between gap-4 border-b px-5 py-4">
			<div className="flex min-w-0 items-start gap-3">
				{Icon ? (
					<span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
						<Icon className="h-4 w-4" />
					</span>
				) : null}
				<div className="min-w-0">
					<h2 className="text-sm font-semibold tracking-tight">{title}</h2>
					{description ? (
						<p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
					) : null}
				</div>
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
		<div className="px-5 py-5">{children}</div>
		{footer ? (
			<div className="flex justify-end border-t bg-muted/20 px-5 py-3">{footer}</div>
		) : null}
	</div>
);

const Settings = () => {
	const { user } = useContext(AuthContext);
	const { whatsApps } = useWhatsApps();

	const [activeSection, setActiveSection] = useState("geral");

	const [settings, setSettings] = useState([]);

	// White-label
	const [whiteLabel, setWhiteLabel] = useState({
		appName: "",
		primaryColor: "#7367F0",
		logoUrl: null,
		backgroundUrl: null,
	});
	const [savingWhiteLabel, setSavingWhiteLabel] = useState(false);
	const logoInputRef = useRef(null);
	const backgroundInputRef = useRef(null);

	// Birthdays
	const [birthdaySettings, setBirthdaySettings] = useState({
		isEnabled: false,
		messageTemplate: "",
		sendHour: 9,
		whatsappId: null,
	});
	const [savingBirthday, setSavingBirthday] = useState(false);
	const [todayBirthdays, setTodayBirthdays] = useState([]);

	// 2FA
	const [twoFactorEnabled, setTwoFactorEnabled] = useState(
		!!user?.twoFactorEnabled
	);
	const [twoFactorSetup, setTwoFactorSetup] = useState(null);
	const [twoFactorToken, setTwoFactorToken] = useState("");
	const [loading2FA, setLoading2FA] = useState(false);

	useEffect(() => {
		setTwoFactorEnabled(!!user?.twoFactorEnabled);
	}, [user]);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const { data } = await api.get("/settings");
				setSettings(data);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, []);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/settings/white-label");
				setWhiteLabel({
					appName: data.appName || "",
					primaryColor: data.primaryColor || "#7367F0",
					logoUrl: data.logoUrl || null,
					backgroundUrl: data.backgroundUrl || null,
				});
			} catch (err) {
				toastError(err);
			}
		})();
	}, []);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/birthdays/settings");
				setBirthdaySettings({
					isEnabled: !!data.isEnabled,
					messageTemplate: data.messageTemplate || "",
					sendHour: data.sendHour ?? 9,
					whatsappId: data.whatsappId || null,
				});
			} catch (err) {
				toastError(err);
			}
		})();

		(async () => {
			try {
				const { data } = await api.get("/birthdays/today");
				setTodayBirthdays(Array.isArray(data) ? data : []);
			} catch (err) {
				toastError(err);
			}
		})();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on("settings", (data) => {
			if (data.action === "update") {
				setSettings((prevState) => {
					const aux = [...prevState];
					const settingIndex = aux.findIndex((s) => s.key === data.setting.key);
					aux[settingIndex].value = data.setting.value;
					return aux;
				});
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleChangeSetting = async (key, value) => {
		try {
			await api.put(`/settings/${key}`, { value });
			toast.success(i18n.t("settings.success"));
		} catch (err) {
			toastError(err);
		}
	};

	const getSettingValue = (key) => {
		const setting = settings.find((s) => s.key === key);
		return setting ? setting.value : "";
	};

	const handleCopyToken = () => {
		navigator.clipboard.writeText(getSettingValue("userApiToken"));
		toast.success(i18n.t("settings.success"));
	};

	// ----- White-label -----

	const handleSaveWhiteLabel = async () => {
		setSavingWhiteLabel(true);
		try {
			const { data } = await api.put("/settings/white-label", {
				appName: whiteLabel.appName,
				primaryColor: whiteLabel.primaryColor,
				logoUrl: whiteLabel.logoUrl,
				backgroundUrl: whiteLabel.backgroundUrl,
			});
			setWhiteLabel({
				appName: data.appName || "",
				primaryColor: data.primaryColor || "#7367F0",
				logoUrl: data.logoUrl || null,
				backgroundUrl: data.backgroundUrl || null,
			});
			toast.success("Aparência atualizada com sucesso.");
		} catch (err) {
			toastError(err);
		}
		setSavingWhiteLabel(false);
	};

	const handleUploadWhiteLabelFile = async (e, type) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const formData = new FormData();
		formData.append("file", file);
		try {
			const { data } = await api.post(
				`/settings/white-label/${type}`,
				formData
			);
			if (type === "logo") {
				setWhiteLabel((prev) => ({ ...prev, logoUrl: data.logoUrl }));
			} else {
				setWhiteLabel((prev) => ({
					...prev,
					backgroundUrl: data.backgroundUrl,
				}));
			}
			toast.success(
				type === "logo"
					? "Logo enviado com sucesso."
					: "Imagem de fundo enviada com sucesso."
			);
		} catch (err) {
			toastError(err);
		}
		e.target.value = "";
	};

	// ----- Birthdays -----

	const handleSaveBirthdaySettings = async () => {
		setSavingBirthday(true);
		try {
			await api.put("/birthdays/settings", {
				isEnabled: birthdaySettings.isEnabled,
				messageTemplate: birthdaySettings.messageTemplate,
				sendHour: +birthdaySettings.sendHour,
				whatsappId: birthdaySettings.whatsappId
					? +birthdaySettings.whatsappId
					: null,
			});
			toast.success("Configurações de aniversário salvas com sucesso.");
		} catch (err) {
			toastError(err);
		}
		setSavingBirthday(false);
	};

	// ----- 2FA -----

	const handleSetup2FA = async () => {
		setLoading2FA(true);
		try {
			const { data } = await api.get("/auth/2fa/setup");
			setTwoFactorSetup(data);
			setTwoFactorToken("");
		} catch (err) {
			toastError(err);
		}
		setLoading2FA(false);
	};

	const handleEnable2FA = async () => {
		if (twoFactorToken.trim().length < 6) return;
		setLoading2FA(true);
		try {
			await api.post("/auth/2fa/enable", { token: twoFactorToken.trim() });
			setTwoFactorEnabled(true);
			setTwoFactorSetup(null);
			setTwoFactorToken("");
			toast.success("Autenticação em duas etapas ativada com sucesso.");
		} catch (err) {
			toastError(err);
		}
		setLoading2FA(false);
	};

	const handleDisable2FA = async () => {
		setLoading2FA(true);
		try {
			await api.delete("/auth/2fa/disable");
			setTwoFactorEnabled(false);
			setTwoFactorSetup(null);
			toast.success("Autenticação em duas etapas desativada.");
		} catch (err) {
			toastError(err);
		}
		setLoading2FA(false);
	};

	return (
		<div className="w-full px-4 py-6 sm:px-6 lg:px-8">
			{/* Cabeçalho */}
			<div className="mb-6">
				<h1 className="text-2xl font-bold tracking-tight">
					{i18n.t("settings.title")}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Preferências da conta, aparência, automações e segurança.
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
				{/* Navegação lateral */}
				<nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
					{SECTIONS.map((section) => {
						const Icon = section.icon;
						const active = activeSection === section.id;
						return (
							<button
								key={section.id}
								type="button"
								onClick={() => setActiveSection(section.id)}
								className={
									"flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:w-full " +
									(active
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:bg-accent hover:text-accent-foreground")
								}
							>
								<Icon className="h-4 w-4 shrink-0" />
								{section.label}
							</button>
						);
					})}
				</nav>

				{/* Conteúdo */}
				<div className="min-w-0 max-w-3xl space-y-4">
					{/* ---------------- Geral ---------------- */}
					{activeSection === "geral" && (
						<SettingsCard
							icon={SlidersHorizontal}
							title="Cadastro de usuários"
							description="Define se novas pessoas podem criar conta pela tela de cadastro."
						>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<Label className="text-sm font-medium">
										{i18n.t("settings.settings.userCreation.name")}
									</Label>
									<p className="mt-0.5 text-xs text-muted-foreground">
										Desative para que apenas administradores criem usuários.
									</p>
								</div>
								{settings.length > 0 && (
									<Select
										value={getSettingValue("userCreation")}
										onValueChange={(v) => handleChangeSetting("userCreation", v)}
									>
										<SelectTrigger className="w-full sm:w-48">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="enabled">
												{i18n.t("settings.settings.userCreation.options.enabled")}
											</SelectItem>
											<SelectItem value="disabled">
												{i18n.t("settings.settings.userCreation.options.disabled")}
											</SelectItem>
										</SelectContent>
									</Select>
								)}
							</div>
						</SettingsCard>
					)}

					{/* ---------------- Aparência ---------------- */}
					{activeSection === "aparencia" && (
						<SettingsCard
							icon={Palette}
							title="Aparência (White-label)"
							description="Personalize nome, cor e imagens exibidas no sistema."
							footer={
								<Button onClick={handleSaveWhiteLabel} disabled={savingWhiteLabel}>
									{savingWhiteLabel && <Loader2 className="h-4 w-4 animate-spin" />}
									Salvar aparência
								</Button>
							}
						>
							<div className="space-y-5">
								<div className="space-y-1.5">
									<Label htmlFor="wl-app-name">Nome do aplicativo</Label>
									<Input
										id="wl-app-name"
										value={whiteLabel.appName}
										onChange={(e) =>
											setWhiteLabel((prev) => ({ ...prev, appName: e.target.value }))
										}
										placeholder="WhaTicket"
									/>
									<p className="text-xs text-muted-foreground">
										Aparece no topo da barra lateral e nas telas de acesso.
									</p>
								</div>

								<div className="space-y-1.5">
									<Label htmlFor="wl-primary-color">Cor primária</Label>
									<div className="flex items-center gap-3">
										<input
											id="wl-primary-color"
											type="color"
											value={whiteLabel.primaryColor}
											onChange={(e) =>
												setWhiteLabel((prev) => ({
													...prev,
													primaryColor: e.target.value,
												}))
											}
											className="h-10 w-14 cursor-pointer rounded-md border bg-transparent p-1"
										/>
										<Input
											value={whiteLabel.primaryColor}
											onChange={(e) =>
												setWhiteLabel((prev) => ({
													...prev,
													primaryColor: e.target.value,
												}))
											}
											className="w-36 font-mono text-xs"
										/>
										<span
											className="hidden h-10 flex-1 rounded-md sm:block"
											style={{ backgroundColor: whiteLabel.primaryColor }}
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label>Logo</Label>
										<div className="rounded-lg border border-dashed p-3">
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="w-full"
												onClick={() => logoInputRef.current && logoInputRef.current.click()}
											>
												<Upload className="h-4 w-4" />
												Enviar logo
											</Button>
											<input
												id="wl-logo"
												type="file"
												accept="image/*"
												ref={logoInputRef}
												onChange={(e) => handleUploadWhiteLabelFile(e, "logo")}
												className="hidden"
											/>
											<p className="mt-2 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
												{whiteLabel.logoUrl ? (
													<>
														<Check className="h-3 w-3 shrink-0 text-emerald-600" />
														<span className="truncate">{whiteLabel.logoUrl}</span>
													</>
												) : (
													"Nenhum arquivo enviado"
												)}
											</p>
										</div>
									</div>

									<div className="space-y-2">
										<Label>Imagem de fundo</Label>
										<div className="rounded-lg border border-dashed p-3">
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="w-full"
												onClick={() =>
													backgroundInputRef.current && backgroundInputRef.current.click()
												}
											>
												<Upload className="h-4 w-4" />
												Enviar imagem
											</Button>
											<input
												id="wl-background"
												type="file"
												accept="image/*"
												ref={backgroundInputRef}
												onChange={(e) => handleUploadWhiteLabelFile(e, "background")}
												className="hidden"
											/>
											<p className="mt-2 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
												{whiteLabel.backgroundUrl ? (
													<>
														<Check className="h-3 w-3 shrink-0 text-emerald-600" />
														<span className="truncate">
															{whiteLabel.backgroundUrl}
														</span>
													</>
												) : (
													"Nenhum arquivo enviado"
												)}
											</p>
										</div>
									</div>
								</div>
							</div>
						</SettingsCard>
					)}

					{/* ---------------- Automações ---------------- */}
					{activeSection === "automacoes" && (
						<SettingsCard
							icon={Cake}
							title="Aniversários"
							description="Envie uma mensagem automática de parabéns aos contatos."
							action={
								<div className="flex items-center gap-2">
									<Label
										htmlFor="birthday-enabled"
										className="text-xs font-normal text-muted-foreground"
									>
										Envio automático
									</Label>
									<Switch
										id="birthday-enabled"
										checked={birthdaySettings.isEnabled}
										onCheckedChange={(checked) =>
											setBirthdaySettings((prev) => ({
												...prev,
												isEnabled: checked,
											}))
										}
									/>
								</div>
							}
							footer={
								<Button
									onClick={handleSaveBirthdaySettings}
									disabled={savingBirthday}
								>
									{savingBirthday && <Loader2 className="h-4 w-4 animate-spin" />}
									Salvar automação
								</Button>
							}
						>
							<div className="space-y-5">
								<div className="space-y-1.5">
									<Label htmlFor="birthday-template">Mensagem de parabéns</Label>
									<Textarea
										id="birthday-template"
										rows={3}
										value={birthdaySettings.messageTemplate}
										onChange={(e) =>
											setBirthdaySettings((prev) => ({
												...prev,
												messageTemplate: e.target.value,
											}))
										}
										placeholder="Feliz aniversário, {{name}}! 🎉"
									/>
									<p className="text-xs text-muted-foreground">
										Use {"{{name}}"} para incluir o nome do contato.
									</p>
								</div>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div className="space-y-1.5">
										<Label htmlFor="birthday-hour">Hora do envio</Label>
										<Input
											id="birthday-hour"
											type="number"
											min={0}
											max={23}
											value={birthdaySettings.sendHour}
											onChange={(e) =>
												setBirthdaySettings((prev) => ({
													...prev,
													sendHour: e.target.value,
												}))
											}
										/>
										<p className="text-xs text-muted-foreground">
											Horário de 0 a 23.
										</p>
									</div>
									<div className="space-y-1.5">
										<Label>Conexão WhatsApp</Label>
										<Select
											value={
												birthdaySettings.whatsappId
													? String(birthdaySettings.whatsappId)
													: undefined
											}
											onValueChange={(v) =>
												setBirthdaySettings((prev) => ({
													...prev,
													whatsappId: +v,
												}))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Selecione a conexão" />
											</SelectTrigger>
											<SelectContent>
												{whatsApps.map((w) => (
													<SelectItem key={w.id} value={String(w.id)}>
														{w.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="rounded-lg border bg-muted/30 p-4">
									<div className="mb-2 flex items-center gap-2">
										<span className="text-sm font-medium">
											Aniversariantes de hoje
										</span>
										<Badge variant="secondary">{todayBirthdays.length}</Badge>
									</div>
									{todayBirthdays.length === 0 ? (
										<p className="text-xs text-muted-foreground">
											Nenhum aniversariante hoje.
										</p>
									) : (
										<ul className="space-y-1 text-sm">
											{todayBirthdays.map((contact) => (
												<li key={contact.id} className="text-muted-foreground">
													{contact.name}
													{contact.number ? ` — ${contact.number}` : ""}
												</li>
											))}
										</ul>
									)}
								</div>
							</div>
						</SettingsCard>
					)}

					{/* ---------------- Segurança ---------------- */}
					{activeSection === "seguranca" && (
						<SettingsCard
							icon={ShieldCheck}
							title="Autenticação em duas etapas (2FA)"
							description="Exige um código do aplicativo autenticador ao entrar."
							action={
								twoFactorEnabled ? (
									<Badge className="gap-1">
										<Check className="h-3 w-3" />
										Ativada
									</Badge>
								) : (
									<Badge variant="secondary">Desativada</Badge>
								)
							}
						>
							{twoFactorEnabled ? (
								<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
									<p className="text-sm text-muted-foreground">
										Sua conta está protegida com um código adicional no login.
									</p>
									<Button
										variant="outline"
										className="text-destructive hover:text-destructive"
										onClick={handleDisable2FA}
										disabled={loading2FA}
									>
										{loading2FA && <Loader2 className="h-4 w-4 animate-spin" />}
										Desativar 2FA
									</Button>
								</div>
							) : twoFactorSetup ? (
								<div className="space-y-4">
									<p className="text-sm text-muted-foreground">
										Escaneie o QR Code com seu aplicativo autenticador (Google
										Authenticator, Authy etc.) e informe o código de 6 dígitos
										para confirmar.
									</p>
									<div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
										{twoFactorSetup.qrCodeDataUrl && (
											<img
												src={twoFactorSetup.qrCodeDataUrl}
												alt="QR Code 2FA"
												className="h-44 w-44 shrink-0 rounded-lg border bg-white p-2"
											/>
										)}
										<div className="w-full flex-1 space-y-3">
											<div className="space-y-1.5">
												<Label className="text-xs">Chave secreta (manual)</Label>
												<Input
													readOnly
													value={twoFactorSetup.secret || ""}
													className="font-mono text-xs"
												/>
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="twofa-token">Código de 6 dígitos</Label>
												<Input
													id="twofa-token"
													inputMode="numeric"
													maxLength={6}
													placeholder="000000"
													value={twoFactorToken}
													onChange={(e) =>
														setTwoFactorToken(e.target.value.replace(/\D/g, ""))
													}
													className="font-mono tracking-widest"
												/>
											</div>
											<div className="flex gap-2">
												<Button
													variant="outline"
													onClick={() => setTwoFactorSetup(null)}
													disabled={loading2FA}
												>
													Cancelar
												</Button>
												<Button
													onClick={handleEnable2FA}
													disabled={loading2FA || twoFactorToken.length < 6}
												>
													{loading2FA && (
														<Loader2 className="h-4 w-4 animate-spin" />
													)}
													Confirmar e ativar
												</Button>
											</div>
										</div>
									</div>
								</div>
							) : (
								<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
									<p className="text-sm text-muted-foreground">
										Adicione uma camada extra de segurança exigindo um código do
										aplicativo autenticador no login.
									</p>
									<Button onClick={handleSetup2FA} disabled={loading2FA}>
										{loading2FA && <Loader2 className="h-4 w-4 animate-spin" />}
										Ativar 2FA
									</Button>
								</div>
							)}
						</SettingsCard>
					)}

					{/* ---------------- API ---------------- */}
					{activeSection === "api" && (
						<SettingsCard
							icon={KeyRound}
							title="Token da API"
							description="Use este token para integrar sistemas externos ao WhaTicket."
						>
							<div className="space-y-1.5">
								<Label htmlFor="api-token-setting">Token</Label>
								<div className="flex gap-2">
									<Input
										id="api-token-setting"
										readOnly
										value={settings.length > 0 ? getSettingValue("userApiToken") : ""}
										className="font-mono text-xs"
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={handleCopyToken}
										title="Copiar token"
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
								<p className="text-xs text-muted-foreground">
									Mantenha este token em segredo — quem o possui pode enviar
									mensagens em nome da sua empresa.
								</p>
							</div>
						</SettingsCard>
					)}
				</div>
			</div>
		</div>
	);
};

export default Settings;
