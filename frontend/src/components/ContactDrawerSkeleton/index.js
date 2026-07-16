import React from "react";
import { Skeleton } from "../ui/skeleton";

const ContactDrawerSkeleton = () => {
	return (
		<div className="flex h-full flex-col overflow-y-auto bg-muted/30 p-4">
			<div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6">
				<Skeleton className="h-32 w-32 rounded-full" />
				<Skeleton className="h-4 w-28" />
				<Skeleton className="h-3.5 w-24" />
			</div>
			<div className="mt-3 space-y-2 rounded-xl border bg-card p-4">
				<Skeleton className="h-3.5 w-24" />
				<Skeleton className="h-10 w-full rounded-lg" />
				<Skeleton className="h-10 w-full rounded-lg" />
			</div>
		</div>
	);
};

export default ContactDrawerSkeleton;
