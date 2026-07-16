import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { green } from "@mui/material/colors";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";
import { IconButton, InputAdornment } from "@mui/material";
import { Colorize } from "@mui/icons-material";

const rootSx = {
	display: "flex",
	flexWrap: "wrap",
};

const textFieldSx = theme => ({
	marginRight: theme.spacing(1),
	flex: 1,
});

const btnWrapperSx = {
	position: "relative",
};

const buttonProgressSx = {
	color: green[500],
	position: "absolute",
	top: "50%",
	left: "50%",
	marginTop: -12,
	marginLeft: -12,
};

const colorAdormentSx = {
	width: 20,
	height: 20,
};

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
				setTag(prevState => {
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

	const handleSaveTag = async values => {
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
		<Box sx={rootSx}>
			<Dialog open={open} onClose={handleClose} scroll="paper">
				<DialogTitle>
					{tagId
						? `${i18n.t("tagModal.title.edit")}`
						: `${i18n.t("tagModal.title.add")}`}
				</DialogTitle>
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
					{({ touched, errors, isSubmitting, values }) => (
						<Form>
							<DialogContent dividers>
								<Field
									as={TextField}
									label={i18n.t("tagModal.form.name")}
									autoFocus
									name="name"
									error={touched.name && Boolean(errors.name)}
									helperText={touched.name && errors.name}
									variant="outlined"
									margin="dense"
									sx={textFieldSx}
								/>
								<Field
									as={TextField}
									label={i18n.t("tagModal.form.color")}
									name="color"
									id="color"
									onFocus={() => setColorPickerModalOpen(true)}
									error={touched.color && Boolean(errors.color)}
									helperText={touched.color && errors.color}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<Box
													sx={{
														...colorAdormentSx,
														backgroundColor: values.color,
													}}
												></Box>
											</InputAdornment>
										),
										endAdornment: (
											<IconButton
												size="small"
												color="default"
												onClick={() => setColorPickerModalOpen(true)}
											>
												<Colorize />
											</IconButton>
										),
									}}
									variant="outlined"
									margin="dense"
								/>
								<ColorPicker
									open={colorPickerModalOpen}
									handleClose={() => setColorPickerModalOpen(false)}
									onChange={color => {
										values.color = color;
										setTag(() => {
											return { ...values, color };
										});
									}}
								/>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("tagModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									sx={btnWrapperSx}
								>
									{tagId
										? `${i18n.t("tagModal.buttons.okEdit")}`
										: `${i18n.t("tagModal.buttons.okAdd")}`}
									{isSubmitting && (
										<CircularProgress
											size={24}
											sx={buttonProgressSx}
										/>
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</Box>
	);
};

export default TagModal;
