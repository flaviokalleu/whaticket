import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { Loader2, Pipette } from "lucide-react";

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

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";

const QueueSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	color: Yup.string().min(3, "Too Short!").max(9, "Too Long!").required(),
	greetingMessage: Yup.string(),
});

const QueueModal = ({ open, onClose, queueId }) => {
	const initialState = {
		name: "",
		color: "",
		greetingMessage: "",
	};

	const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
	const [queue, setQueue] = useState(initialState);
	const greetingRef = useRef();

	useEffect(() => {
		(async () => {
			if (!queueId) return;
			try {
				const { data } = await api.get(`/queue/${queueId}`);
				setQueue((prevState) => {
					return { ...prevState, ...data };
				});
			} catch (err) {
				toastError(err);
			}
		})();

		return () => {
			setQueue({
				name: "",
				color: "",
				greetingMessage: "",
			});
		};
	}, [queueId, open]);

	const handleClose = () => {
		onClose();
		setQueue(initialState);
	};

	const handleSaveQueue = async (values) => {
		try {
			if (queueId) {
				await api.put(`/queue/${queueId}`, values);
			} else {
				await api.post("/queue", values);
			}
			toast.success("Queue saved successfully");
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{queueId
							? i18n.t("queueModal.title.edit")
							: i18n.t("queueModal.title.add")}
					</DialogTitle>
				</DialogHeader>
				<Formik
					initialValues={queue}
					enableReinitialize={true}
					validationSchema={QueueSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveQueue(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values, setFieldValue }) => (
						<Form className="space-y-4">
							<div className="flex gap-3">
								<div className="flex-1 space-y-1.5">
									<Label htmlFor="name">{i18n.t("queueModal.form.name")}</Label>
									<Field as={Input} id="name" name="name" autoFocus />
									{touched.name && errors.name && (
										<p className="text-xs text-destructive">{errors.name}</p>
									)}
								</div>
								<div className="flex-1 space-y-1.5">
									<Label htmlFor="color">{i18n.t("queueModal.form.color")}</Label>
									<div className="relative">
										<span
											className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-sm border"
											style={{ backgroundColor: values.color }}
										/>
										<Field
											as={Input}
											id="color"
											name="color"
											className="pl-9 pr-9"
											onFocus={() => {
												setColorPickerModalOpen(true);
												greetingRef.current?.focus();
											}}
										/>
										<button
											type="button"
											onClick={() => setColorPickerModalOpen(true)}
											className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										>
											<Pipette className="h-4 w-4" />
										</button>
									</div>
									{touched.color && errors.color && (
										<p className="text-xs text-destructive">{errors.color}</p>
									)}
								</div>
							</div>

							<ColorPicker
								open={colorPickerModalOpen}
								currentColor={values.color}
								handleClose={() => setColorPickerModalOpen(false)}
								onChange={(color) => {
									setFieldValue("color", color);
									setQueue((prev) => ({ ...prev, ...values, color }));
								}}
							/>

							<div className="space-y-1.5">
								<Label htmlFor="greetingMessage">
									{i18n.t("queueModal.form.greetingMessage")}
								</Label>
								<Field
									as={Textarea}
									id="greetingMessage"
									name="greetingMessage"
									innerRef={greetingRef}
									rows={5}
								/>
								{touched.greetingMessage && errors.greetingMessage && (
									<p className="text-xs text-destructive">{errors.greetingMessage}</p>
								)}
							</div>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={handleClose}
									disabled={isSubmitting}
								>
									{i18n.t("queueModal.buttons.cancel")}
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
									{queueId
										? i18n.t("queueModal.buttons.okEdit")
										: i18n.t("queueModal.buttons.okAdd")}
								</Button>
							</DialogFooter>
						</Form>
					)}
				</Formik>
			</DialogContent>
		</Dialog>
	);
};

export default QueueModal;
