import React, { useState, useEffect } from "react";
import openSocket from "../../services/socket-io";
import { toast } from "react-toastify";
import { Copy } from "lucide-react";

import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
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

const Settings = () => {
	const [settings, setSettings] = useState([]);

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
			</div>
		</div>
	);
};

export default Settings;
