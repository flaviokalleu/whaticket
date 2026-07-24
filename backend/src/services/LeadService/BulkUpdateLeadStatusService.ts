import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Lead from "../../models/Lead";

interface Request {
  companyId: number;
  leadIds: Array<number | string>;
  status: string;
}

const BulkUpdateLeadStatusService = async ({
  companyId,
  leadIds,
  status
}: Request): Promise<number> => {
  const schema = Yup.object().shape({
    status: Yup.string().required("ERR_LEAD_INVALID_STATUS"),
    leadIds: Yup.array().min(1, "ERR_LEAD_IDS_REQUIRED").required("ERR_LEAD_IDS_REQUIRED")
  });

  try {
    await schema.validate({ status, leadIds });
  } catch (err) {
    throw new AppError(err.message);
  }

  const [affectedCount] = await Lead.update(
    { status },
    { where: { id: leadIds, companyId } }
  );

  return affectedCount;
};

export default BulkUpdateLeadStatusService;
