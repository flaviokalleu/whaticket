import { Op, QueryTypes } from "sequelize";
import sequelize from "../../database";
import Ticket from "../../models/Ticket";
import Queue from "../../models/Queue";
import Contact from "../../models/Contact";
import User from "../../models/User";

interface Request {
  companyId: number;
}

interface AtRiskTicket {
  id: number;
  status: string;
  createdAt: Date;
  queueId: number;
  slaMinutes: number;
  minutesElapsed: number;
  minutesRemaining: number;
  breached: boolean;
}

// Simple heuristic: a ticket is "at risk" once it has passed 80% of its
// queue's first-response SLA and has not yet received any agent (outgoing)
// message. Once past 100% of the SLA it is considered "breached". There is
// no dedicated first-response-time tracking yet, so we approximate "no
// agent response" using the absence of any outgoing message on the ticket.
const GetTicketsAtRiskService = async ({
  companyId
}: Request): Promise<AtRiskTicket[]> => {
  const tickets = await Ticket.findAll({
    where: {
      companyId,
      status: { [Op.in]: ["pending", "open"] }
    },
    include: [
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "slaMinutes"],
        required: true,
        where: { slaMinutes: { [Op.not]: null as never } }
      },
      { model: Contact, as: "contact", attributes: ["id", "name"] },
      { model: User, as: "user", attributes: ["id", "name"] }
    ]
  });

  const now = Date.now();

  const result: AtRiskTicket[] = [];

  for (const ticket of tickets) {
    const queue = ticket.queue;
    if (!queue || !queue.slaMinutes) {
      continue;
    }

    const createdAtMs = new Date(ticket.createdAt).getTime();
    const minutesElapsed = (now - createdAtMs) / 60000;
    const threshold = queue.slaMinutes * 0.8;

    if (minutesElapsed < threshold) {
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const [{ count }] = await sequelize.query<{ count: string }>(
      `SELECT COUNT(*)::int as count FROM "Messages" WHERE "ticketId" = :ticketId AND "fromMe" = true`,
      {
        replacements: { ticketId: ticket.id },
        type: QueryTypes.SELECT
      }
    );

    const hasAgentResponse = Number(count) > 0;

    if (hasAgentResponse) {
      continue;
    }

    result.push({
      id: ticket.id,
      status: ticket.status,
      createdAt: ticket.createdAt,
      queueId: queue.id,
      slaMinutes: queue.slaMinutes,
      minutesElapsed: Math.round(minutesElapsed),
      minutesRemaining: Math.round(queue.slaMinutes - minutesElapsed),
      breached: minutesElapsed >= queue.slaMinutes
    });
  }

  return result;
};

export default GetTicketsAtRiskService;
