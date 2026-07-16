import React from "react";

const Title = ({ children }) => {
	return (
		<h2 className="text-sm font-semibold text-muted-foreground">{children}</h2>
	);
};

export default Title;
