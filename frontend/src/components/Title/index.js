import React from "react";

export default function Title(props) {
	return (
		<h1 className="text-xl font-bold tracking-tight text-foreground">
			{props.children}
		</h1>
	);
}
