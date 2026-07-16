import { Op } from "sequelize";
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";
import ShowTagService from "./ShowTagService";

interface TagData {
  name?: string;
  color?: string;
}

const UpdateTagService = async (
  tagId: number | string,
  tagData: TagData
): Promise<Tag> => {
  const { color, name } = tagData;

  const tagSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_TAG_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_TAG_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const tagWithSameName = await Tag.findOne({
              where: { name: value, id: { [Op.not]: tagId } }
            });

            return !tagWithSameName;
          }
          return true;
        }
      ),
    color: Yup.string()
      .required("ERR_TAG_INVALID_COLOR")
      .test("Check-color", "ERR_TAG_INVALID_COLOR", async value => {
        if (value) {
          const colorTestRegex = /^#[0-9a-f]{3,6}$/i;
          return colorTestRegex.test(value);
        }
        return true;
      })
  });

  try {
    await tagSchema.validate({ color, name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const tag = await ShowTagService(tagId);

  await tag.update(tagData);

  return tag;
};

export default UpdateTagService;
