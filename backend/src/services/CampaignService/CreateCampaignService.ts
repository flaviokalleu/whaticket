import * as Yup from "yup";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import CampaignContact from "../../models/CampaignContact";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

interface CampaignData {
  name: string;
  whatsappId: number;
  body: string;
  mediaUrl?: string;
  scheduledFor?: Date | string;
  intervalSeconds?: number;
  contactIds?: number[];
  queueId?: number;
  tagId?: number;
}

interface Request {
  companyId: number;
  createdBy: number;
  campaignData: CampaignData;
}

const CreateCampaignService = async ({
  companyId,
  createdBy,
  campaignData
}: Request): Promise<Campaign> => {
  const {
    name,
    whatsappId,
    body,
    mediaUrl,
    scheduledFor,
    intervalSeconds,
    contactIds,
    queueId,
    tagId
  } = campaignData;

  const schema = Yup.object().shape({
    name: Yup.string().min(2).required("ERR_CAMPAIGN_INVALID_NAME"),
    whatsappId: Yup.number().required("ERR_CAMPAIGN_INVALID_WHATSAPP"),
    body: Yup.string().required("ERR_CAMPAIGN_INVALID_BODY")
  });

  try {
    await schema.validate({ name, whatsappId, body });
  } catch (err) {
    throw new AppError(err.message);
  }

  const campaign = await Campaign.create({
    name,
    whatsappId,
    body,
    mediaUrl: mediaUrl || null,
    scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
    intervalSeconds: intervalSeconds || 20,
    status: "draft",
    createdBy,
    companyId
  } as Campaign);

  let resolvedContactIds: number[] = contactIds ? [...contactIds] : [];

  if (queueId) {
    const contactsFromQueue = await Contact.findAll({
      where: { companyId },
      include: [
        {
          model: Ticket,
          as: "tickets",
          required: true,
          where: { queueId, companyId }
        }
      ]
    });
    resolvedContactIds = [
      ...resolvedContactIds,
      ...contactsFromQueue.map(c => c.id)
    ];
  }

  if (tagId) {
    const TicketTag = (await import("../../models/TicketTag")).default;
    const ticketTags = await TicketTag.findAll({ where: { tagId } });
    const ticketIds = ticketTags.map(tt => tt.ticketId);
    if (ticketIds.length) {
      const tickets = await Ticket.findAll({
        where: { id: { [Op.in]: ticketIds }, companyId }
      });
      resolvedContactIds = [
        ...resolvedContactIds,
        ...tickets.map(t => t.contactId)
      ];
    }
  }

  const uniqueContactIds = [...new Set(resolvedContactIds)];

  if (uniqueContactIds.length) {
    const contacts = await Contact.findAll({
      where: { id: { [Op.in]: uniqueContactIds }, companyId }
    });

    await CampaignContact.bulkCreate(
      contacts.map(contact => ({
        campaignId: campaign.id,
        contactId: contact.id,
        companyId,
        status: "pending"
      })) as CampaignContact[]
    );
  }

  return ShowCampaign(campaign.id, companyId);
};

const ShowCampaign = async (
  campaignId: number,
  companyId: number
): Promise<Campaign> => {
  const campaign = await Campaign.findOne({
    where: { id: campaignId, companyId },
    include: ["campaignContacts"]
  });
  return campaign as Campaign;
};

export default CreateCampaignService;
