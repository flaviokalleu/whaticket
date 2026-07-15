import React, { useContext, useEffect, useRef, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Badge from "@mui/material/Badge";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import Button from "@mui/material/Button";

const TicketsWrapperPaper = styled(Paper)(({ theme }) => ({
  position: "relative",
  display: "flex",
  height: "100%",
  flexDirection: "column",
  overflow: "hidden",
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}));

const TabsHeaderPaper = styled(Paper)(({ theme }) => ({
  flex: "none",
  backgroundColor: theme.palette.background.paper,
}));

const StyledTab = styled(Tab)({
  minWidth: 120,
  width: 120,
});

const TicketOptionsPaper = styled(Paper)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: theme.palette.background.paper,
  padding: theme.spacing(1),
}));

const SearchInputWrapper = styled("div")(({ theme }) => ({
  flex: 1,
  background: theme.palette.background.default,
  display: "flex",
  borderRadius: 40,
  padding: 4,
  marginRight: theme.spacing(1),
}));

const StyledSearchIcon = styled(SearchIcon)({
  color: "grey",
  marginLeft: 6,
  marginRight: 6,
  alignSelf: "center",
});

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  flex: 1,
  border: "none",
  borderRadius: 30,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.default,
}));

const StyledBadge = styled(Badge)({
  "& .MuiBadge-badge": {
    right: "-10px",
  },
});

const TicketsManager = () => {
  const theme = useTheme();
  const ticketsWrapperStyle = {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  };
  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user } = useContext(AuthContext);
  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
      setSearchParam("");
    }
  }, [tab]);

  let searchTimeout;

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    clearTimeout(searchTimeout);

    if (searchedTerm === "") {
      setSearchParam(searchedTerm);
      setTab("open");
      return;
    }

    searchTimeout = setTimeout(() => {
      setSearchParam(searchedTerm);
    }, 500);
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  return (
    <TicketsWrapperPaper elevation={0} variant="outlined">
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(e) => setNewTicketModalOpen(false)}
      />
      <TabsHeaderPaper elevation={0} square>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
        >
          <StyledTab
            value={"open"}
            icon={<MoveToInboxIcon />}
            label={i18n.t("tickets.tabs.open.title")}
          />
          <StyledTab
            value={"closed"}
            icon={<CheckBoxIcon />}
            label={i18n.t("tickets.tabs.closed.title")}
          />
          <StyledTab
            value={"search"}
            icon={<SearchIcon />}
            label={i18n.t("tickets.tabs.search.title")}
          />
        </Tabs>
      </TabsHeaderPaper>
      <TicketOptionsPaper square elevation={0}>
        {tab === "search" ? (
          <SearchInputWrapper>
            <StyledSearchIcon />
            <StyledInputBase
              inputRef={searchInputRef}
              placeholder={i18n.t("tickets.search.placeholder")}
              type="search"
              onChange={handleSearch}
            />
          </SearchInputWrapper>
        ) : (
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setNewTicketModalOpen(true)}
            >
              {i18n.t("ticketsManager.buttons.newTicket")}
            </Button>
            <Can
              role={user.profile}
              perform="tickets-manager:showall"
              yes={() => (
                <FormControlLabel
                  label={i18n.t("tickets.buttons.showAll")}
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={showAllTickets}
                      onChange={() =>
                        setShowAllTickets((prevState) => !prevState)
                      }
                      name="showAllTickets"
                      color="primary"
                    />
                  }
                />
              )}
            />
          </>
        )}
        <TicketsQueueSelect
          style={{ marginLeft: 6 }}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
      </TicketOptionsPaper>
      <TabPanel value={tab} name="open" style={ticketsWrapperStyle}>
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label={
              <StyledBadge badgeContent={openCount} color="primary">
                {i18n.t("ticketsList.assignedHeader")}
              </StyledBadge>
            }
            value={"open"}
          />
          <Tab
            label={
              <StyledBadge badgeContent={pendingCount} color="secondary">
                {i18n.t("ticketsList.pendingHeader")}
              </StyledBadge>
            }
            value={"pending"}
          />
        </Tabs>
        <TicketsWrapperPaper>
          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
          />
          <TicketsList
            status="pending"
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
          />
        </TicketsWrapperPaper>
      </TabPanel>
      <TabPanel value={tab} name="closed" style={ticketsWrapperStyle}>
        <TicketsList
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
      <TabPanel value={tab} name="search" style={ticketsWrapperStyle}>
        <TicketsList
          searchParam={searchParam}
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
    </TicketsWrapperPaper>
  );
};

export default TicketsManager;
