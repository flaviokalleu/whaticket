import React, { useEffect, useState } from "react";

import { Label } from "../ui/label";
import { MultiSelect } from "../ui/multi-select";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const QueueSelect = ({ selectedQueueIds, onChange }) => {
	const [queues, setQueues] = useState([]);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/queue");
				setQueues(data);
			} catch (err) {
				toastError(err);
			}
		})();
	}, []);

	return (
		<div className="mt-1.5 space-y-1.5">
			<Label>{i18n.t("queueSelect.inputLabel")}</Label>
			<MultiSelect
				options={queues.map((q) => ({ value: q.id, label: q.name, color: q.color }))}
				value={selectedQueueIds || []}
				onChange={onChange}
				placeholder={i18n.t("queueSelect.inputLabel")}
			/>
		</div>
	);
};

export default QueueSelect;
