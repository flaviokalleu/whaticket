import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { Loader2, Workflow, ExternalLink } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

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
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";

const SessionSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
});

const NO_FLOW = "none";

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
	const initialState = {
		name: "",
		greetingMessage: "",
		farewellMessage: "",
		isDefault: false,
	};
	const [whatsApp, setWhatsApp] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [flows, setFlows] = useState([]);
	const [selectedFlowId, setSelectedFlowId] = useState(NO_FLOW);

	useEffect(() => {
		if (!open) return;
		(async () => {
			try {
				const { data } = await api.get("/flows");
				setFlows(Array.isArray(data) ? data : []);
			} catch (err) {
				toastError(err);
			}
		})();
	}, [open]);

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;

			try {
				const { data } = await api.get(`whatsapp/${whatsAppId}`);
				setWhatsApp(data);

				const whatsQueueIds = data.queues?.map((queue) => queue.id);
				setSelectedQueueIds(whatsQueueIds);
				setSelectedFlowId(data.flowId ? String(data.flowId) : NO_FLOW);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, [whatsAppId]);

	const handleSaveWhatsApp = async (values) => {
		const whatsappData = {
			...values,
			queueIds: selectedQueueIds,
			flowId: selectedFlowId === NO_FLOW ? null : +selectedFlowId,
		};

		try {
			if (whatsAppId) {
				await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
			} else {
				await api.post("/whatsapp", whatsappData);
			}
			toast.success(i18n.t("whatsappModal.success"));
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};

	const handleClose = () => {
		onClose();
		setWhatsApp(initialState);
		setSelectedFlowId(NO_FLOW);
	};

	const activeFlows = flows.filter((flow) => flow.isActive);

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{whatsAppId
							? i18n.t("whatsappModal.title.edit")
							: i18n.t("whatsappModal.title.add")}
					</DialogTitle>
				</DialogHeader>
				<Formik
					initialValues={whatsApp}
					enableReinitialize={true}
					validationSchema={SessionSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveWhatsApp(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, touched, errors, isSubmitting, setFieldValue }) => (
						<Form className="space-y-4">
							<Tabs defaultValue="geral">
								<TabsList className="w-full">
									<TabsTrigger value="geral" className="flex-1">
										Geral
									</TabsTrigger>
									<TabsTrigger value="mensagens" className="flex-1">
										Mensagens
									</TabsTrigger>
									<TabsTrigger value="atendimento" className="flex-1">
										Atendimento
									</TabsTrigger>
									<TabsTrigger value="automacao" className="flex-1">
										Automação
									</TabsTrigger>
								</TabsList>

								{/* ---------------- Geral ---------------- */}
								<TabsContent value="geral" className="mt-4 space-y-4">
									<div className="space-y-1.5">
										<Label htmlFor="name">{i18n.t("whatsappModal.form.name")}</Label>
										<Field as={Input} id="name" name="name" autoFocus />
										{touched.name && errors.name && (
											<p className="text-xs text-destructive">{errors.name}</p>
										)}
									</div>

									<div className="flex items-center justify-between gap-4 rounded-lg border p-3">
										<div>
											<Label htmlFor="isDefault" className="text-sm font-medium">
												{i18n.t("whatsappModal.form.default")}
											</Label>
											<p className="mt-0.5 text-xs text-muted-foreground">
												Conexão usada quando nenhuma outra for especificada.
											</p>
										</div>
										<Switch
											id="isDefault"
											checked={values.isDefault}
											onCheckedChange={(checked) =>
												setFieldValue("isDefault", checked)
											}
										/>
									</div>
								</TabsContent>

								{/* ---------------- Mensagens ---------------- */}
								<TabsContent value="mensagens" className="mt-4 space-y-4">
									<div className="space-y-1.5">
										<Label htmlFor="greetingMessage">
											{i18n.t("queueModal.form.greetingMessage")}
										</Label>
										<Field
											as={Textarea}
											id="greetingMessage"
											name="greetingMessage"
											rows={4}
											placeholder="Olá! Como podemos ajudar?"
										/>
										<p className="text-xs text-muted-foreground">
											Enviada ao abrir um novo atendimento. Com mais de uma fila,
											é usada junto do menu de escolha.
										</p>
									</div>

									<div className="space-y-1.5">
										<Label htmlFor="farewellMessage">
											{i18n.t("whatsappModal.form.farewellMessage")}
										</Label>
										<Field
											as={Textarea}
											id="farewellMessage"
											name="farewellMessage"
											rows={4}
											placeholder="Atendimento encerrado. Obrigado pelo contato!"
										/>
										<p className="text-xs text-muted-foreground">
											Enviada quando o ticket é finalizado.
										</p>
									</div>
								</TabsContent>

								{/* ---------------- Atendimento ---------------- */}
								<TabsContent value="atendimento" className="mt-4 space-y-4">
									<div>
										<QueueSelect
											selectedQueueIds={selectedQueueIds}
											onChange={(selectedIds) => setSelectedQueueIds(selectedIds)}
										/>
										<p className="mt-1.5 text-xs text-muted-foreground">
											Com uma fila, os tickets entram nela automaticamente. Com
											várias, o cliente escolhe por um menu numérico.
										</p>
									</div>
								</TabsContent>

								{/* ---------------- Automação ---------------- */}
								<TabsContent value="automacao" className="mt-4 space-y-4">
									<div className="space-y-1.5">
										<Label className="flex items-center gap-2">
											<Workflow className="h-4 w-4 text-muted-foreground" />
											Fluxo de automação
										</Label>
										<Select
											value={selectedFlowId}
											onValueChange={setSelectedFlowId}
										>
											<SelectTrigger>
												<SelectValue placeholder="Nenhum fluxo" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={NO_FLOW}>Nenhum fluxo</SelectItem>
												{activeFlows.map((flow) => (
													<SelectItem key={flow.id} value={String(flow.id)}>
														{flow.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<p className="text-xs text-muted-foreground">
											O fluxo é executado a cada mensagem recebida nesta conexão
											(exceto grupos). Ele recebe nome, número, texto da mensagem
											e o ticket como entrada.
										</p>
									</div>

									{activeFlows.length === 0 && (
										<div className="rounded-lg border border-dashed p-4 text-center">
											<p className="text-sm text-muted-foreground">
												Nenhum fluxo ativo disponível.
											</p>
											<RouterLink to="/flows" onClick={handleClose}>
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="mt-2"
												>
													<ExternalLink className="h-3.5 w-3.5" />
													Criar um fluxo
												</Button>
											</RouterLink>
										</div>
									)}
								</TabsContent>
							</Tabs>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={handleClose}
									disabled={isSubmitting}
								>
									{i18n.t("whatsappModal.buttons.cancel")}
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
									{whatsAppId
										? i18n.t("whatsappModal.buttons.okEdit")
										: i18n.t("whatsappModal.buttons.okAdd")}
								</Button>
							</DialogFooter>
						</Form>
					)}
				</Formik>
			</DialogContent>
		</Dialog>
	);
};

export default React.memo(WhatsAppModal);
