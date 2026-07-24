import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { MultiSelect } from "../ui/multi-select";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const EVENT_OPTIONS = [
	{ value: "ticket.created", label: "ticket.created" },
	{ value: "ticket.closed", label: "ticket.closed" },
	{ value: "message.received", label: "message.received" },
];

const WebhookSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Muito curto!")
		.max(50, "Muito longo!")
		.required("Obrigatório"),
	url: Yup.string().url("URL inválida").required("Obrigatório"),
	secret: Yup.string(),
});

const WebhookModal = ({ open, onClose, webhookId, onSaved }) => {
	const initialState = {
		name: "",
		url: "",
		secret: "",
	};

	const [webhook, setWebhook] = useState(initialState);
	const [events, setEvents] = useState([]);
	const [isActive, setIsActive] = useState(true);

	useEffect(() => {
		(async () => {
			if (!webhookId) return;
			try {
				const { data } = await api.get(`/webhooks/${webhookId}`);
				setWebhook({
					name: data.name || "",
					url: data.url || "",
					secret: data.secret || "",
				});
				setEvents(data.events || []);
				setIsActive(data.isActive);
			} catch (err) {
				toastError(err);
			}
		})();

		return () => {
			setWebhook({ name: "", url: "", secret: "" });
			setEvents([]);
			setIsActive(true);
		};
	}, [webhookId, open]);

	const handleClose = () => {
		onClose();
		setWebhook(initialState);
		setEvents([]);
		setIsActive(true);
	};

	const handleSaveWebhook = async (values) => {
		if (events.length === 0) {
			toast.error("Selecione ao menos um evento para o webhook.");
			return;
		}
		const payload = {
			name: values.name,
			url: values.url,
			secret: values.secret || null,
			events,
			isActive,
		};
		try {
			let data;
			if (webhookId) {
				({ data } = await api.put(`/webhooks/${webhookId}`, payload));
			} else {
				({ data } = await api.post("/webhooks", payload));
			}
			if (onSaved) onSaved(data);
			toast.success("Webhook salvo com sucesso!");
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{webhookId ? "Editar webhook" : "Adicionar webhook"}
					</DialogTitle>
				</DialogHeader>
				<Formik
					initialValues={webhook}
					enableReinitialize={true}
					validationSchema={WebhookSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveWebhook(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting }) => (
						<Form className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="name">Nome</Label>
								<Field as={Input} id="name" name="name" autoFocus />
								{touched.name && errors.name && (
									<p className="text-xs text-destructive">{errors.name}</p>
								)}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="url">URL</Label>
								<Field
									as={Input}
									id="url"
									name="url"
									placeholder="https://exemplo.com/webhook"
								/>
								{touched.url && errors.url && (
									<p className="text-xs text-destructive">{errors.url}</p>
								)}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="secret">Segredo (opcional)</Label>
								<Field as={Input} id="secret" name="secret" />
							</div>

							<div className="space-y-1.5">
								<Label>Eventos</Label>
								<MultiSelect
									options={EVENT_OPTIONS}
									value={events}
									onChange={setEvents}
									placeholder="Selecione os eventos"
								/>
							</div>

							<div className="flex items-center gap-2">
								<Switch
									id="isActive"
									checked={isActive}
									onCheckedChange={setIsActive}
								/>
								<Label htmlFor="isActive">Ativo</Label>
							</div>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={handleClose}
									disabled={isSubmitting}
								>
									Cancelar
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
									Salvar
								</Button>
							</DialogFooter>
						</Form>
					)}
				</Formik>
			</DialogContent>
		</Dialog>
	);
};

export default WebhookModal;
