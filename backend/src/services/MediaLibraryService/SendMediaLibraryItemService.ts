import path from "path";
import fs from "fs";
import AppError from "../../errors/AppError";
import MediaLibraryItem from "../../models/MediaLibraryItem";
import ShowTicketService from "../TicketServices/ShowTicketService";
import SendWhatsAppMedia from "../WbotServices/SendWhatsAppMedia";
import uploadConfig from "../../config/upload";
import { ProviderMessage } from "../../providers/WhatsApp";

interface Request {
  itemId: string | number;
  ticketId: string | number;
  companyId: number;
  body?: string;
}

const SendMediaLibraryItemService = async ({
  itemId,
  ticketId,
  companyId,
  body
}: Request): Promise<ProviderMessage> => {
  const item = await MediaLibraryItem.findOne({
    where: { id: itemId, companyId }
  });

  if (!item) {
    throw new AppError("ERR_NO_MEDIA_LIBRARY_ITEM_FOUND", 404);
  }

  const ticket = await ShowTicketService(ticketId);

  if (ticket.companyId !== companyId) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const originalPath = path.resolve(uploadConfig.directory, item.mediaUrl);

  if (!fs.existsSync(originalPath)) {
    throw new AppError("ERR_MEDIA_LIBRARY_FILE_MISSING", 404);
  }

  // SendWhatsAppMedia deletes the file after sending, so we send a temporary
  // copy and keep the original library item intact for reuse.
  const tempFilename = `${new Date().getTime()}${path.extname(item.mediaUrl)}`;
  const tempPath = path.resolve(uploadConfig.directory, tempFilename);
  fs.copyFileSync(originalPath, tempPath);

  const stats = fs.statSync(tempPath);

  const media = {
    fieldname: "medias",
    originalname: item.name,
    filename: tempFilename,
    path: tempPath,
    mimetype: `${item.mediaType}/*`,
    size: stats.size
  } as unknown as Express.Multer.File;

  const sentMessage = await SendWhatsAppMedia({ media, ticket, body });

  return sentMessage;
};

export default SendMediaLibraryItemService;
