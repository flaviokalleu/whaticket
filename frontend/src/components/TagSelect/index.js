import React, { useEffect, useState } from "react";

import { MultiSelect } from "../ui/multi-select";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const TagSelect = ({ selectedTagIds, onChange }) => {
	const [tags, setTags] = useState([]);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/tags");
				setTags(data);
			} catch (err) {
				toastError(err);
			}
		})();
	}, []);

	return (
		<MultiSelect
			options={tags.map((tag) => ({ value: tag.id, label: tag.name, color: tag.color }))}
			value={selectedTagIds || []}
			onChange={onChange}
			placeholder={i18n.t("tagSelect.inputLabel")}
			className="h-8 text-xs"
		/>
	);
};

export default TagSelect;
