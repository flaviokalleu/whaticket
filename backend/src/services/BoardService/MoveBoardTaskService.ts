import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import BoardTask from "../../models/BoardTask";
import BoardLane from "../../models/BoardLane";

interface MoveData {
  taskId: number | string;
  laneId: number | string;
  newPosition: number;
  companyId: number;
}

const MoveBoardTaskService = async ({
  taskId,
  laneId,
  newPosition,
  companyId
}: MoveData): Promise<BoardTask> => {
  const task = await BoardTask.findOne({ where: { id: taskId, companyId } });

  if (!task) {
    throw new AppError("ERR_BOARD_TASK_NOT_FOUND", 404);
  }

  const lane = await BoardLane.findOne({ where: { id: laneId, companyId } });

  if (!lane) {
    throw new AppError("ERR_BOARD_LANE_NOT_FOUND", 404);
  }

  const originLaneId = task.laneId;

  if (String(originLaneId) === String(laneId)) {
    // Reorder within the same lane
    if (newPosition > task.position) {
      await BoardTask.increment(
        { position: -1 },
        {
          where: {
            laneId,
            companyId,
            position: { [Op.gt]: task.position, [Op.lte]: newPosition }
          }
        }
      );
    } else if (newPosition < task.position) {
      await BoardTask.increment(
        { position: 1 },
        {
          where: {
            laneId,
            companyId,
            position: { [Op.gte]: newPosition, [Op.lt]: task.position }
          }
        }
      );
    }
  } else {
    // Close gap in origin lane
    await BoardTask.increment(
      { position: -1 },
      {
        where: {
          laneId: originLaneId,
          companyId,
          position: { [Op.gt]: task.position }
        }
      }
    );

    // Open gap in destination lane
    await BoardTask.increment(
      { position: 1 },
      {
        where: {
          laneId,
          companyId,
          position: { [Op.gte]: newPosition }
        }
      }
    );
  }

  await task.update({ laneId: +laneId, position: newPosition });

  return task;
};

export default MoveBoardTaskService;
