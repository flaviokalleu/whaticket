import IORedis from "ioredis";

import { logger } from "../utils/logger";

// Dedicated Redis connection for BullMQ. BullMQ manages its own ioredis
// client lifecycle internally and requires specific connection options, so
// this connection is intentionally separate from the one used by
// `../libs/redisStore.ts` (which backs session storage). We reuse the same
// env var naming conventions (`REDIS_URL`, `REDIS_DB`) for consistency.
//
// `maxRetriesPerRequest: null` is a hard requirement from BullMQ: without it,
// Workers can silently stop processing jobs when Redis commands time out
// instead of blocking/retrying indefinitely as BullMQ expects.
// See: https://docs.bullmq.io/guide/going-to-production#maxretriesperrequest
const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  db: parseInt(process.env.REDIS_DB || "0", 10),
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

connection.on("connect", () => {
  logger.info("BullMQ Redis connection established");
});

connection.on("error", err => {
  logger.error({ info: "BullMQ Redis connection error", err });
});

export default connection;
