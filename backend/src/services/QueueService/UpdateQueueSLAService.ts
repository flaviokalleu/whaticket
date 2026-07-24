import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";

interface Request {
  companyId: number;
  queueId: number | string;
  slaMinutes?: number | null;
  slaResolutionMinutes?: number | null;
}

const UpdateQueueSLAService = async ({
  companyId,
  queueId,
  slaMinutes,
  slaResolutionMinutes
}: Request): Promise<Queue> => {
  const queue = await Queue.findOne({ where: { id: queueId, companyId } });

  if (!queue) {
    throw new AppError("ERR_QUEUE_NOT_FOUND", 404);
  }

  await queue.update({
    slaMinutes,
    slaResolutionMinutes
  });

  return queue;
};

export default UpdateQueueSLAService;
