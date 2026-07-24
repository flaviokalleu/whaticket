import React from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoggedInLayout from "../layout";
import Dashboard from "../pages/Dashboard/";
import Tickets from "../pages/Tickets/";
import Signup from "../pages/Signup/";
import Login from "../pages/Login/";
import Connections from "../pages/Connections/";
import Settings from "../pages/Settings/";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts/";
import QuickAnswers from "../pages/QuickAnswers/";
import Queues from "../pages/Queues/";
import Tags from "../pages/Tags/";
import Teams from "../pages/Teams";
import Departments from "../pages/Departments";
import Webhooks from "../pages/Webhooks";
import MessageTemplates from "../pages/MessageTemplates";
import ScheduledMessages from "../pages/ScheduledMessages";
import MediaLibrary from "../pages/MediaLibrary";
import Campaigns from "../pages/Campaigns/";
import Leads from "../pages/Leads/";
import CrmFunnel from "../pages/CrmFunnel/";
import Boards from "../pages/Boards";
import InternalChat from "../pages/InternalChat";
import Flows from "../pages/Flows";
import FlowBuilder from "../pages/FlowBuilder";
import { AuthProvider } from "../context/Auth/AuthContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import { ThemeProvider } from "../context/DarkMode";
import Route from "./Route";

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={Signup} />
            <WhatsAppsProvider>
              <LoggedInLayout>
                <Route exact path="/" component={Dashboard} isPrivate />
                <Route exact path="/tickets/:ticketId?" component={Tickets} isPrivate />
                <Route exact path="/connections" component={Connections} isPrivate />
                <Route exact path="/contacts" component={Contacts} isPrivate />
                <Route exact path="/users" component={Users} isPrivate />
                <Route exact path="/quickAnswers" component={QuickAnswers} isPrivate />
                <Route exact path="/Settings" component={Settings} isPrivate />
                <Route exact path="/Queues" component={Queues} isPrivate />
                <Route exact path="/tags" component={Tags} isPrivate />
                <Route exact path="/teams" component={Teams} isPrivate />
                <Route exact path="/departments" component={Departments} isPrivate />
                <Route exact path="/webhooks" component={Webhooks} isPrivate />
                <Route exact path="/message-templates" component={MessageTemplates} isPrivate />
                <Route exact path="/scheduled-messages" component={ScheduledMessages} isPrivate />
                <Route exact path="/media-library" component={MediaLibrary} isPrivate />
                <Route exact path="/campaigns" component={Campaigns} isPrivate />
                <Route exact path="/crm/leads" component={Leads} isPrivate />
                <Route exact path="/crm/funnel" component={CrmFunnel} isPrivate />
                <Route exact path="/boards" component={Boards} isPrivate />
                <Route exact path="/internal-chat" component={InternalChat} isPrivate />
                <Route exact path="/flows" component={Flows} isPrivate />
                <Route exact path="/flows/:flowId/edit" component={FlowBuilder} isPrivate />
              </LoggedInLayout>
            </WhatsAppsProvider>
          </Switch>
          <ToastContainer autoClose={3000} />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
