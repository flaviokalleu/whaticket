import React from "react";

const MainContainer = ({ children }) => {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      {children}
    </div>
  );
};

export default MainContainer;
