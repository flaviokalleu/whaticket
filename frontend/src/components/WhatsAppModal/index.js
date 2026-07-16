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
import { Switch } from "../ui/switch";

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

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
	const initialState = {
		name: "",
		greetingMessage: "",
		farewellMessage: "",
		isDefault: false,
	};
	const [whatsApp, setWhatsApp] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;

			try {
				const { data } = await api.get(`whatsapp/${whatsAppId}`);
				setWhatsApp(data);

				const whatsQueueIds = data.queues?.map((queue) => queue.id);
				setSelectedQueueIds(whatsQueueIds);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, [whatsAppId]);

	const handleSaveWhatsApp = async (values) => {
		const whatsappData = { ...values, queueIds: selectedQueueIds };

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
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-lg">
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
							<div className="flex items-end gap-4">
								<div className="flex-1 space-y-1.5">
									<Label htmlFor="name">{i18n.t("whatsappModal.form.name")}</Label>
									<Field as={Input} id="name" name="name" autoFocus />
									{touched.name && errors.name && (
										<p className="text-xs text-destructive">{errors.name}</p>
									)}
								</div>
								<div className="flex items-center gap-2 pb-2">
									<Switch
										id="isDefault"
										checked={values.isDefault}
										onCheckedChange={(checked) => setFieldValue("isDefault", checked)}
									/>
									<Label htmlFor="isDefault">{i18n.t("whatsappModal.form.default")}</Label>
								</div>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="greetingMessage">
									{i18n.t("queueModal.form.greetingMessage")}
								</Label>
								<Field as={Textarea} id="greetingMessage" name="greetingMessage" rows={4} />
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="farewellMessage">
									{i18n.t("whatsappModal.form.farewellMessage")}
								</Label>
								<Field as={Textarea} id="farewellMessage" name="farewellMessage" rows={4} />
							</div>

							<QueueSelect
								selectedQueueIds={selectedQueueIds}
								onChange={(selectedIds) => setSelectedQueueIds(selectedIds)}
							/>

							<DialogFooter>
								<Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
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
