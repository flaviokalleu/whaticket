import React from "react";
import { ChevronLeft } from "lucide-react";
import { useHistory } from "react-router-dom";

import { Button } from "../ui/button";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";

const TicketHeader = ({ loading, children }) => {
  const history = useHistory();
  const handleBack = () => {
    history.push("/tickets");
  };

  if (loading) {
    return <TicketHeaderSkeleton />;
  }

  return (
    <div className="flex flex-none items-center gap-2 border-b bg-background px-3 py-2 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="shrink-0 sm:hidden"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      {children}
    </div>
  );
};

export default TicketHeader;
