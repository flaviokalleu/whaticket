import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  companyId: number;
  daysAhead?: number;
}

interface UpcomingBirthday {
  id: number;
  name: string;
  number: string;
  birthDate: string;
  nextBirthday: string;
}

/**
 * Lists contacts whose birthday (month/day, ignoring year) falls within the
 * next `daysAhead` days, counting today. Handles year-end wraparound (e.g.
 * Dec 28 + 7 days should include early-January birthdays) by comparing the
 * day-of-year distance modulo 365/366.
 */
const ListUpcomingBirthdaysService = async ({
  companyId,
  daysAhead = 7
}: Request): Promise<UpcomingBirthday[]> => {
  const results = await sequelize.query<UpcomingBirthday>(
    `
    SELECT
      c.id,
      c.name,
      c.number,
      c."birthDate",
      (
        make_date(
          CASE
            WHEN (
              make_date(
                EXTRACT(YEAR FROM CURRENT_DATE)::int,
                EXTRACT(MONTH FROM c."birthDate")::int,
                EXTRACT(DAY FROM c."birthDate")::int
              )
            ) < CURRENT_DATE
            THEN EXTRACT(YEAR FROM CURRENT_DATE)::int + 1
            ELSE EXTRACT(YEAR FROM CURRENT_DATE)::int
          END,
          EXTRACT(MONTH FROM c."birthDate")::int,
          EXTRACT(DAY FROM c."birthDate")::int
        )
      ) AS "nextBirthday"
    FROM "Contacts" c
    WHERE c."companyId" = :companyId
      AND c."birthDate" IS NOT NULL
      AND (
        make_date(
          CASE
            WHEN (
              make_date(
                EXTRACT(YEAR FROM CURRENT_DATE)::int,
                EXTRACT(MONTH FROM c."birthDate")::int,
                EXTRACT(DAY FROM c."birthDate")::int
              )
            ) < CURRENT_DATE
            THEN EXTRACT(YEAR FROM CURRENT_DATE)::int + 1
            ELSE EXTRACT(YEAR FROM CURRENT_DATE)::int
          END,
          EXTRACT(MONTH FROM c."birthDate")::int,
          EXTRACT(DAY FROM c."birthDate")::int
        )
      ) BETWEEN CURRENT_DATE AND (CURRENT_DATE + :daysAhead * INTERVAL '1 day')
    ORDER BY "nextBirthday" ASC
    `,
    {
      replacements: { companyId, daysAhead },
      type: QueryTypes.SELECT
    }
  );

  return results;
};

export default ListUpcomingBirthdaysService;
