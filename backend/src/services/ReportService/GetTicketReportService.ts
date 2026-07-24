import { Op, fn, col, WhereOptions } from "sequelize";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";
import Message from "../../models/Message";
import UserRating from "../../models/UserRating";
import NPSResponse from "../../models/NPSResponse";

interface Request {
  companyId: number;
  startDate?: string;
  endDate?: string;
  queueId?: string;
  userId?: string;
}

export interface TicketReport {
  summary: {
    total: number;
    open: number;
    pending: number;
    closed: number;
    avgFirstResponseMinutes: number | null;
    avgResolutionMinutes: number | null;
    resolutionRate: number;
  };
  byDay: { date: string; created: number; closed: number }[];
  byHour: { hour: number; total: number }[];
  byQueue: { queueId: number | null; name: string; color: string; total: number }[];
  byUser: {
    userId: number | null;
    name: string;
    total: number;
    closed: number;
    avgRating: number | null;
  }[];
  byTag: { tagId: number; name: string; color: string; total: number }[];
  ratings: {
    total: number;
    average: number | null;
    distribution: { rate: number; total: number }[];
  };
  nps: {
    total: number;
    score: number | null;
    promoters: number;
    passives: number;
    detractors: number;
  };
}

const toDate = (value: string | undefined, fallback: Date): Date => {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const minutesBetween = (a: Date, b: Date): number =>
  Math.max(0, (b.getTime() - a.getTime()) / 60000);

const GetTicketReportService = async ({
  companyId,
  startDate,
  endDate,
  queueId,
  userId
}: Request): Promise<TicketReport> => {
  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setDate(defaultStart.getDate() - 29);
  defaultStart.setHours(0, 0, 0, 0);

  const start = toDate(startDate, defaultStart);
  const end = toDate(endDate, now);
  end.setHours(23, 59, 59, 999);

  const where = {
    companyId,
    createdAt: { [Op.between]: [start, end] }
  } as WhereOptions;

  if (queueId) Object.assign(where, { queueId: +queueId });
  if (userId) Object.assign(where, { userId: +userId });

  const tickets = await Ticket.findAll({
    where,
    attributes: ["id", "status", "userId", "queueId", "createdAt", "updatedAt"],
    include: [
      { model: User, attributes: ["id", "name"] },
      { model: Queue, attributes: ["id", "name", "color"] },
      { model: Tag, attributes: ["id", "name", "color"], through: { attributes: [] } }
    ]
  });

  const ticketIds = tickets.map(t => t.id);

  // --- Summary ---------------------------------------------------------
  const total = tickets.length;
  const open = tickets.filter(t => t.status === "open").length;
  const pending = tickets.filter(t => t.status === "pending").length;
  const closed = tickets.filter(t => t.status === "closed").length;

  // First response time: first outbound (fromMe) message per ticket.
  let avgFirstResponseMinutes: number | null = null;
  if (ticketIds.length) {
    const firstReplies = (await Message.findAll({
      where: { ticketId: { [Op.in]: ticketIds }, fromMe: true },
      attributes: [
        "ticketId",
        [fn("MIN", col("Message.createdAt")), "firstAt"]
      ],
      group: ["ticketId"],
      raw: true
    })) as unknown as { ticketId: number; firstAt: string }[];

    const createdById = new Map(tickets.map(t => [t.id, t.createdAt]));
    const deltas = firstReplies
      .map(row => {
        const createdAt = createdById.get(row.ticketId);
        if (!createdAt) return null;
        return minutesBetween(new Date(createdAt), new Date(row.firstAt));
      })
      .filter((v): v is number => v !== null);

    if (deltas.length) {
      avgFirstResponseMinutes =
        Math.round((deltas.reduce((a, b) => a + b, 0) / deltas.length) * 10) / 10;
    }
  }

  // Resolution time: closed tickets, createdAt -> updatedAt.
  const closedTickets = tickets.filter(t => t.status === "closed");
  const avgResolutionMinutes = closedTickets.length
    ? Math.round(
        (closedTickets.reduce(
          (acc, t) => acc + minutesBetween(t.createdAt, t.updatedAt),
          0
        ) /
          closedTickets.length) *
          10
      ) / 10
    : null;

  // --- Series by day ---------------------------------------------------
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const days: string[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  while (cursor <= end && days.length < 366) {
    days.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const createdByDay = new Map<string, number>();
  const closedByDay = new Map<string, number>();
  tickets.forEach(t => {
    const k = dayKey(t.createdAt);
    createdByDay.set(k, (createdByDay.get(k) || 0) + 1);
    if (t.status === "closed") {
      const ck = dayKey(t.updatedAt);
      closedByDay.set(ck, (closedByDay.get(ck) || 0) + 1);
    }
  });

  const byDay = days.map(date => ({
    date,
    created: createdByDay.get(date) || 0,
    closed: closedByDay.get(date) || 0
  }));

  // --- Distribution by hour of day -------------------------------------
  const hourBuckets = new Array(24).fill(0);
  tickets.forEach(t => {
    hourBuckets[new Date(t.createdAt).getHours()] += 1;
  });
  const byHour = hourBuckets.map((totalForHour, hour) => ({
    hour,
    total: totalForHour
  }));

  // --- By queue --------------------------------------------------------
  const queueMap = new Map<
    string,
    { queueId: number | null; name: string; color: string; total: number }
  >();
  tickets.forEach(t => {
    const key = String(t.queueId ?? "none");
    if (!queueMap.has(key)) {
      queueMap.set(key, {
        queueId: t.queueId ?? null,
        name: t.queue?.name || "Sem fila",
        color: t.queue?.color || "#94a3b8",
        total: 0
      });
    }
    queueMap.get(key)!.total += 1;
  });
  const byQueue = [...queueMap.values()].sort((a, b) => b.total - a.total);

  // --- Ratings (needed before byUser so we can attach averages) --------
  const ratings = ticketIds.length
    ? await UserRating.findAll({
        where: { companyId, ticketId: { [Op.in]: ticketIds } },
        attributes: ["rate", "userId"]
      })
    : [];

  const ratingSumByUser = new Map<number, { sum: number; count: number }>();
  ratings.forEach(r => {
    if (!r.userId) return;
    const entry = ratingSumByUser.get(r.userId) || { sum: 0, count: 0 };
    entry.sum += r.rate;
    entry.count += 1;
    ratingSumByUser.set(r.userId, entry);
  });

  // --- By user ---------------------------------------------------------
  const userMap = new Map<
    string,
    {
      userId: number | null;
      name: string;
      total: number;
      closed: number;
      avgRating: number | null;
    }
  >();
  tickets.forEach(t => {
    const key = String(t.userId ?? "none");
    if (!userMap.has(key)) {
      userMap.set(key, {
        userId: t.userId ?? null,
        name: t.user?.name || "Não atribuído",
        total: 0,
        closed: 0,
        avgRating: null
      });
    }
    const entry = userMap.get(key)!;
    entry.total += 1;
    if (t.status === "closed") entry.closed += 1;
  });
  userMap.forEach(entry => {
    if (entry.userId && ratingSumByUser.has(entry.userId)) {
      const { sum, count } = ratingSumByUser.get(entry.userId)!;
      // eslint-disable-next-line no-param-reassign
      entry.avgRating = Math.round((sum / count) * 10) / 10;
    }
  });
  const byUser = [...userMap.values()].sort((a, b) => b.total - a.total);

  // --- By tag ----------------------------------------------------------
  const tagMap = new Map<
    number,
    { tagId: number; name: string; color: string; total: number }
  >();
  tickets.forEach(t => {
    (t.tags || []).forEach(tag => {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, {
          tagId: tag.id,
          name: tag.name,
          color: tag.color,
          total: 0
        });
      }
      tagMap.get(tag.id)!.total += 1;
    });
  });
  const byTag = [...tagMap.values()].sort((a, b) => b.total - a.total);

  // --- Rating summary --------------------------------------------------
  const ratingDistribution = [1, 2, 3, 4, 5].map(rate => ({
    rate,
    total: ratings.filter(r => r.rate === rate).length
  }));
  const ratingAverage = ratings.length
    ? Math.round(
        (ratings.reduce((acc, r) => acc + r.rate, 0) / ratings.length) * 10
      ) / 10
    : null;

  // --- NPS -------------------------------------------------------------
  const npsResponses = await NPSResponse.findAll({
    where: {
      companyId,
      createdAt: { [Op.between]: [start, end] }
    } as WhereOptions,
    attributes: ["score"]
  });

  const promoters = npsResponses.filter(r => r.score >= 9).length;
  const passives = npsResponses.filter(r => r.score >= 7 && r.score <= 8).length;
  const detractors = npsResponses.filter(r => r.score <= 6).length;
  const npsScore = npsResponses.length
    ? Math.round(
        ((promoters - detractors) / npsResponses.length) * 100
      )
    : null;

  return {
    summary: {
      total,
      open,
      pending,
      closed,
      avgFirstResponseMinutes,
      avgResolutionMinutes,
      resolutionRate: total ? Math.round((closed / total) * 100) : 0
    },
    byDay,
    byHour,
    byQueue,
    byUser,
    byTag,
    ratings: {
      total: ratings.length,
      average: ratingAverage,
      distribution: ratingDistribution
    },
    nps: {
      total: npsResponses.length,
      score: npsScore,
      promoters,
      passives,
      detractors
    }
  };
};

export default GetTicketReportService;
