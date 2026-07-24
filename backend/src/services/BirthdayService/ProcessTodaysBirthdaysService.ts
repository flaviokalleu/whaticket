import { Op } from "sequelize";
import BirthdaySetting from "../../models/BirthdaySetting";
import BirthdayLog from "../../models/BirthdayLog";
import { whatsappProvider } from "../../providers/WhatsApp";
import { logger } from "../../utils/logger";
import ListTodayBirthdaysService from "./ListTodayBirthdaysService";

interface Request {
  companyId: number;
}

const DEFAULT_TEMPLATE = "Feliz aniversário, {{name}}! 🎉";

/**
 * Processes today's birthdays for a single company: sends a birthday
 * message (via the existing WhatsApp provider) to every contact whose
 * birthday is today and who hasn't already received one this year, then
 * records a BirthdayLog row to prevent duplicate sends.
 *
 * NOTE: this service does not schedule itself. It must be invoked by a
 * daily cron job (e.g. using node-cron) that iterates over companies and
 * calls this service once per company at (or after) their configured
 * BirthdaySetting.sendHour. Wiring that cron job is intentionally left
 * out of this service — see server.ts / a dedicated scheduler module.
 */
const ProcessTodaysBirthdaysService = async ({
  companyId
}: Request): Promise<void> => {
  const setting = await BirthdaySetting.findOne({ where: { companyId } });

  if (!setting || !setting.isEnabled || !setting.whatsappId) {
    return;
  }

  const currentYear = new Date().getFullYear();
  const todaysBirthdays = await ListTodayBirthdaysService({ companyId });

  if (todaysBirthdays.length === 0) {
    return;
  }

  const contactIds = todaysBirthdays.map(contact => contact.id);

  const existingLogs = await BirthdayLog.findAll({
    where: {
      companyId,
      year: currentYear,
      contactId: { [Op.in]: contactIds }
    }
  });

  const alreadySentContactIds = new Set(
    existingLogs.map(log => log.contactId)
  );

  const template = setting.messageTemplate || DEFAULT_TEMPLATE;

  // eslint-disable-next-line no-restricted-syntax
  for (const contact of todaysBirthdays) {
    if (alreadySentContactIds.has(contact.id)) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const message = template.replace(/{{\s*name\s*}}/g, contact.name);
    const chatId = `${contact.number}@c.us`;

    try {
      // eslint-disable-next-line no-await-in-loop
      await whatsappProvider.sendMessage(setting.whatsappId, chatId, message);

      // eslint-disable-next-line no-await-in-loop
      await BirthdayLog.create({
        companyId,
        contactId: contact.id,
        year: currentYear,
        sentAt: new Date()
      } as BirthdayLog);
    } catch (err) {
      logger.error(
        err,
        `ProcessTodaysBirthdaysService: failed to send birthday message to contact ${contact.id}`
      );
    }
  }
};

export default ProcessTodaysBirthdaysService;
