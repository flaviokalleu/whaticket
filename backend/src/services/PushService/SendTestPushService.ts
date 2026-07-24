import SendPushToUserService from "./SendPushToUserService";

interface Request {
  companyId: number;
  userId: number;
}

const SendTestPushService = async ({
  companyId,
  userId
}: Request): Promise<void> => {
  await SendPushToUserService({
    companyId,
    userId,
    title: "Notificação de teste",
    body: "Se você recebeu isso, as notificações push estão funcionando.",
    url: "/"
  });
};

export default SendTestPushService;
