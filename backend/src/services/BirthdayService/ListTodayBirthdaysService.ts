import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  companyId: number;
}

interface TodayBirthday {
  id: number;
  name: string;
  number: string;
  birthDate: string;
}

const ListTodayBirthdaysService = async ({
  companyId
}: Request): Promise<TodayBirthday[]> => {
  const results = await sequelize.query<TodayBirthday>(
    `
    SELECT c.id, c.name, c.number, c."birthDate"
    FROM "Contacts" c
    WHERE c."companyId" = :companyId
      AND c."birthDate" IS NOT NULL
      AND EXTRACT(MONTH FROM c."birthDate") = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(DAY FROM c."birthDate") = EXTRACT(DAY FROM CURRENT_DATE)
    `,
    {
      replacements: { companyId },
      type: QueryTypes.SELECT
    }
  );

  return results;
};

export default ListTodayBirthdaysService;
