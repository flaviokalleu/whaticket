import React from "react";
import { TableCell, TableRow } from "../ui/table";
import { Skeleton } from "../ui/skeleton";

const TableRowSkeleton = ({ avatar, columns }) => {
	return (
		<TableRow>
			{avatar && (
				<>
					<TableCell>
						<Skeleton className="h-10 w-10 rounded-full" />
					</TableCell>
					<TableCell>
						<Skeleton className="h-4 w-20" />
					</TableCell>
				</>
			)}
			{Array.from({ length: columns }, (_, index) => (
				<TableCell key={index} className="text-center">
					<div className="flex items-center justify-center">
						<Skeleton className="h-4 w-20" />
					</div>
				</TableCell>
			))}
		</TableRow>
	);
};

export default TableRowSkeleton;
