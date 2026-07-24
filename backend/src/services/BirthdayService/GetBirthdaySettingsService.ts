import BirthdaySetting from "../../models/BirthdaySetting";

const GetBirthdaySettingsService = async (
  companyId: number
): Promise<BirthdaySetting> => {
  const [setting] = await BirthdaySetting.findOrCreate({
    where: { companyId },
    defaults: {
      companyId,
      isEnabled: false,
      sendHour: 9
    } as BirthdaySetting
  });

  return setting;
};

export default GetBirthdaySettingsService;
