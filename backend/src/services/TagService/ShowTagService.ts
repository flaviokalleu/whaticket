import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";

const ShowTagService = async (tagId: number | string): Promise<Tag> => {
  const tag = await Tag.findByPk(tagId);

  if (!tag) {
    throw new AppError("ERR_TAG_NOT_FOUND");
  }

  return tag;
};

export default ShowTagService;
