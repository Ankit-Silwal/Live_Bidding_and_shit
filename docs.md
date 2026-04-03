# Backend Documentation

## 1. Overview

This repository contains a real-time auction backend split across two runtime processes:

- API server (Express + Socket.IO) in `apps/api`
- Worker process (BullMQ consumer) in `apps/worker`

Core infrastructure:

- PostgreSQL for durable data (users, auctions, bids)
- Redis for real-time auction state and queue transport
- BullMQ for background jobs (`end-auction`, `store-bid`)
- Supabase Storage for auction image uploads
- Clerk token verification for authenticated user sync

## 2. Backend Components

### API service (`apps/api`)

Responsibilities:

- Exposes REST endpoints
- Hosts Socket.IO server for live bidding
- Schedules queue jobs when auctions are created or bids are placed
- Mirrors auction state in Redis

Entry points:

- `index.ts`: creates HTTP server and initializes sockets
- `app.ts`: Express app, CORS, JSON parser, route registration
- `routes.ts`: mounts auth + auction routes under `/api`

### Worker service (`apps/worker`)

Responsibilities:

- Processes delayed `end-auction` jobs
- Persists queued `store-bid` jobs into PostgreSQL
- Updates auction status and winner accounting

Entry point:

- `worker.ts`

### Shared config package (`packages`)

- `db.ts`: PostgreSQL pool (`pg`)
- `redis.ts`: Redis client (`ioredis`) with BullMQ-compatible options

## 3. Data Model (PostgreSQL)

Defined in `apps/api/table.md`.

### users

- `id` (PK)
- `clerk_id` (unique)
- `email` (unique)
- `username`
- `profile_image`
- `balance` (default `100000`)
- `locked_balance` (default `0`)
- `created_at`
- `updated_at`

### auctions

- `id` (PK)
- `item`
- `start_price`
- `current_price`
- `status` (default `active`)
- `image_url`
- `end_time`
- `created_at`

### bids

- `id` (PK)
- `auction_id` (FK -> auctions.id)
- `user_id` (FK -> users.id)
- `amount`
- `created_at`

## 4. Redis Model

For each auction, Redis hash key format:

- `auction:{auctionId}`

Hash fields:

- `currentPrice`
- `highestBidder`
- `status` (`active` or `ended`)

Lifecycle:

1. Auction is inserted in PostgreSQL.
2. Auction state is loaded into Redis by `AuctionManager.loadAuctionIntoRedis`.
3. Live bids update Redis hash atomically using `WATCH` + `MULTI/EXEC`.
4. Worker sets status to `ended` after end-auction job execution.

## 5. Queue and Jobs (BullMQ)

Queue name:

- `auction-bids`

Producers:

- API schedules `end-auction` when an auction is created.
- API enqueues `store-bid` after successful bid placement.

Consumers:

- Worker listens on `auction-bids`.

### Job: `end-auction`

Input payload:

- `auctionId`

Behavior:

1. Read auction hash from Redis.
2. Mark auction status as `ended` in PostgreSQL.
3. If a winner exists, debit winner balance and locked balance.
4. Set Redis auction hash status to `ended`.

### Job: `store-bid`

Input payload:

- `auctionId`
- `userId`
- `amount`

Behavior:

- Inserts bid row into `bids` table (`ON CONFLICT DO NOTHING` is present in worker SQL).

Queue options used for bid persistence:

- Stable `jobId` format: `{auctionId}:{userId}:{amount}`
- Retries: `attempts: 3`
- Backoff: exponential, 1000ms base delay

## 6. REST API

Base route prefix: `/api`

### Auth routes

#### POST `/api/sync`

Auth:

- Requires `Authorization: Bearer <clerk_token>`

Body:

- `clerkId` (string)
- `email` (string)
- `username` (string)
- `profileImage` (string)

Behavior:

- Upserts user by `clerk_id`
- Returns full user row

Success response:

- `200 OK` with user object

Error response:

- `401` unauthorized/no token
- `500` failed sync

### Auction routes

#### GET `/api/auctions`

Behavior:

- Reads auctions directly from PostgreSQL
- Query used: `SELECT * FROM auctions ORDER BY created_at DESC`

Success response:

- `200 OK`
- Shape:
  - `success: true`
  - `data: <auction[]>`

#### POST `/api/auctions`

Content type:

- `multipart/form-data`

Body fields:

- `item`
- `start_price`
- `current_price`
- `end_time`
- `image_url` (optional)
- `image` file (optional, multer memory storage)

Behavior:

1. Creates auction in PostgreSQL.
2. Schedules delayed `end-auction` job if end time is in the future.
3. Loads auction state into Redis.
4. Uploads optional image to Supabase and updates `image_url`.

Success response:

- `201 Created`
- Shape:
  - `success: true`
  - `message: "Auction created successfully"`
  - `data: <auctionId>`
  - `imageUrl: <publicUrl or null>`

### Health-like route

#### GET `/url`

Response:

- `200 OK` with:
  - `success: true`
  - `url: "http://localhost:5000"` (or value from `PORT` env)

#### GET `/test`

Response:

- `200 OK` with `{ success: "true" }`

## 7. Socket.IO API

Connection:

- Socket server is attached to the API HTTP server
- CORS origin currently allows `*`

### Client event: `join-auction`

Payload:

- `auctionId` (string or room key)

Effect:

- Socket joins room named by auction id

### Client event: `place-bid`

Payload:

- `auctionId`
- `userId`
- `amount`

Server flow:

1. Validates auction state and bid amount in Redis.
2. Checks user balance in PostgreSQL.
3. Atomically updates highest bid in Redis.
4. Queues `store-bid` persistence job.
5. Emits room update event.
6. Calls optional callback with success/error payload.

### Server event: `bid-update`

Broadcast target:

- Room = `auctionId`

Payload:

- `{ auctionId, newPrice, userId }`

## 8. Environment Variables

The backend currently relies on these variables:

- `PORT` (optional, default `5000`)
- `REDIS_URL` (optional in code, default `redis://localhost:6379`)
- `CLERK_SECRET_KEY` (required for auth token verification)
- `NEXT_PUBLIC_SUPABASE_URL` (used by API for upload client)
- `SUPABASE_SECRET_KEY` (required for Supabase upload)

Note:

- PostgreSQL connection is currently hardcoded in `packages/db.ts` as `postgresql://postgres:postgres@localhost:5433/auction`.

## 9. Local Development

### Infrastructure

Use Docker Compose from repository root:

- Starts Redis on `6379`
- Starts Postgres on host port `5433`

### Run API

From `apps/api`:

- `npm run dev`

### Run Worker

From `apps/worker`:

- `npm run dev`

Both services must run for full functionality:

- API handles HTTP and WebSocket traffic
- Worker handles queued background jobs

## 10. End-to-End Auction Flow

1. Client creates auction via `POST /api/auctions`.
2. Clients can fetch auctions via `GET /api/auctions` (database-backed list).
3. API schedules delayed `end-auction` job.
4. Clients join auction room via `join-auction`.
5. Clients place bids via `place-bid`.
6. API updates Redis, broadcasts `bid-update`, and queues `store-bid`.
7. Worker persists bids and eventually ends auction.
8. Worker updates final auction state and winner balances.

## 11. Current Implementation Notes

- Auction creation endpoint is not protected by auth middleware.
- Bid placement uses optimistic Redis transaction with retry loop.
- Worker handles unknown/missing Redis auction hashes gracefully for `end-auction`.
- Some SQL/schema definitions live in markdown (`apps/api/table.md`) and should be kept consistent with actual database state.
