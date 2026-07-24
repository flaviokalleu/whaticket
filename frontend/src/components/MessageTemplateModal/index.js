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

import api from "../../services/api";
import toastError from "../../errors/toastError";

const TemplateSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Muito curto!")
		.max(50, "Muito longo!")
		.required("Obrigatório"),
	body: Yup.string().min(1, "Muito curto!").required("Obrigatório"),
});

const MessageTemplateModal = ({ open, onClose, templateId, onSaved }) => {
	const initialState = {
		name: "",
		body: "",
	};

	const [template, setTemplate] = useState(initialState);

	useEffect(() => {
		(async () => {
			if (!templateId) return;
			try {
				const { data } = await api.get(`/templates/${templateId}`);
				setTemplate({
					name: data.name || "",
					body: data.body || "",
				});
			} catch (err) {
				toastError(err);
			}
		})();

		return () => {
			setTemplate({ name: "", body: "" });
		};
	}, [templateId, open]);

	const handleClose = () => {
		onClose();
		setTemplate(initialState);
	};

	const handleSaveTemplate = async (values) => {
		try {
			let data;
			if (templateId) {
				({ data } = await api.put(`/templates/${templateId}`, values));
			} else {
				({ data } = await api.post("/templates", values));
			}
			if (onSaved) onSaved(data);
			toast.success("Modelo salvo com sucesso!");
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
						{templateId ? "Editar modelo" : "Adicionar modelo"}
					</DialogTitle>
				</DialogHeader>
				<Formik
					initialValues={template}
					enableReinitialize={true}
					validationSchema={TemplateSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveTemplate(values);
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
								<Label htmlFor="body">Mensagem</Label>
								<Field as={Textarea} id="body" name="body" rows={5} />
								<p className="text-xs text-muted-foreground">
									{"Você pode usar variáveis como {{name}} que serão substituídas ao enviar."}
								</p>
								{touched.body && errors.body && (
									<p className="text-xs text-destructive">{errors.body}</p>
								)}
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

export default MessageTemplateModal;
