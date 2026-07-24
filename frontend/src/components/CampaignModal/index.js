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
import { Textarea } from "../ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { MultiSelect } from "../ui/multi-select";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import useWhatsApps from "../../hooks/useWhatsApps";

const CampaignSchema = Yup.object().shape({
	name: Yup.string().min(2, "Muito curto!").required("Obrigatório"),
	body: Yup.string().required("Obrigatório"),
	whatsappId: Yup.string().required("Obrigatório"),
	intervalSeconds: Yup.number().min(1, "Mínimo 1").required("Obrigatório"),
});

const CampaignModal = ({ open, onClose, campaignId }) => {
	const initialState = {
		name: "",
		body: "",
		whatsappId: "",
		mediaUrl: "",
		intervalSeconds: 20,
		scheduledFor: "",
	};

	const [campaign, setCampaign] = useState(initialState);
	const { whatsApps } = useWhatsApps();

	const [targetTab, setTargetTab] = useState("contacts");
	const [contactOptions, setContactOptions] = useState([]);
	const [selectedContacts, setSelectedContacts] = useState([]);
	const [contactSearch, setContactSearch] = useState("");
	const [tags, setTags] = useState([]);
	const [queues, setQueues] = useState([]);
	const [selectedTagId, setSelectedTagId] = useState("");
	const [selectedQueueId, setSelectedQueueId] = useState("");

	useEffect(() => {
		if (!open) return;
		(async () => {
			try {
				const { data } = await api.get("/tags");
				setTags(Array.isArray(data) ? data : []);
			} catch (err) {
				toastError(err);
			}
			try {
				const { data } = await api.get("/queue");
				setQueues(Array.isArray(data) ? data : []);
			} catch (err) {
				toastError(err);
			}
		})();
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				try {
					const { data } = await api.get("/contacts/", {
						params: { searchParam: contactSearch },
					});
					setContactOptions(data.contacts || []);
				} catch (err) {
					toastError(err);
				}
			};
			fetchContacts();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [contactSearch, open]);

	useEffect(() => {
		(async () => {
			if (!campaignId) return;
			try {
				const { data } = await api.get(`/campaigns/${campaignId}`);
				setCampaign((prevState) => ({
					...prevState,
					name: data.name || "",
					body: data.body || "",
					whatsappId: data.whatsappId ? String(data.whatsappId) : "",
					mediaUrl: data.mediaUrl || "",
					intervalSeconds: data.intervalSeconds || 20,
					scheduledFor: data.scheduledFor
						? new Date(data.scheduledFor).toISOString().slice(0, 16)
						: "",
				}));
			} catch (err) {
				toastError(err);
			}
		})();

		return () => {
			setCampaign(initialState);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [campaignId, open]);

	const handleClose = () => {
		onClose();
		setCampaign(initialState);
		setSelectedContacts([]);
		setContactSearch("");
		setSelectedTagId("");
		setSelectedQueueId("");
		setTargetTab("contacts");
	};

	const mergedContactOptions = (() => {
		const map = new Map();
		selectedContacts.forEach((c) => map.set(String(c.id), c));
		contactOptions.forEach((c) => map.set(String(c.id), c));
		return Array.from(map.values()).map((c) => ({
			value: String(c.id),
			label: c.name,
		}));
	})();

	const handleContactsChange = (values) => {
		const lookup = new Map();
		selectedContacts.forEach((c) => lookup.set(String(c.id), c));
		contactOptions.forEach((c) => lookup.set(String(c.id), c));
		setSelectedContacts(
			values.map((v) => lookup.get(v)).filter((c) => Boolean(c))
		);
	};

	const handleSaveCampaign = async (values) => {
		const payload = {
			name: values.name,
			body: values.body,
			whatsappId: +values.whatsappId,
			mediaUrl: values.mediaUrl || null,
			intervalSeconds: +values.intervalSeconds || 20,
			scheduledFor: values.scheduledFor || null,
		};

		try {
			if (campaignId) {
				await api.put(`/campaigns/${campaignId}`, payload);
			} else {
				if (targetTab === "contacts" && selectedContacts.length > 0) {
					payload.contactIds = selectedContacts.map((c) => +c.id);
				}
				if (targetTab === "tag" && selectedTagId) {
					payload.tagId = +selectedTagId;
				}
				if (targetTab === "queue" && selectedQueueId) {
					payload.queueId = +selectedQueueId;
				}
				await api.post("/campaigns", payload);
			}
			toast.success("Campanha salva com sucesso.");
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{campaignId ? "Editar campanha" : "Nova campanha"}
					</DialogTitle>
				</DialogHeader>
				<Formik
					initialValues={campaign}
					enableReinitialize={true}
					validationSchema={CampaignSchema}
					onSubmit={(values, actions) => {
						setTimeout(async () => {
							await handleSaveCampaign(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values, setFieldValue }) => (
						<Form className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="name">Nome</Label>
								<Field as={Input} id="name" name="name" autoFocus />
								{touched.name && errors.name && (
									<p className="text-xs text-destructive">{errors.name}</p>
								)}
							</div>

							<div className="space-y-1.5">
								<Label>Conexão</Label>
								<Select
									value={values.whatsappId ? String(values.whatsappId) : undefined}
									onValueChange={(v) => setFieldValue("whatsappId", v)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Selecione a conexão" />
									</SelectTrigger>
									<SelectContent>
										{whatsApps.map((whatsapp) => (
											<SelectItem key={whatsapp.id} value={String(whatsapp.id)}>
												{whatsapp.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{touched.whatsappId && errors.whatsappId && (
									<p className="text-xs text-destructive">{errors.whatsappId}</p>
								)}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="body">Mensagem</Label>
								<Field
									as={Textarea}
									id="body"
									name="body"
									rows={4}
									placeholder="Olá {{name}}, tudo bem?"
								/>
								<p className="text-xs text-muted-foreground">
									{"Use {{name}} para inserir o nome do contato."}
								</p>
								{touched.body && errors.body && (
									<p className="text-xs text-destructive">{errors.body}</p>
								)}
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1.5">
									<Label htmlFor="mediaUrl">URL de mídia (opcional)</Label>
									<Field as={Input} id="mediaUrl" name="mediaUrl" />
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="intervalSeconds">Intervalo (segundos)</Label>
									<Field
										as={Input}
										id="intervalSeconds"
										name="intervalSeconds"
										type="number"
										min={1}
									/>
									{touched.intervalSeconds && errors.intervalSeconds && (
										<p className="text-xs text-destructive">
											{errors.intervalSeconds}
										</p>
									)}
								</div>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="scheduledFor">Agendar para (opcional)</Label>
								<Field
									as={Input}
									id="scheduledFor"
									name="scheduledFor"
									type="datetime-local"
								/>
							</div>

							{!campaignId && (
								<div className="space-y-1.5">
									<Label>Destinatários</Label>
									<Tabs value={targetTab} onValueChange={setTargetTab}>
										<TabsList className="grid w-full grid-cols-3">
											<TabsTrigger value="contacts">Selecionar contatos</TabsTrigger>
											<TabsTrigger value="tag">Por tag</TabsTrigger>
											<TabsTrigger value="queue">Por fila</TabsTrigger>
										</TabsList>
										<TabsContent value="contacts" className="space-y-2 pt-2">
											<Input
												placeholder="Buscar contatos..."
												value={contactSearch}
												onChange={(e) => setContactSearch(e.target.value)}
											/>
											<MultiSelect
												options={mergedContactOptions}
												value={selectedContacts.map((c) => String(c.id))}
												onChange={handleContactsChange}
												placeholder="Selecione os contatos"
											/>
										</TabsContent>
										<TabsContent value="tag" className="pt-2">
											<Select
												value={selectedTagId || undefined}
												onValueChange={setSelectedTagId}
											>
												<SelectTrigger>
													<SelectValue placeholder="Selecione uma tag" />
												</SelectTrigger>
												<SelectContent>
													{tags.map((tag) => (
														<SelectItem key={tag.id} value={String(tag.id)}>
															{tag.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</TabsContent>
										<TabsContent value="queue" className="pt-2">
											<Select
												value={selectedQueueId || undefined}
												onValueChange={setSelectedQueueId}
											>
												<SelectTrigger>
													<SelectValue placeholder="Selecione uma fila" />
												</SelectTrigger>
												<SelectContent>
													{queues.map((queue) => (
														<SelectItem key={queue.id} value={String(queue.id)}>
															{queue.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</TabsContent>
									</Tabs>
								</div>
							)}

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
									{campaignId ? "Salvar" : "Criar"}
								</Button>
							</DialogFooter>
						</Form>
					)}
				</Formik>
			</DialogContent>
		</Dialog>
	);
};

export default CampaignModal;
