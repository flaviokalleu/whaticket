import React from "react";
import { Skeleton } from "../ui/skeleton";

const Row = () => (
	<div className="flex items-center gap-3 border-b px-4 py-3">
		<Skeleton className="h-10 w-10 shrink-0 rounded-full" />
		<div className="min-w-0 flex-1 space-y-2">
			<Skeleton className="h-3.5 w-24" />
			<Skeleton className="h-3.5 w-36" />
		</div>
	</div>
);

const TicketsSkeleton = () => {
	return (
		<>
			<Row />
			<Row />
			<Row />
		</>
	);
};

export default TicketsSkeleton;
