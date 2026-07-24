import Setting from "../../models/Setting";
import { WHITE_LABEL_KEYS } from "./UpdateWhiteLabelService";

interface Response {
  appName: string;
  primaryColor: string;
  logoUrl: string | null;
  backgroundUrl: string | null;
}

const GetWhiteLabelService = async (companyId: number): Promise<Response> => {
  const settings = await Setting.findAll({
    where: {
      companyId,
      key: Object.values(WHITE_LABEL_KEYS)
    }
  });

  const map: Record<string, string> = {};
  settings.forEach(setting => {
    map[setting.key] = setting.value;
  });

  return {
    appName: map[WHITE_LABEL_KEYS.appName] || "Whaticket",
    primaryColor: map[WHITE_LABEL_KEYS.primaryColor] || "#7367F0",
    logoUrl: map[WHITE_LABEL_KEYS.logoUrl] || null,
    backgroundUrl: map[WHITE_LABEL_KEYS.backgroundUrl] || null
  };
};

export default GetWhiteLabelService;
