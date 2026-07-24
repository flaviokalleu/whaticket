import fs from "fs";
import path from "path";
import AppError from "../../errors/AppError";
import MediaLibraryItem from "../../models/MediaLibraryItem";
import uploadConfig from "../../config/upload";

interface Request {
  id: string | number;
  companyId: number;
}

const DeleteMediaLibraryItemService = async ({
  id,
  companyId
}: Request): Promise<void> => {
  const item = await MediaLibraryItem.findOne({ where: { id, companyId } });

  if (!item) {
    throw new AppError("ERR_NO_MEDIA_LIBRARY_ITEM_FOUND", 404);
  }

  const filePath = path.resolve(uploadConfig.directory, item.mediaUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await item.destroy();
};

export default DeleteMediaLibraryItemService;
