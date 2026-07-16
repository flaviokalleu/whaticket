import React from "react";

const MainHeaderButtonsWrapper = ({ children }) => {
	return (
		<div className="ml-auto flex shrink-0 items-center gap-2">
			{children}
		</div>
	);
};

export default MainHeaderButtonsWrapper;
