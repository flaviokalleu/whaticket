import React, { useState, useEffect, useContext, useRef } from "react";
import openSocket from "../../services/socket-io";
import { toast } from "react-toastify";
import { Copy, Loader2, Cake, ShieldCheck, Palette } from "lucide-react";

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

const Settings = () => {
	const { user } = useContext(AuthContext);
	const { whatsApps } = useWhatsApps();

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
		<div className="mx-auto w-full max-w-2xl px-6 py-10">
			<p className="mb-4 text-sm font-medium text-muted-foreground">
				{i18n.t("settings.title")}
			</p>

			<div className="space-y-3">
				<div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
					<Label className="text-sm font-normal">
						{i18n.t("settings.settings.userCreation.name")}
					</Label>
					{settings.length > 0 && (
						<Select
							value={getSettingValue("userCreation")}
							onValueChange={(v) => handleChangeSetting("userCreation", v)}
						>
							<SelectTrigger className="w-44">
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

				<div className="rounded-xl border bg-card p-4">
					<Label htmlFor="api-token-setting" className="text-sm font-normal">
						Token Api
					</Label>
					<div className="mt-1.5 flex gap-2">
						<Input
							id="api-token-setting"
							readOnly
							value={settings.length > 0 ? getSettingValue("userApiToken") : ""}
							className="font-mono text-xs"
						/>
						<Button type="button" variant="outline" size="icon" onClick={handleCopyToken}>
							<Copy className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Aparência / White-label */}
				<div className="rounded-xl border bg-card p-4">
					<div className="mb-4 flex items-center gap-2">
						<Palette className="h-4 w-4 text-muted-foreground" />
						<h3 className="text-sm font-semibold">Aparência (White-label)</h3>
					</div>
					<div className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="wl-app-name">Nome do aplicativo</Label>
							<Input
								id="wl-app-name"
								value={whiteLabel.appName}
								onChange={(e) =>
									setWhiteLabel((prev) => ({ ...prev, appName: e.target.value }))
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="wl-primary-color">Cor primária</Label>
							<div className="flex items-center gap-2">
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
									className="h-9 w-12 cursor-pointer rounded-md border bg-transparent p-1"
								/>
								<Input
									value={whiteLabel.primaryColor}
									onChange={(e) =>
										setWhiteLabel((prev) => ({
											...prev,
											primaryColor: e.target.value,
										}))
									}
									className="w-32 font-mono text-xs"
								/>
							</div>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="wl-logo">Logo</Label>
								<Input
									id="wl-logo"
									type="file"
									accept="image/*"
									ref={logoInputRef}
									onChange={(e) => handleUploadWhiteLabelFile(e, "logo")}
								/>
								{whiteLabel.logoUrl && (
									<p className="truncate text-xs text-muted-foreground">
										Arquivo atual: {whiteLabel.logoUrl}
									</p>
								)}
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="wl-background">Imagem de fundo</Label>
								<Input
									id="wl-background"
									type="file"
									accept="image/*"
									ref={backgroundInputRef}
									onChange={(e) => handleUploadWhiteLabelFile(e, "background")}
								/>
								{whiteLabel.backgroundUrl && (
									<p className="truncate text-xs text-muted-foreground">
										Arquivo atual: {whiteLabel.backgroundUrl}
									</p>
								)}
							</div>
						</div>
						<div className="flex justify-end">
							<Button onClick={handleSaveWhiteLabel} disabled={savingWhiteLabel}>
								{savingWhiteLabel && <Loader2 className="h-4 w-4 animate-spin" />}
								Salvar aparência
							</Button>
						</div>
					</div>
				</div>

				{/* Aniversários */}
				<div className="rounded-xl border bg-card p-4">
					<div className="mb-4 flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<Cake className="h-4 w-4 text-muted-foreground" />
							<h3 className="text-sm font-semibold">Aniversários</h3>
						</div>
						<div className="flex items-center gap-2">
							<Label htmlFor="birthday-enabled" className="text-sm font-normal">
								Envio automático
							</Label>
							<Switch
								id="birthday-enabled"
								checked={birthdaySettings.isEnabled}
								onCheckedChange={(checked) =>
									setBirthdaySettings((prev) => ({ ...prev, isEnabled: checked }))
								}
							/>
						</div>
					</div>
					<div className="space-y-4">
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
							/>
							<p className="text-xs text-muted-foreground">
								Use {"{{name}}"} para incluir o nome do contato.
							</p>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="birthday-hour">Hora do envio (0-23)</Label>
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
										setBirthdaySettings((prev) => ({ ...prev, whatsappId: +v }))
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
						<div className="rounded-lg border bg-muted/30 p-3">
							<div className="mb-1 flex items-center gap-2">
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
								<ul className="space-y-0.5 text-sm">
									{todayBirthdays.map((contact) => (
										<li key={contact.id} className="text-muted-foreground">
											{contact.name}
											{contact.number ? ` — ${contact.number}` : ""}
										</li>
									))}
								</ul>
							)}
						</div>
						<div className="flex justify-end">
							<Button onClick={handleSaveBirthdaySettings} disabled={savingBirthday}>
								{savingBirthday && <Loader2 className="h-4 w-4 animate-spin" />}
								Salvar aniversários
							</Button>
						</div>
					</div>
				</div>

				{/* Segurança / 2FA */}
				<div className="rounded-xl border bg-card p-4">
					<div className="mb-4 flex items-center gap-2">
						<ShieldCheck className="h-4 w-4 text-muted-foreground" />
						<h3 className="text-sm font-semibold">
							Segurança — Autenticação em duas etapas (2FA)
						</h3>
					</div>

					{twoFactorEnabled ? (
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm">
									A autenticação em duas etapas está{" "}
									<Badge className="align-middle">ativada</Badge>
								</p>
								<p className="mt-1 text-xs text-muted-foreground">
									Sua conta está protegida com um código adicional no login.
								</p>
							</div>
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
								Escaneie o QR Code abaixo com seu aplicativo autenticador
								(Google Authenticator, Authy etc.) e informe o código de 6
								dígitos para confirmar.
							</p>
							<div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
								{twoFactorSetup.qrCodeDataUrl && (
									<img
										src={twoFactorSetup.qrCodeDataUrl}
										alt="QR Code 2FA"
										className="h-44 w-44 rounded-lg border bg-white p-2"
									/>
								)}
								<div className="flex-1 space-y-3">
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
											{loading2FA && <Loader2 className="h-4 w-4 animate-spin" />}
											Confirmar e ativar
										</Button>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="flex items-center justify-between gap-4">
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
				</div>
			</div>
		</div>
	);
};

export default Settings;
