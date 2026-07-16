import React from "react";

import { MultiSelect } from "../ui/multi-select";
import { i18n } from "../../translate/i18n";

const TicketsQueueSelect = ({
	userQueues,
	selectedQueueIds = [],
	onChange,
	className,
}) => {
	return (
		<div className={className} style={{ width: 160 }}>
			<MultiSelect
				options={(userQueues || []).map((q) => ({
					value: q.id,
					label: q.name,
					color: q.color,
				}))}
				value={selectedQueueIds}
				onChange={onChange}
				placeholder={i18n.t("ticketsQueueSelect.placeholder")}
				className="h-9"
			/>
		</div>
	);
};

export default TicketsQueueSelect;
