import * as React from "react";
import { ChevronDown, X } from "lucide-react";

import { cn } from "../../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Checkbox } from "./checkbox";
import { Badge } from "./badge";

/**
 * Generic multi-select with colored chips, built on Popover + Checkbox
 * since Radix Select has no native multi-select support.
 *
 * options: [{ value, label, color? }]
 */
const MultiSelect = React.forwardRef(
	({ options, value, onChange, placeholder, className }, ref) => {
		const [open, setOpen] = React.useState(false);

		const toggle = (optionValue) => {
			if (value.includes(optionValue)) {
				onChange(value.filter((v) => v !== optionValue));
			} else {
				onChange([...value, optionValue]);
			}
		};

		const remove = (optionValue, e) => {
			e.stopPropagation();
			onChange(value.filter((v) => v !== optionValue));
		};

		const selected = options.filter((o) => value.includes(o.value));

		return (
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						ref={ref}
						type="button"
						className={cn(
							"flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
							className
						)}
					>
						{selected.length === 0 && (
							<span className="text-muted-foreground">{placeholder}</span>
						)}
						{selected.map((opt) => (
							<Badge
								key={opt.value}
								variant="secondary"
								className="gap-1 pr-1"
								style={
									opt.color
										? { backgroundColor: opt.color, color: "#fff", borderColor: "transparent" }
										: undefined
								}
							>
								{opt.label}
								<span
									role="button"
									tabIndex={-1}
									onClick={(e) => remove(opt.value, e)}
									className="ml-0.5 rounded-full outline-none hover:opacity-80"
								>
									<X className="h-3 w-3" />
								</span>
							</Badge>
						))}
						<ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
					</button>
				</PopoverTrigger>
				<PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
					<div className="max-h-64 overflow-y-auto">
						{options.length === 0 && (
							<p className="px-2 py-1.5 text-sm text-muted-foreground">Nada encontrado</p>
						)}
						{options.map((opt) => (
							<label
								key={opt.value}
								className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
							>
								<Checkbox
									checked={value.includes(opt.value)}
									onCheckedChange={() => toggle(opt.value)}
								/>
								{opt.color && (
									<span
										className="h-2.5 w-2.5 shrink-0 rounded-full"
										style={{ backgroundColor: opt.color }}
									/>
								)}
								<span className="truncate">{opt.label}</span>
							</label>
						))}
					</div>
				</PopoverContent>
			</Popover>
		);
	}
);
MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
