import React, { useState, useEffect, useRef } from "react";

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

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const QuickAnswerSchema = Yup.object().shape({
	shortcut: Yup.string()
		.min(2, "Too Short!")
		.max(15, "Too Long!")
		.required("Required"),
	message: Yup.string()
		.min(8, "Too Short!")
		.max(30000, "Too Long!")
		.required("Required"),
});

const QuickAnswersModal = ({
	open,
	onClose,
	quickAnswerId,
	initialValues,
	onSave,
}) => {
	const isMounted = useRef(true);

	const initialState = {
		shortcut: "",
		message: "",
	};

	const [quickAnswer, setQuickAnswer] = useState(initialState);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		const fetchQuickAnswer = async () => {
			if (initialValues) {
				setQuickAnswer((prevState) => {
					return { ...prevState, ...initialValues };
				});
			}

			if (!quickAnswerId) return;

			try {
				const { data } = await api.get(`/quickAnswers/${quickAnswerId}`);
				if (isMounted.current) {
					setQuickAnswer(data);
				}
			} catch (err) {
				toastError(err);
			}
		};

		fetchQuickAnswer();
	}, [quickAnswerId, open, initialValues]);

	const handleClose = () => {
		onClose();
		setQuickAnswer(initialState);
	};

	const handleSaveQuickAnswer = async (values) => {
		try {
			if (quickAnswerId) {
				await api.put(`/quickAnswers/${quickAnswerId}`, values);
				handleClose();
			} else {
				const { data } = await api.post("/quickAnswers", values);
				if (onSave) {
					onSave(data);
				}
				handleClose();
			}
			toast.success(i18n.t("quickAnswersModal.success"));
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{quickAnswerId
							? i18n.t("quickAnswersModal.title.edit")
							: i18n.t("quickAnswersModal.title.add")}
					</DialogTitle>
				</DialogHeader>
				<Formik
					initialValues={quickAnswer}
					enableReinitialize={true}
					validationSchema={QuickAnswerSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveQuickAnswer(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ errors, touched, isSubmitting }) => (
						<Form className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="shortcut">
									{i18n.t("quickAnswersModal.form.shortcut")}
								</Label>
								<Field as={Input} id="shortcut" name="shortcut" autoFocus />
								{touched.shortcut && errors.shortcut && (
									<p className="text-xs text-destructive">{errors.shortcut}</p>
								)}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="message">
									{i18n.t("quickAnswersModal.form.message")}
								</Label>
								<Field as={Textarea} id="message" name="message" rows={5} />
								{touched.message && errors.message && (
									<p className="text-xs text-destructive">{errors.message}</p>
								)}
							</div>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={handleClose}
									disabled={isSubmitting}
								>
									{i18n.t("quickAnswersModal.buttons.cancel")}
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
									{quickAnswerId
										? i18n.t("quickAnswersModal.buttons.okEdit")
										: i18n.t("quickAnswersModal.buttons.okAdd")}
								</Button>
							</DialogFooter>
						</Form>
					)}
				</Formik>
			</DialogContent>
		</Dialog>
	);
};

export default QuickAnswersModal;
