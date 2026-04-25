# Quick Payment Pages (QPP)

A hosted, full-stack web application that enables providers to create flexible, branded, self-service payment pages.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Express 5 + TypeScript |
| Database | MySQL 8 (Docker) |
| Payments | Stripe (sandbox) |

## Project Structure

```
qpp/
├── frontend/          # React + Vite app
├── backend/           # Express API
│   └── .env           # Environment variables (see below)
├── db/
│   └── init.sql       # Database schema
├── docker-compose.yml # MySQL service
└── package.json       # Root convenience scripts
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/)

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd <repo-name>
```

### 2. Install dependencies

```bash
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 3. Configure environment variables

Copy the repo root example into `backend/.env` and fill in your values:

```bash
cp .env.example backend/.env
```

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: `3000`) |
| `DB_HOST` | MySQL host (default: `localhost`) |
| `DB_PORT` | MySQL port for local backend (default: `3307`) |
| `DB_NAME` | Database name |
| `DB_USER` | MySQL user (use `root` for local dev) |
| `DB_PASSWORD` | Password for `DB_USER` — must match `DB_ROOT_PASSWORD` when using root |
| `DB_ROOT_PASSWORD` | MySQL root password set by Docker |
| `RESEND_API_KEY` | Resend API key used for payment receipt emails |
| `EMAIL_FROM` | Sender for payment receipts; use a verified Resend sender or domain |
| `EMAIL_REPLY_TO` | Optional reply-to address for receipt emails |

### 4. Start the database

```bash
npm run db:up
```

When you run the backend locally with `npm run backend`, it connects through the host-mapped MySQL port `3307`.
When you run the backend in Docker with `npm run stack:up`, Docker Compose overrides `DB_HOST` and `DB_PORT` so the container connects to MySQL on the internal Docker network.

To reset the database and re-run migrations:

```bash
npm run db:down -- -v && npm run db:up
```

### 5. Start the backend

```bash
npm run backend
# or: cd backend && npm run dev
```

If you do not have Stripe sandbox credentials yet, set `STRIPE_MOCK_SUCCESS=true` in `backend/.env` to work on non-payment flows without a Stripe secret key.

### 5a. Configure Resend for receipts and Auth0 email

For application payment receipts, add these values to `backend/.env`:

```bash
RESEND_API_KEY=re_xxxxxxxxx
EMAIL_FROM=QPP <onboarding@resend.dev>
EMAIL_REPLY_TO=support@example.com
```

The backend sends a payment receipt automatically after a successful payment when `RESEND_API_KEY` and `EMAIL_FROM` are configured.

For Auth0 verification emails, configure the Auth0 email provider with Resend SMTP:

```text
Host: smtp.resend.com
Port: 465
Username: resend
Password: <your RESEND_API_KEY>
```

After that, customize the Auth0 verification email template in the Auth0 dashboard if you want branded copy. Auth0 handles the verification link or verification code flow; the app does not generate those codes itself.

### 6. Start the frontend

```bash
npm run frontend
# or: cd frontend && npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Root Scripts

| Script | Description |
|--------|-------------|
| `npm run db:up` | Start MySQL container |
| `npm run db:down` | Stop MySQL container |
| `npm run db:logs` | Tail database container logs |
| `npm run backend` | Start backend dev server |
| `npm run frontend` | Start frontend dev server |

## Database Schema

See [`db/init.sql`](db/init.sql) for the full schema. Core tables:

- `admin_users` — admin portal accounts
- `payment_pages` — QPP configurations (branding, amounts, fields)
- `custom_fields` — dynamic form fields per payment page
- `transactions` — payment records
- `field_responses` — custom field values per transaction
