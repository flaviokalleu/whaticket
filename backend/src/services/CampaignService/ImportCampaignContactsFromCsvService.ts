import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import CampaignContact from "../../models/CampaignContact";
import ShowCampaignService from "./ShowCampaignService";

interface CsvRow {
  name?: string;
  number: string;
}

interface Response {
  imported: number;
  skipped: number;
}

const ImportCampaignContactsFromCsvService = async (
  campaignId: number | string,
  companyId: number,
  rows: CsvRow[]
): Promise<Response> => {
  const campaign = await ShowCampaignService(campaignId, companyId);

  if (["completed", "cancelled", "running"].includes(campaign.status)) {
    throw new AppError("ERR_CAMPAIGN_CANNOT_IMPORT_CONTACTS");
  }

  let imported = 0;
  let skipped = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const row of rows) {
    const number = (row.number || "").replace(/\D/g, "");

    if (!number) {
      skipped += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const [contact] = await Contact.findOrCreate({
      where: { number, companyId },
      defaults: {
        number,
        name: row.name || number,
        companyId
      } as Contact
    });

    // eslint-disable-next-line no-await-in-loop
    const existingCampaignContact = await CampaignContact.findOne({
      where: { campaignId: campaign.id, contactId: contact.id, companyId }
    });

    if (existingCampaignContact) {
      skipped += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    await CampaignContact.create({
      campaignId: campaign.id,
      contactId: contact.id,
      companyId,
      status: "pending"
    } as CampaignContact);

    imported += 1;
  }

  return { imported, skipped };
};

export default ImportCampaignContactsFromCsvService;
