import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import AppError from "../../errors/AppError";
import database from "../../database";

interface Request {
  companyId: number;
  contactId: number;
}

const AnonymizeContactService = async ({
  companyId,
  contactId
}: Request): Promise<Contact> => {
  const contact = await Contact.findOne({
    where: { id: contactId, companyId }
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  await database.transaction(async t => {
    await ContactCustomField.destroy({
      where: { contactId: contact.id },
      transaction: t
    });

    await contact.update(
      {
        name: "Anonimizado",
        number: null,
        email: "",
        profilePicUrl: null
      },
      { transaction: t }
    );
  });

  await contact.reload();

  return contact;
};

export default AnonymizeContactService;
