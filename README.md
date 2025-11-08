# Banking Transaction Microservices

This repository contains a modular banking microservices system built with **Node.js**, **PostgreSQL**, and **RabbitMQ**.  
It includes two main services:

- **Transaction Service**: Handles customer accounts, deposits, withdrawals, and publishes transaction events.
- **Notification Service**: Subscribes to transaction events and stores notifications, ready for extension to email/SMS/push.

---

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Database Setup](#database-setup)
- [Docker Setup](#docker-setup)
- [Running Services](#running-services)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Event Flow](#event-flow)
- [Troubleshooting](#troubleshooting)
- [Extending Notifications](#extending-notifications)
- [Notes](#notes)

---

## Architecture

- **Transaction Service**: REST API for banking operations. Publishes events (success/error) to RabbitMQ.
- **Notification Service**: Listens to RabbitMQ events, stores notifications in its own DB.
- **RabbitMQ**: Message broker for event-driven communication.
- **PostgreSQL**: Separate databases for each service.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)
- Node.js >= 20
- npm

---

## Project Structure

```
/transaction-service
  ├─ src/
  │   ├─ app.js
  │   ├─ routes/
  │   ├─ services/
  │   ├─ db/connection.js
  │   └─ init.sql
  ├─ Dockerfile
  ├─ package.json
  ├─ .env
  └─ unit_tests/
      └─ transactionService.test.js

/notification-service
  ├─ src/
  │   ├─ index.js
  │   ├─ routes/
  │   ├─ services/
  │   ├─ db/connection.js
  │   └─ init.sql
  ├─ Dockerfile
  ├─ package.json
  ├─ .env

/docker-compose.yml
```

---

## Database Setup

### Transaction Service (`transaction-db`)
- **Tables**: `customers`, `accounts`, `transactions`
- **Default Data**: Sample customers/accounts for testing edge cases (active, frozen, low balance)
- **Init**: Runs `init.sql` automatically on container startup

### Notification Service (`notification-db`)
- **Table**: `notifications`
- **Columns**: `notification_id`, `event_type`, `account_id`, `amount`, `message`, `created_at`
- **Init**: Runs `init.sql` automatically on container startup

---

## Docker Setup

Build and start all services:

```sh
docker-compose up --build
```

**Services:**

| Service               | Port(s)      | Description                                 |
|-----------------------|--------------|---------------------------------------------|
| rabbitmq              | 5672, 15672  | RabbitMQ broker & management UI             |
| transaction-db        | 5432         | PostgreSQL for Transaction Service          |
| notification-db       | 5432         | PostgreSQL for Notification Service         |
| transaction-service   | 3000         | Transaction API & event publisher           |
| notification-service  | 3003         | Notification API & event subscriber         |

---

## Running Services (Local Development)

**Transaction Service:**
```sh
cd transaction-service
npm install
npm run dev
```

**Notification Service:**
```sh
cd notification-service
npm install
npm run dev
```

Both services connect to their respective DBs and RabbitMQ as configured in `.env`.

---

## Testing

### Unit Tests

- Transaction Service: Jest tests in `unit_tests/transactionService.test.js`
- Run all tests:
  ```sh
  npm test
  ```

### Example cURL Commands

**Deposit**
```sh
curl -X POST http://localhost:3000/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{"account_id":1,"amount":1000}'
```

**Withdraw**
```sh
curl -X POST http://localhost:3000/transactions/withdraw \
  -H "Content-Type: application/json" \
  -d '{"account_id":1,"amount":500}'
```

**Get Statement**
```sh
curl http://localhost:3000/transactions/statement/1
```

### Edge Case Testing

| Scenario             | Account ID | Expected Event         |
|----------------------|------------|------------------------|
| Account not found    | 999        | `transaction.error`    |
| Account frozen       | 2          | `transaction.error`    |
| Insufficient funds   | 3          | `transaction.error`    |
| Exceed daily limit   | 1          | `transaction.error`    |

Notification Service logs received events and stores them in its DB.

---

## API Endpoints

### Transaction Service

| Method | Endpoint                                 | Description                |
|--------|------------------------------------------|----------------------------|
| POST   | `/transactions/deposit`                  | Make a deposit             |
| POST   | `/transactions/withdraw`                 | Make a withdrawal          |
| GET    | `/transactions/statement/:account_id`    | Get account statement      |
| GET    | `/transactions/history/:account_id`      | Get all transactions       |

### Notification Service

- Logs received events and stores them in DB.
- Ready to extend for email/SMS/push notifications.

---

## Event Flow

1. **Transaction Service** publishes events (success/error) to RabbitMQ.
2. **Notification Service** subscribes to `transaction_events` queue.
3. On event, Notification Service logs and stores notification.

---

## Troubleshooting

- **Port conflicts**: Only one RabbitMQ/PostgreSQL container can bind to a port at a time. Stop/remove old containers if needed.
- **Database errors**: Ensure DB containers are healthy and environment variables are correct.
- **RabbitMQ errors**: Ensure RabbitMQ is running before starting services.
- **Docker Compose warnings**: The `version` attribute is obsolete; you can safely remove it.

---

## Extending Notifications

- Implement email, SMS, or push notification logic in `notificationSender.js`.
- Add REST endpoints to Notification Service for querying notifications.

---

## Notes

- Both services are event-driven using RabbitMQ.
- `init.sql` files ensure default data for testing and are run automatically on service startup.
- Each service has its own database and can scale independently.
- Swagger docs are available for Transaction Service at `/api-docs` (if enabled).

---

## License

MIT (or your preferred license)

---

## Authors

- Himanshu S Gautam - 2024TM93048

---

## Feedback & Contributions

Feel free to open issues or submit pull requests for improvements!