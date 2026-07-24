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
import { MultiSelect } from "../ui/multi-select";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const TeamSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Muito curto!")
		.max(50, "Muito longo!")
		.required("Obrigatório"),
});

const TeamModal = ({ open, onClose, teamId }) => {
	const initialState = {
		name: "",
	};

	const [team, setTeam] = useState(initialState);
	const [users, setUsers] = useState([]);
	const [selectedUserIds, setSelectedUserIds] = useState([]);
	const [originalUserIds, setOriginalUserIds] = useState([]);

	useEffect(() => {
		if (!open) return;
		(async () => {
			try {
				const { data } = await api.get("/users");
				setUsers(data.users || []);
			} catch (err) {
				toastError(err);
			}
		})();
	}, [open]);

	useEffect(() => {
		(async () => {
			if (!teamId) return;
			try {
				const { data } = await api.get(`/teams/${teamId}`);
				setTeam((prevState) => {
					return { ...prevState, name: data.name };
				});
				const memberIds = (data.users || []).map((u) => u.id);
				setSelectedUserIds(memberIds);
				setOriginalUserIds(memberIds);
			} catch (err) {
				toastError(err);
			}
		})();

		return () => {
			setTeam({ name: "" });
			setSelectedUserIds([]);
			setOriginalUserIds([]);
		};
	}, [teamId, open]);

	const handleClose = () => {
		onClose();
		setTeam(initialState);
		setSelectedUserIds([]);
		setOriginalUserIds([]);
	};

	const handleSaveTeam = async (values) => {
		try {
			let savedTeamId = teamId;
			if (teamId) {
				await api.put(`/teams/${teamId}`, { name: values.name });
			} else {
				const { data } = await api.post("/teams", { name: values.name });
				savedTeamId = data.id;
			}

			const toAdd = selectedUserIds.filter(
				(id) => !originalUserIds.includes(id)
			);
			const toRemove = originalUserIds.filter(
				(id) => !selectedUserIds.includes(id)
			);

			for (const userId of toAdd) {
				await api.post(`/teams/${savedTeamId}/members/${userId}`);
			}
			for (const userId of toRemove) {
				await api.delete(`/teams/${savedTeamId}/members/${userId}`);
			}

			toast.success("Equipe salva com sucesso!");
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};

	const userOptions = users.map((user) => ({
		value: user.id,
		label: user.name,
	}));

	return (
		<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{teamId ? "Editar equipe" : "Adicionar equipe"}
					</DialogTitle>
				</DialogHeader>
				<Formik
					initialValues={team}
					enableReinitialize={true}
					validationSchema={TeamSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveTeam(values);
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
								<Label>Membros</Label>
								<MultiSelect
									options={userOptions}
									value={selectedUserIds}
									onChange={setSelectedUserIds}
									placeholder="Selecione os membros"
								/>
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

export default TeamModal;
