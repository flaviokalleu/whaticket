import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import ContactCustomField from "../../models/ContactCustomField";
import AppError from "../../errors/AppError";
import database from "../../database";

interface Request {
  companyId: number;
  primaryContactId: number;
  duplicateContactIds: number[];
}

const MergeContactsService = async ({
  companyId,
  primaryContactId,
  duplicateContactIds
}: Request): Promise<Contact> => {
  const filteredDuplicateIds = duplicateContactIds.filter(
    id => Number(id) !== Number(primaryContactId)
  );

  if (filteredDuplicateIds.length === 0) {
    throw new AppError("ERR_NO_DUPLICATE_CONTACTS_PROVIDED", 400);
  }

  const primaryContact = await Contact.findOne({
    where: { id: primaryContactId, companyId }
  });

  if (!primaryContact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  const duplicateContacts = await Contact.findAll({
    where: { id: filteredDuplicateIds, companyId }
  });

  if (duplicateContacts.length !== filteredDuplicateIds.length) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  const duplicateIds = duplicateContacts.map(c => c.id);

  await database.transaction(async t => {
    await Ticket.update(
      { contactId: primaryContact.id },
      { where: { contactId: duplicateIds, companyId }, transaction: t }
    );

    await ContactCustomField.update(
      { contactId: primaryContact.id },
      { where: { contactId: duplicateIds }, transaction: t }
    );

    await Contact.destroy({
      where: { id: duplicateIds, companyId },
      transaction: t
    });
  });

  await primaryContact.reload();

  return primaryContact;
};

export default MergeContactsService;
