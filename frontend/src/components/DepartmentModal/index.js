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

import api from "../../services/api";
import toastError from "../../errors/toastError";

const DepartmentSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Muito curto!")
		.max(50, "Muito longo!")
		.required("Obrigatório"),
});

const DepartmentModal = ({ open, onClose, departmentId }) => {
	const initialState = {
		name: "",
	};

	const [department, setDepartment] = useState(initialState);

	useEffect(() => {
		(async () => {
			if (!departmentId) return;
			try {
				const { data } = await api.get(`/departments/${departmentId}`);
				setDepartment((prevState) => {
					return { ...prevState, name: data.name };
				});
			} catch (err) {
				toastError(err);
			}
		})();

		return () => {
			setDepartment({ name: "" });
		};
	}, [departmentId, open]);

	const handleClose = () => {
		onClose();
		setDepartment(initialState);
	};

	const handleSaveDepartment = async (values) => {
		try {
			if (departmentId) {
				await api.put(`/departments/${departmentId}`, values);
			} else {
				await api.post("/departments", values);
			}
			toast.success("Departamento salvo com sucesso!");
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
						{departmentId ? "Editar departamento" : "Adicionar departamento"}
					</DialogTitle>
				</DialogHeader>
				<Formik
					initialValues={department}
					enableReinitialize={true}
					validationSchema={DepartmentSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveDepartment(values);
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

export default DepartmentModal;
