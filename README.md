# Disc Golf South Africa

Disc Golf South Africa (DGSA) is a full-stack membership and event
registration platform for the South African disc golf community. Players can
create accounts, manage their membership, register for tournaments, and submit
proof of payment. Administrators can manage members, events, registrations,
and payment statuses.

> This is a student project from Open Window.

**Live site:** <https://dqg3uf1qf7jek.cloudfront.net>

**Repository:** <https://github.com/251142-coenraadjlindholm/DiscGolf---Copy-AWS>

## Features

### Public

- Landing page with the featured tournament, upcoming events, FAQ, and footer
- Account registration and login
- Public event listing and event details
- Public event poster images

### Members

- Member dashboard and profile
- Free and DGSA membership tiers
- Membership purchase flow
- Tournament registration for up to eight players
- Division selection and member lookup by email
- Proof-of-payment upload
- List of the member's event registrations

### Administrators

- Administrator dashboard
- Member and registration lists
- Payment management
- Payment status updates: `pending`, `on_time`, or `overdue`
- Event creation with poster upload and PDGA tier

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Create React App, React Router 6, React Bootstrap |
| Backend | Node.js 22, Express 5, Mongoose 9 |
| Database | MongoDB |
| Authentication | JWT stored in HTTP-only cookies, bcryptjs |
| Security | Helmet, CORS, express-rate-limit, Multer |
| Hosting | AWS Elastic Beanstalk behind CloudFront |
| Production serving | The Express server serves the API and the React build |

## Project structure

    .
    ├── backend/
    │   ├── src/
    │   │   ├── config/          Database, constants, and admin setup
    │   │   ├── controllers/     API request handlers
    │   │   ├── middleware/      Authentication, uploads, and error handling
    │   │   ├── models/          Mongoose models
    │   │   ├── routes/          API routers
    │   │   ├── scripts/         One-off maintenance scripts
    │   │   └── utils/           Validation and upload helpers
    │   ├── uploads/
    │   │   ├── posters/         Event poster files
    │   │   └── proofs/          Payment proof files
    │   └── package.json
    ├── frontend/
    │   ├── public/              Static public assets
    │   ├── src/                 React application
    │   ├── build/               Generated production build
    │   └── package.json
    ├── .platform/               Elastic Beanstalk configuration
    ├── package.json
    └── Procfile

## Requirements

- Node.js 22.x
- npm
- A MongoDB database, either local or MongoDB Atlas

## Getting started

### 1. Install dependencies

From the project root:

    npm install --prefix backend
    npm install --prefix frontend

### 2. Configure the backend

Create `backend/.env`:

    MONGODB_URI=mongodb://127.0.0.1:27017/disc_golf
    JWT_SECRET=replace-with-a-random-string-of-at-least-32-characters
    CLIENT_URL=http://localhost:3000
    ADMIN_EMAIL=admin@example.com
    ADMIN_PASSWORD=replace-with-a-password-longer-than-8-characters
    PORT=5000
    NODE_ENV=development

The server requires `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `ADMIN_EMAIL`,
and `ADMIN_PASSWORD`. It will refuse to start if `JWT_SECRET` is shorter than
32 characters. On startup, the administrator account is created or updated
from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

Never commit `.env` files or real credentials.

### 3. Configure the frontend (optional)

Create `frontend/.env` only when the API is not running at the default address:

    REACT_APP_API_URL=http://localhost:5000

In production, the frontend defaults to the same origin as the website. The
frontend sends authentication requests with credentials so the backend can
read the HTTP-only authentication cookie.

### 4. Run locally

Start the backend in one terminal:

    npm run dev --prefix backend

Start the frontend in a second terminal:

    npm start --prefix frontend

The React development server runs at
<http://localhost:3000>. The API runs at
<http://localhost:5000> unless `PORT` is changed.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the production backend server from the project root |
| `npm run build` | Install dependencies and build the frontend |
| `npm run dev --prefix backend` | Run the backend with Node watch mode |
| `npm start --prefix frontend` | Start the React development server |
| `npm test --prefix frontend` | Run the frontend test suite |
| `npm run build --prefix frontend` | Build the React app |

## Frontend routes

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login` | Public | Log in |
| `/signup` | Public | Create an account |
| `/membership` | Logged in | Choose and purchase a membership tier |
| `/registration` | Logged in | Register for an event |
| `/dashboard` | Logged in | Member or administrator dashboard |
| `/dashboard/profile` | Logged in | View the member profile |
| `/dashboard/payments` | Administrator | Manage payments |
| `/dashboard/events/new` | Administrator | Create an event |

