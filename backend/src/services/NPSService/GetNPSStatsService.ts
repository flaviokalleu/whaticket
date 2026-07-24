import { Op, WhereOptions } from "sequelize";
import NPSResponse from "../../models/NPSResponse";

interface Request {
  companyId: number;
  startDate?: string;
  endDate?: string;
}

interface NPSStats {
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
  total: number;
}

const GetNPSStatsService = async ({
  companyId,
  startDate,
  endDate
}: Request): Promise<NPSStats> => {
  const where: WhereOptions = { companyId };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [new Date(startDate), new Date(endDate)] as [Date, Date]
    } as never;
  }

  const responses = await NPSResponse.findAll({ where });

  const total = responses.length;

  let promoters = 0;
  let passives = 0;
  let detractors = 0;

  responses.forEach(response => {
    if (response.score >= 9) {
      promoters += 1;
    } else if (response.score >= 7) {
      passives += 1;
    } else {
      detractors += 1;
    }
  });

  const score =
    total > 0
      ? Math.round(((promoters - detractors) / total) * 100)
      : 0;

  return {
    score,
    promoters,
    passives,
    detractors,
    total
  };
};

export default GetNPSStatsService;
