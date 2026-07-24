import UpdateWhiteLabelService from "./UpdateWhiteLabelService";

interface Request {
  companyId: number;
  filename: string;
}

const UploadWhiteLabelBackgroundService = async ({
  companyId,
  filename
}: Request): Promise<string> => {
  const backgroundUrl = `${filename}`;

  await UpdateWhiteLabelService({ companyId, backgroundUrl });

  return backgroundUrl;
};

export default UploadWhiteLabelBackgroundService;
