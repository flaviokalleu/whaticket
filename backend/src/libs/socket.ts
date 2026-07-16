import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import { verify } from "jsonwebtoken";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import authConfig from "../config/auth";
import Ticket from "../models/Ticket";
import ShowUserService from "../services/UserServices/ShowUserService";

interface TokenPayload {
  id: string;
  profile: string;
}

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
    }
  });

  io.on("connection", socket => {
    const { token } = socket.handshake.query;
    let decoded: TokenPayload | null = null;
    try {
      decoded = verify(token, authConfig.secret) as TokenPayload;
      logger.debug(JSON.stringify(decoded), "io-onConnection: tokenData");
    } catch (error) {
      logger.error(JSON.stringify(error), "Error decoding token");
      socket.disconnect();
      return io;
    }

    const tokenData: TokenPayload = decoded;

    logger.info("Client Connected");
    socket.on("joinChatBox", async (ticketId: string) => {
      if (tokenData.profile !== "admin") {
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) return;

        const isOwner = ticket.userId === +tokenData.id;
        let isInQueue = false;
        if (!isOwner && ticket.queueId) {
          const requestUser = await ShowUserService(tokenData.id);
          isInQueue = requestUser.queues.some(
            queue => queue.id === ticket.queueId
          );
        }

        if (!isOwner && !isInQueue) {
          logger.warn(
            `Client ${tokenData.id} denied join to ticket ${ticketId} (no access)`
          );
          return;
        }
      }

      logger.info("A client joined a ticket channel");
      socket.join(ticketId);
    });

    socket.on("joinNotification", () => {
      logger.info("A client joined notification channel");
      socket.join("notification");
    });

    socket.on("joinTickets", (status: string) => {
      logger.info(`A client joined to ${status} tickets channel.`);
      socket.join(status);
    });

    socket.on("disconnect", () => {
      logger.info("Client disconnected");
    });

    return socket;
  });
  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};
