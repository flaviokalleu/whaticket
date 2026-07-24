import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import UserQueue from "../../models/UserQueue";
import TeamUser from "../../models/TeamUser";

interface Request {
  queueId: number;
  companyId: number;
  teamId?: number;
}

// Picks the least-busy available user eligible to receive a new ticket for
// the given queue (optionally further restricted to members of a team),
// based on how many open/pending tickets each candidate currently holds.
// Returns undefined when there is no eligible user, so callers can fall
// back to leaving the ticket unassigned.
//
// This is not wired into ticket creation yet — the natural call site is
// CreateTicketService (or FindOrCreateTicketService) right after a new
// ticket is persisted without a userId, to auto-assign it before the first
// notification/socket emit goes out.
const AutoDistributeTicketService = async ({
  queueId,
  companyId,
  teamId
}: Request): Promise<number | undefined> => {
  const userQueues = await UserQueue.findAll({ where: { queueId } });
  let candidateUserIds = userQueues.map(userQueue => userQueue.userId);

  if (candidateUserIds.length === 0) {
    return undefined;
  }

  if (teamId) {
    const teamUsers = await TeamUser.findAll({ where: { teamId } });
    const teamUserIds = new Set(teamUsers.map(teamUser => teamUser.userId));

    candidateUserIds = candidateUserIds.filter(userId =>
      teamUserIds.has(userId)
    );
  }

  if (candidateUserIds.length === 0) {
    return undefined;
  }

  const eligibleUsers = await User.findAll({
    where: {
      id: { [Op.in]: candidateUserIds },
      companyId
    }
  });

  if (eligibleUsers.length === 0) {
    return undefined;
  }

  const openTicketCounts = await Promise.all(
    eligibleUsers.map(async user => ({
      userId: user.id,
      openTickets: await Ticket.count({
        where: {
          userId: user.id,
          companyId,
          status: { [Op.in]: ["open", "pending"] }
        }
      })
    }))
  );

  openTicketCounts.sort((a, b) => a.openTickets - b.openTickets);

  return openTicketCounts[0].userId;
};

export default AutoDistributeTicketService;
