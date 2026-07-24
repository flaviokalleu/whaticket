import * as Yup from "yup";
import AppError from "../../errors/AppError";
import MediaLibraryItem from "../../models/MediaLibraryItem";

interface Request {
  name: string;
  media: Express.Multer.File;
  createdBy: number;
  companyId: number;
}

const CreateMediaLibraryItemService = async ({
  name,
  media,
  createdBy,
  companyId
}: Request): Promise<MediaLibraryItem> => {
  const schema = Yup.object().shape({
    name: Yup.string().required("ERR_MEDIA_LIBRARY_INVALID_NAME")
  });

  try {
    await schema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  if (!media) {
    throw new AppError("ERR_MEDIA_LIBRARY_NO_FILE");
  }

  const mediaType = media.mimetype.split("/")[0] || "document";

  const item = await MediaLibraryItem.create({
    name,
    mediaUrl: media.filename,
    mediaType,
    createdBy,
    companyId
  });

  return item;
};

export default CreateMediaLibraryItemService;
