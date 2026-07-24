import { Request, Response } from "express";
import webPushConfig from "../config/webPush";
import SubscribeService from "../services/PushService/SubscribeService";
import UnsubscribeService from "../services/PushService/UnsubscribeService";
import SendTestPushService from "../services/PushService/SendTestPushService";

export const getVapidPublicKey = async (
  req: Request,
  res: Response
): Promise<Response> => {
  return res.status(200).json({ publicKey: webPushConfig.publicKey });
};

export const subscribe = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { endpoint, p256dh, auth } = req.body;
  const { id: userId, companyId } = req.user;

  const subscription = await SubscribeService({
    userId: +userId,
    companyId,
    endpoint,
    p256dh,
    auth
  });

  return res.status(200).json(subscription);
};

export const unsubscribe = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { endpoint } = req.body;
  const { id: userId, companyId } = req.user;

  await UnsubscribeService({ userId: +userId, companyId, endpoint });

  return res.status(200).json({ message: "Unsubscribed" });
};

export const test = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id: userId, companyId } = req.user;

  await SendTestPushService({ userId: +userId, companyId });

  return res.status(200).json({ message: "Test push sent" });
};
