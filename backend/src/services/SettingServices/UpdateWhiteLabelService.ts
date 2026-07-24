import Setting from "../../models/Setting";

interface Request {
  companyId: number;
  appName?: string | null;
  primaryColor?: string | null;
  logoUrl?: string | null;
  backgroundUrl?: string | null;
}

const WHITE_LABEL_KEYS = {
  appName: "whitelabel_appName",
  primaryColor: "whitelabel_primaryColor",
  logoUrl: "whitelabel_logoUrl",
  backgroundUrl: "whitelabel_backgroundUrl"
} as const;

const upsertSetting = async (
  key: string,
  value: string | null,
  companyId: number
): Promise<void> => {
  // Settings.value is NOT NULL: "sem valor" (ex.: logo removida) é gravado
  // como string vazia, que GetWhiteLabelService converte de volta para null.
  const safeValue = value ?? "";

  const [setting] = await Setting.findOrCreate({
    where: { key, companyId },
    defaults: { key, value: safeValue, companyId }
  });

  await setting.update({ value: safeValue });
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
