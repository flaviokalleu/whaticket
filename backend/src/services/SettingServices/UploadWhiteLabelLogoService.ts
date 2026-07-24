import UpdateWhiteLabelService from "./UpdateWhiteLabelService";

interface Request {
  companyId: number;
  filename: string;
}

const UploadWhiteLabelLogoService = async ({
  companyId,
  filename
}: Request): Promise<string> => {
  const logoUrl = `${filename}`;

  await UpdateWhiteLabelService({ companyId, logoUrl });

  return logoUrl;
};

export default UploadWhiteLabelLogoService;
