import React, { useState, useEffect } from "react";

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

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";

const TagSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	color: Yup.string().min(3, "Too Short!").max(9, "Too Long!").required(),
});

const TagModal = ({ open, onClose, tagId }) => {
	const initialState = {
		name: "",
		color: "",
	};

	const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
	const [tag, setTag] = useState(initialState);

	useEffect(() => {
		(async () => {
			if (!tagId) return;
			try {
				const { data } = await api.get(`/tags/${tagId}`);
				setTag((prevState) => {
					return { ...prevState, ...data };
				});
			} catch (err) {
				toastError(err);
			}
		})();

		return () => {
			setTag({
				name: "",
				color: "",
			});
		};
	}, [tagId, open]);

	const handleClose = () => {
		onClose();
		setTag(initialState);
	};

	const handleSaveTag = async (values) => {
		try {
			if (tagId) {
				await api.put(`/tags/${tagId}`, values);
			} else {
				await api.post("/tags", values);
			}
			toast.success(i18n.t("tagModal.success"));
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
						{tagId ? i18n.t("tagModal.title.edit") : i18n.t("tagModal.title.add")}
					</DialogTitle>
				</DialogHeader>
				<Formik
					initialValues={tag}
					enableReinitialize={true}
					validationSchema={TagSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveTag(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values, setFieldValue }) => (
						<Form className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="name">{i18n.t("tagModal.form.name")}</Label>
								<Field as={Input} id="name" name="name" autoFocus />
								{touched.name && errors.name && (
									<p className="text-xs text-destructive">{errors.name}</p>
								)}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="color">{i18n.t("tagModal.form.color")}</Label>
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
										onFocus={() => setColorPickerModalOpen(true)}
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

							<ColorPicker
								open={colorPickerModalOpen}
								currentColor={values.color}
								handleClose={() => setColorPickerModalOpen(false)}
								onChange={(color) => {
									setFieldValue("color", color);
									setTag((prev) => ({ ...prev, ...values, color }));
								}}
							/>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={handleClose}
									disabled={isSubmitting}
								>
									{i18n.t("tagModal.buttons.cancel")}
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
									{tagId
										? i18n.t("tagModal.buttons.okEdit")
										: i18n.t("tagModal.buttons.okAdd")}
								</Button>
							</DialogFooter>
						</Form>
					)}
				</Formik>
			</DialogContent>
		</Dialog>
	);
};

export default TagModal;
