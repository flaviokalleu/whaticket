import sequelize from "./database";
import { logger } from "./utils/logger";
import { startWorkers } from "./queue/worker";

// Standalone background worker process. Unlike server.ts, this does NOT
// start the Express HTTP server or Socket.io — it only connects to the
// database and starts the BullMQ workers that drain the job queues.

sequelize
  .authenticate()
  .then(() => {
    logger.info("Worker process: database connection established");
    startWorkers();
  })
  .catch(err => {
    logger.error({ info: "Worker process: unable to connect to database", err });
    process.exit(1);
  });

process.on("uncaughtException", err => {
  logger.error({ info: "Worker global uncaught exception", err });
});

process.on("unhandledRejection", err => {
  if (err) logger.error({ info: "Worker global unhandled rejection", err });
});
