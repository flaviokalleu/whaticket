import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Setting from "../models/Setting";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import ContactCustomField from "../models/ContactCustomField";
import Message from "../models/Message";
import Queue from "../models/Queue";
import WhatsappQueue from "../models/WhatsappQueue";
import UserQueue from "../models/UserQueue";
import QuickAnswer from "../models/QuickAnswer";
import WppKey from "../models/WppKey";
import Tag from "../models/Tag";
import TicketTag from "../models/TicketTag";
import Company from "../models/Company";
import Team from "../models/Team";
import TeamUser from "../models/TeamUser";
import Department from "../models/Department";
import InternalChatGroup from "../models/InternalChatGroup";
import InternalChatGroupMember from "../models/InternalChatGroupMember";
import InternalChatMessage from "../models/InternalChatMessage";
import InternalChatMessageRead from "../models/InternalChatMessageRead";
import TicketReopenReason from "../models/TicketReopenReason";
import TicketReopenLog from "../models/TicketReopenLog";
import UserRating from "../models/UserRating";
import NPSResponse from "../models/NPSResponse";
import MediaLibraryItem from "../models/MediaLibraryItem";
import ScheduledMessage from "../models/ScheduledMessage";
import MessageTemplate from "../models/MessageTemplate";
import PushSubscription from "../models/PushSubscription";
import Webhook from "../models/Webhook";
import WebhookLog from "../models/WebhookLog";
import BirthdayLog from "../models/BirthdayLog";
import BirthdaySetting from "../models/BirthdaySetting";
import Campaign from "../models/Campaign";
import CampaignContact from "../models/CampaignContact";
import CampaignLog from "../models/CampaignLog";
import Board from "../models/Board";
import BoardLane from "../models/BoardLane";
import BoardTask from "../models/BoardTask";
import BoardTaskTag from "../models/BoardTaskTag";
import BoardTaskChecklistItem from "../models/BoardTaskChecklistItem";
import TicketLane from "../models/TicketLane";
import PersonalKanbanLane from "../models/PersonalKanbanLane";
import PersonalKanbanItem from "../models/PersonalKanbanItem";
import Pipeline from "../models/Pipeline";
import PipelineStage from "../models/PipelineStage";
import Deal from "../models/Deal";
import DealNote from "../models/DealNote";
import LeadPipeline from "../models/LeadPipeline";
import Lead from "../models/Lead";
import LeadInteraction from "../models/LeadInteraction";
import LeadTask from "../models/LeadTask";

// eslint-disable-next-line
const dbConfig = require("../config/database");
// import dbConfig from "../config/database";

const sequelize = new Sequelize(dbConfig);

const models = [
  Company,
  User,
  Contact,
  Ticket,
  Message,
  Whatsapp,
  ContactCustomField,
  Setting,
  Queue,
  WhatsappQueue,
  UserQueue,
  QuickAnswer,
  WppKey,
  Tag,
  TicketTag,
  Team,
  TeamUser,
  Department,
  InternalChatGroup,
  InternalChatGroupMember,
  InternalChatMessage,
  InternalChatMessageRead,
  TicketReopenReason,
  TicketReopenLog,
  UserRating,
  NPSResponse,
  MediaLibraryItem,
  ScheduledMessage,
  MessageTemplate,
  PushSubscription,
  Webhook,
  WebhookLog,
  BirthdayLog,
  BirthdaySetting,
  Campaign,
  CampaignContact,
  CampaignLog,
  Board,
  BoardLane,
  BoardTask,
  BoardTaskTag,
  BoardTaskChecklistItem,
  TicketLane,
  PersonalKanbanLane,
  PersonalKanbanItem,
  Pipeline,
  PipelineStage,
  Deal,
  DealNote,
  LeadPipeline,
  Lead,
  LeadInteraction,
  LeadTask
];

sequelize.addModels(models);

export default sequelize;
