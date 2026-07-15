import React from "react";

const MainHeader = ({ children }) => {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				padding: "0px 6px 6px 6px",
			}}
		>
			{children}
		</div>
	);
};

export default MainHeader;
