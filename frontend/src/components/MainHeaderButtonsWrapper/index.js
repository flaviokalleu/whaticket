import React from "react";

import Box from "@mui/material/Box";

const MainHeaderButtonsWrapper = ({ children }) => {
	return (
		<Box
			sx={{
				flex: "none",
				marginLeft: "auto",
				"& > *": {
					margin: (theme) => theme.spacing(1),
				},
			}}
		>
			{children}
		</Box>
	);
};

export default MainHeaderButtonsWrapper;
