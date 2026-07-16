import React from "react";

import { Skeleton } from "../ui/skeleton";

const TicketHeaderSkeleton = () => {
	return (
		<div className="flex flex-none items-center gap-3 border-b bg-muted/40 px-3 py-2">
			<Skeleton className="h-9 w-9 shrink-0 rounded-full" />
			<div className="space-y-1.5">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-3.5 w-32" />
			</div>
		</div>
	);
};

export default TicketHeaderSkeleton;
