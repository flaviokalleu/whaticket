import BirthdaySetting from "../../models/BirthdaySetting";
import GetBirthdaySettingsService from "./GetBirthdaySettingsService";

interface Request {
  companyId: number;
  isEnabled?: boolean;
  messageTemplate?: string;
  sendHour?: number;
  whatsappId?: number | null;
}

const UpdateBirthdaySettingsService = async ({
  companyId,
  isEnabled,
  messageTemplate,
  sendHour,
  whatsappId
}: Request): Promise<BirthdaySetting> => {
  const setting = await GetBirthdaySettingsService(companyId);

  await setting.update({
    ...(isEnabled !== undefined ? { isEnabled } : {}),
    ...(messageTemplate !== undefined ? { messageTemplate } : {}),
    ...(sendHour !== undefined ? { sendHour } : {}),
    ...(whatsappId !== undefined ? { whatsappId } : {})
  });

  return setting;
};

export default UpdateBirthdaySettingsService;
