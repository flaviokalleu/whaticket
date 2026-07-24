import * as Yup from "yup";
import AppError from "../../errors/AppError";
import PipelineStage from "../../models/PipelineStage";
import ShowPipelineService from "./ShowPipelineService";

interface Request {
  pipelineId: number | string;
  companyId: number;
  name: string;
  position?: number;
  color: string;
}

const CreatePipelineStageService = async ({
  pipelineId,
  companyId,
  name,
  position,
  color
}: Request): Promise<PipelineStage> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2, "ERR_STAGE_INVALID_NAME").required("ERR_STAGE_INVALID_NAME"),
    color: Yup.string().required("ERR_STAGE_INVALID_COLOR")
  });

  try {
    await schema.validate({ name, color });
  } catch (err) {
    throw new AppError(err.message);
  }

  // Ensures the pipeline belongs to the requesting company
  await ShowPipelineService(pipelineId, companyId);

  const stage = await PipelineStage.create({
    pipelineId,
    companyId,
    name,
    color,
    position: position ?? 0
  });

  return stage;
};

export default CreatePipelineStageService;
