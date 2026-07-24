import { Op, QueryTypes } from "sequelize";
import sequelize from "../../database";
import Ticket from "../../models/Ticket";
import Queue from "../../models/Queue";

interface Request {
  companyId: number;
}

interface QueueSLAStats {
  queueId: number;
  queueName: string;
  slaMinutes: number | null;
  onTrack: number;
  atRisk: number;
  breached: number;
  total: number;
}

const GetSLAStatsService = async ({
  companyId
}: Request): Promise<QueueSLAStats[]> => {
  const queues = await Queue.findAll({
    where: { companyId, slaMinutes: { [Op.not]: null as never } }
  });

  const stats: QueueSLAStats[] = [];

  for (const queue of queues) {
    // eslint-disable-next-line no-await-in-loop
    const tickets = await Ticket.findAll({
      where: {
        companyId,
        queueId: queue.id,
        status: { [Op.in]: ["pending", "open"] }
      },
      attributes: ["id", "createdAt"]
    });

    let onTrack = 0;
    let atRisk = 0;
    let breached = 0;

    const now = Date.now();
    const threshold = queue.slaMinutes * 0.8;

    for (const ticket of tickets) {
      const minutesElapsed =
        (now - new Date(ticket.createdAt).getTime()) / 60000;

      if (minutesElapsed >= queue.slaMinutes) {
        breached += 1;
      } else if (minutesElapsed >= threshold) {
        atRisk += 1;
      } else {
        onTrack += 1;
      }
    }

    stats.push({
      queueId: queue.id,
      queueName: queue.name,
      slaMinutes: queue.slaMinutes,
      onTrack,
      atRisk,
      breached,
      total: tickets.length
    });
  }

  return stats;
};

export default GetSLAStatsService;
