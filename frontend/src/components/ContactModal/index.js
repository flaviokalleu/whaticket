import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";
import { Loader2, Trash2, Plus } from "lucide-react";

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

const ContactSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	number: Yup.string().min(8, "Too Short!").max(50, "Too Long!"),
	email: Yup.string().email("Invalid email"),
});

const ContactModal = ({ open, onClose, contactId, initialValues, onSave }) => {
	const isMounted = useRef(true);

	const initialState = {
		name: "",
		number: "",
		email: "",
	};

	const [contact, setContact] = useState(initialState);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		const fetchContact = async () => {
			if (initialValues) {
				setContact(prevState => {
					return { ...prevState, ...initialValues };
				});
			}

			if (!contactId) return;

			try {
				const { data } = await api.get(`/contacts/${contactId}`);
				if (isMounted.current) {
					setContact(data);
				}
			} catch (err) {
				toastError(err);
			}
		};

		fetchContact();
	}, [contactId, open, initialValues]);

	const handleClose = () => {
		onClose();
		setContact(initialState);
	};

	const handleSaveContact = async values => {
		try {
			if (contactId) {
				await api.put(`/contacts/${contactId}`, values);
				handleClose();
			} else {
				const { data } = await api.post("/contacts", values);
				if (onSave) {
					onSave(data);
				}
				handleClose();
			}
			toast.success(i18n.t("contactModal.success"));
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{contactId
							? i18n.t("contactModal.title.edit")
							: i18n.t("contactModal.title.add")}
					</DialogTitle>
				</DialogHeader>
				<Formik
					initialValues={contact}
					enableReinitialize={true}
					validationSchema={ContactSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveContact(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, errors, touched, isSubmitting }) => (
						<Form className="space-y-4">
							<p className="text-sm font-semibold">
								{i18n.t("contactModal.form.mainInfo")}
							</p>

							<div className="flex gap-3">
								<div className="flex-1 space-y-1.5">
									<Label htmlFor="name">{i18n.t("contactModal.form.name")}</Label>
									<Field as={Input} id="name" name="name" autoFocus />
									{touched.name && errors.name && (
										<p className="text-xs text-destructive">{errors.name}</p>
									)}
								</div>
								<div className="flex-1 space-y-1.5">
									<Label htmlFor="number">{i18n.t("contactModal.form.number")}</Label>
									<Field as={Input} id="number" name="number" placeholder="5513912344321" />
									{touched.number && errors.number && (
										<p className="text-xs text-destructive">{errors.number}</p>
									)}
								</div>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="email">{i18n.t("contactModal.form.email")}</Label>
								<Field as={Input} id="email" name="email" placeholder="Email address" />
								{touched.email && errors.email && (
									<p className="text-xs text-destructive">{errors.email}</p>
								)}
							</div>

							<p className="pt-2 text-sm font-semibold">
								{i18n.t("contactModal.form.extraInfo")}
							</p>

							<FieldArray name="extraInfo">
								{({ push, remove }) => (
									<div className="space-y-2">
										{values.extraInfo &&
											values.extraInfo.length > 0 &&
											values.extraInfo.map((info, index) => (
												<div key={`${index}-info`} className="flex items-center gap-2">
													<Field
														as={Input}
														placeholder={i18n.t("contactModal.form.extraName")}
														name={`extraInfo[${index}].name`}
													/>
													<Field
														as={Input}
														placeholder={i18n.t("contactModal.form.extraValue")}
														name={`extraInfo[${index}].value`}
													/>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => remove(index)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											))}
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="w-full"
											onClick={() => push({ name: "", value: "" })}
										>
											<Plus className="h-3.5 w-3.5" />
											{i18n.t("contactModal.buttons.addExtraInfo")}
										</Button>
									</div>
								)}
							</FieldArray>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={handleClose}
									disabled={isSubmitting}
								>
									{i18n.t("contactModal.buttons.cancel")}
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
									{contactId
										? i18n.t("contactModal.buttons.okEdit")
										: i18n.t("contactModal.buttons.okAdd")}
								</Button>
							</DialogFooter>
						</Form>
					)}
				</Formik>
			</DialogContent>
		</Dialog>
	);
};

export default ContactModal;