The registration page receives its event through the `eventId` query
parameter, for example `/registration?eventId=<id>`.

## API overview

All API endpoints are mounted under `/api`.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Public, rate limited | Create an account |
| `POST` | `/auth/login` | Public, rate limited | Log in |
| `POST` | `/auth/logout` | Public | Clear the authentication cookie |
| `GET` | `/auth/me` | Optional | Get the current user |
| `GET` | `/events` | Public | List events |
| `GET` | `/events/:id` | Public | Get one event |
| `POST` | `/events` | Administrator | Create an event and upload a poster |
| `POST` | `/events/:eventId/registrations` | Logged in | Register players and upload proof |
| `GET` | `/registrations/mine` | Logged in | List the user's registrations |
| `GET` | `/users/lookup?email=` | Logged in | Look up a member by email |
| `POST` | `/users/membership` | Logged in | Submit membership details and proof |
| `POST` | `/users/membership/purchase` | Logged in | Complete the membership purchase flow |
| `GET` | `/dashboard/member` | Logged in | Get member dashboard data |
| `GET` | `/payments/:id/proof` | Authorised user | Download payment proof |
| `GET` | `/admin/members` | Administrator | List members |
| `GET` | `/admin/registrations` | Administrator | List registrations |
| `GET` | `/admin/payments` | Administrator | List payments |
| `PATCH` | `/admin/payments/:id/status` | Administrator | Update payment status |

Login and signup are limited to 20 requests per 15 minutes. Proof uploads
accept PDF, PNG, and JPEG files. Poster uploads accept PNG, JPEG, and WebP
files. Both upload types are limited to 5 MB.

Payment proofs are not served as static files. They are available only through
the authorised payment-proof endpoint.

## AWS deployment

The root `package.json` contains the production build and deployment commands.
The `Procfile` starts the backend with:

    node backend/src/server.js

### Build and package

Build the frontend:

    npm run build

After building, create a deployment archive using your approved deployment
process, including `package.json`, `package-lock.json`, `backend/`,
`frontend/build/`, and `.platform/`. Do not include `backend/.env` or
backend `node_modules`. Upload the resulting archive to AWS Elastic Beanstalk.
Configure the environment with
the following variables:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV=production` | Enables the production React build and sitemap |
| `PORT=8080` | Internal application port used by Elastic Beanstalk |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign authentication cookies |
| `CLIENT_URL=https://dqg3uf1qf7jek.cloudfront.net` | Public CloudFront origin used for CORS |
| `ADMIN_EMAIL` | Administrator account email |
| `ADMIN_PASSWORD` | Administrator account password |
| `PUBLIC_URL` | Optional public base URL override for the sitemap |

The current production configuration uses:

    CLIENT_URL=https://dqg3uf1qf7jek.cloudfront.net
    NODE_ENV=production
    PORT=8080

For authenticated requests, the CloudFront behavior must forward cookies and
the `Origin` header and allow credentialed CORS responses. If old frontend
assets remain cached after a deployment, invalidate the CloudFront
distribution, for example with:


In production, Express serves the React build and falls back to
`frontend/build/index.html` for client-side routes. It also generates
`/sitemap.xml` from the configured public URL and the events stored in MongoDB.

## Security notes

- Never commit `backend/.env`, deployment credentials, or real user data.
- Use unique production values for `JWT_SECRET` and administrator credentials.
- Store production secrets in Elastic Beanstalk environment properties or a
  secrets manager.
- Keep the public website and CloudFront distribution on HTTPS.
- Do not expose the `uploads/proofs` directory as a static route.
- Payment purchase is a project flow and does not process a real payment.

## Pre-deployment checklist

1. Run the frontend tests:
   `npm test --prefix frontend -- --watchAll=false`
2. Build the frontend:
   `npm run build`
3. Create the deployment archive using your approved deployment process.
4. Confirm that `backend/.env` is not in the archive.
5. Configure the Elastic Beanstalk environment variables.
6. Upload the archive and invalidate CloudFront if necessary.
