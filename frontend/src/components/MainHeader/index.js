import React from "react";

const MainHeader = ({ children }) => {
	return (
		<div className="flex items-center gap-3 px-6 pt-6 pb-4">
			{children}
		</div>
	);
};

export default MainHeader;
