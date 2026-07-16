import ShowTagService from "./ShowTagService";

const DeleteTagService = async (tagId: number | string): Promise<void> => {
  const tag = await ShowTagService(tagId);

  await tag.destroy();
};

export default DeleteTagService;
