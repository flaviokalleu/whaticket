import React, { useState, useEffect, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { Loader2, Eye, EyeOff } from "lucide-react";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import useWhatsApps from "../../hooks/useWhatsApps";

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
	email: Yup.string().email("Invalid email").required("Required"),
});

const UserModal = ({ open, onClose, userId }) => {
	const initialState = {
		name: "",
		email: "",
		password: "",
		profile: "user",
	};

	const { user: loggedInUser } = useContext(AuthContext);

	const [user, setUser] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [showPassword, setShowPassword] = useState(false);
	const [whatsappId, setWhatsappId] = useState("");
	const { loading, whatsApps } = useWhatsApps();

	useEffect(() => {
		const fetchUser = async () => {
			if (!userId) return;
			try {
				const { data } = await api.get(`/users/${userId}`);
				setUser((prevState) => {
					return { ...prevState, ...data };
				});
				const userQueueIds = data.queues?.map((queue) => queue.id);
				setSelectedQueueIds(userQueueIds);
				setWhatsappId(data.whatsappId ? data.whatsappId : "");
			} catch (err) {
				toastError(err);
			}
		};

		fetchUser();
	}, [userId, open]);

	const handleClose = () => {
		onClose();
		setUser(initialState);
	};

	const handleSaveUser = async (values) => {
		const userData = { ...values, whatsappId, queueIds: selectedQueueIds };
		try {
			if (userId) {
				await api.put(`/users/${userId}`, userData);
			} else {
				await api.post("/users", userData);
			}
			toast.success(i18n.t("userModal.success"));
		} catch (err) {
			toastError(err);
		}
		handleClose();
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{userId
							? i18n.t("userModal.title.edit")
							: i18n.t("userModal.title.add")}
					</DialogTitle>
				</DialogHeader>
				<Formik
					initialValues={user}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveUser(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, setFieldValue, touched, errors, isSubmitting }) => (
						<Form className="space-y-4">
							<div className="flex gap-3">
								<div className="flex-1 space-y-1.5">
									<Label htmlFor="name">{i18n.t("userModal.form.name")}</Label>
									<Field as={Input} id="name" name="name" autoFocus />
									{touched.name && errors.name && (
										<p className="text-xs text-destructive">{errors.name}</p>
									)}
								</div>
								<div className="flex-1 space-y-1.5">
									<Label htmlFor="password">{i18n.t("userModal.form.password")}</Label>
									<div className="relative">
										<Field
											as={Input}
											id="password"
											name="password"
											type={showPassword ? "text" : "password"}
											className="pr-9"
										/>
										<button
											type="button"
											onClick={() => setShowPassword((e) => !e)}
											className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										>
											{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</button>
									</div>
									{touched.password && errors.password && (
										<p className="text-xs text-destructive">{errors.password}</p>
									)}
								</div>
							</div>

							<div className="flex gap-3">
								<div className="flex-1 space-y-1.5">
									<Label htmlFor="email">{i18n.t("userModal.form.email")}</Label>
									<Field as={Input} id="email" name="email" />
									{touched.email && errors.email && (
										<p className="text-xs text-destructive">{errors.email}</p>
									)}
								</div>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editProfile"
									yes={() => (
										<div className="flex-1 space-y-1.5">
											<Label>{i18n.t("userModal.form.profile")}</Label>
											<Select
												value={values.profile}
												onValueChange={(v) => setFieldValue("profile", v)}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="admin">Admin</SelectItem>
													<SelectItem value="user">User</SelectItem>
												</SelectContent>
											</Select>
										</div>
									)}
								/>
							</div>

							<Can
								role={loggedInUser.profile}
								perform="user-modal:editQueues"
								yes={() => (
									<QueueSelect
										selectedQueueIds={selectedQueueIds}
										onChange={(values) => setSelectedQueueIds(values)}
									/>
								)}
							/>
							<Can
								role={loggedInUser.profile}
								perform="user-modal:editQueues"
								yes={() =>
									!loading && (
										<div className="space-y-1.5">
											<Label>{i18n.t("userModal.form.whatsapp")}</Label>
											<Select
												value={whatsappId ? String(whatsappId) : "none"}
												onValueChange={(v) => setWhatsappId(v === "none" ? "" : v)}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">&nbsp;</SelectItem>
													{whatsApps.map((whatsapp) => (
														<SelectItem key={whatsapp.id} value={String(whatsapp.id)}>
															{whatsapp.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)
								}
							/>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={handleClose}
									disabled={isSubmitting}
								>
									{i18n.t("userModal.buttons.cancel")}
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
									{userId
										? i18n.t("userModal.buttons.okEdit")
										: i18n.t("userModal.buttons.okAdd")}
								</Button>
							</DialogFooter>
						</Form>
					)}
				</Formik>
			</DialogContent>
		</Dialog>
	);
};

export default UserModal;
