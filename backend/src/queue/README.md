# Queue (BullMQ)

This directory contains the BullMQ-based async job queue used for offloading
heavy/slow work (campaigns, scheduled messages, webhooks, and other
background tasks) from the main API request-response cycle.

## Enqueueing a job

Import the queue you need from `queues.ts` and call `.add(name, data)`. Every
job payload **must** include `companyId` as a top-level field — this is a
multi-tenant system and every consumer scopes its work by `companyId`.

```ts
import { campaignQueue } from "../queue/queues";

await campaignQueue.add("send", { companyId, campaignId });
```

Available queues: `campaignQueue`, `scheduledMessageQueue`, `webhookQueue`,
and `genericQueue` (a catch-all for anything not yet categorized). Payload
shapes are defined in `types.ts`.

## How jobs get processed

Jobs are only picked up by a running worker process. `worker.ts` defines
`startWorkers()`, which creates a BullMQ `Worker` per queue, each backed by a
small named processor function (`processCampaignJob`,
`processScheduledMessageJob`, `processWebhookJob`, `processGenericJob`).
These are currently stubs that just log receipt of the job — the actual
business logic for each feature will be filled in by the corresponding
feature's implementation.

## Running the worker

The worker runs as a **separate OS process** from the API server, entered via
`backend/src/worker.ts` and started with:

```
npm run worker
```

This must be running alongside `npm run dev` (or the equivalent production
process) for queued jobs to actually execute — the API process only enqueues
jobs, it does not process them.
