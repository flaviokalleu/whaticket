import Contact from "../../models/Contact";

interface Request {
  companyId: number;
}

type DuplicateGroup = {
  key: string;
  contacts: Contact[];
};

const normalizeSuffix = (number: string | null | undefined): string | null => {
  if (!number) return null;

  const digitsOnly = number.replace(/\D/g, "");

  if (digitsOnly.length < 8) return null;

  // Use the last 11 digits (or fewer if the number is shorter) to ignore
  // country-code / leading-zero formatting differences.
  const length = Math.min(11, digitsOnly.length);
  return digitsOnly.slice(-length).length >= 8
    ? digitsOnly.slice(-Math.max(8, length))
    : null;
};

const FindDuplicateContactsService = async ({
  companyId
}: Request): Promise<DuplicateGroup[]> => {
  const contacts = await Contact.findAll({
    where: { companyId },
    order: [["id", "ASC"]]
  });

  const groups = new Map<string, Contact[]>();

  contacts.forEach(contact => {
    const suffix = normalizeSuffix(contact.number);

    if (!suffix) return;

    // Compare against every existing group key using a "last 8 digits"
    // match so numbers with slightly different lengths still cluster.
    const shortKey = suffix.slice(-8);

    let matchedKey: string | null = null;
    for (const existingKey of groups.keys()) {
      if (existingKey.slice(-8) === shortKey) {
        matchedKey = existingKey;
        break;
      }
    }

    const key = matchedKey ?? suffix;

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key)!.push(contact);
  });

  const duplicateGroups: DuplicateGroup[] = [];

  groups.forEach((groupContacts, key) => {
    if (groupContacts.length > 1) {
      duplicateGroups.push({ key, contacts: groupContacts });
    }
  });

  return duplicateGroups;
};

export default FindDuplicateContactsService;
