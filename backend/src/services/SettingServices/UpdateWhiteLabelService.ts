import Setting from "../../models/Setting";

interface Request {
  companyId: number;
  appName?: string;
  primaryColor?: string;
  logoUrl?: string;
  backgroundUrl?: string;
}

const WHITE_LABEL_KEYS = {
  appName: "whitelabel_appName",
  primaryColor: "whitelabel_primaryColor",
  logoUrl: "whitelabel_logoUrl",
  backgroundUrl: "whitelabel_backgroundUrl"
} as const;

const upsertSetting = async (
  key: string,
  value: string,
  companyId: number
): Promise<void> => {
  const [setting] = await Setting.findOrCreate({
    where: { key, companyId },
    defaults: { key, value, companyId }
  });

  await setting.update({ value });
};

const UpdateWhiteLabelService = async ({
  companyId,
  appName,
  primaryColor,
  logoUrl,
  backgroundUrl
}: Request): Promise<void> => {
  if (appName !== undefined) {
    await upsertSetting(WHITE_LABEL_KEYS.appName, appName, companyId);
  }

  if (primaryColor !== undefined) {
    await upsertSetting(WHITE_LABEL_KEYS.primaryColor, primaryColor, companyId);
  }

  if (logoUrl !== undefined) {
    await upsertSetting(WHITE_LABEL_KEYS.logoUrl, logoUrl, companyId);
  }

  if (backgroundUrl !== undefined) {
    await upsertSetting(WHITE_LABEL_KEYS.backgroundUrl, backgroundUrl, companyId);
  }
};

export default UpdateWhiteLabelService;
export { WHITE_LABEL_KEYS };
