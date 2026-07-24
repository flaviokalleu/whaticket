import AppError from "../../errors/AppError";
import Deal from "../../models/Deal";
import PipelineStage from "../../models/PipelineStage";
import Pipeline from "../../models/Pipeline";
import Contact from "../../models/Contact";
import User from "../../models/User";
import DealNote from "../../models/DealNote";

const ShowDealService = async (
  dealId: number | string,
  companyId: number
): Promise<Deal> => {
  const deal = await Deal.findOne({
    where: { id: dealId, companyId },
    include: [
      { model: Pipeline, as: "pipeline" },
      { model: PipelineStage, as: "stage" },
      { model: Contact, as: "contact" },
      { model: User, as: "user", attributes: ["id", "name"] },
      { model: DealNote, as: "notes" }
    ]
  });

  if (!deal) {
    throw new AppError("ERR_DEAL_NOT_FOUND", 404);
  }

  return deal;
};

export default ShowDealService;
