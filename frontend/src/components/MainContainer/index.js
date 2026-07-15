import React from "react";

import Container from "@mui/material/Container";

const MainContainer = ({ children }) => {
  return (
    <Container
      sx={{
        flex: 1,
        padding: 0,
        height: "100%",
      }}
      maxWidth={false}
    >
      <div
        style={{
          height: "100%",
          overflowY: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </Container>
  );
};

export default MainContainer;
