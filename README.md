# Disc Golf South Africa

Disc Golf South Africa is a full-stack web application for managing disc golf
events, memberships, registrations, payments, and user accounts.

The application is split into:

- **Frontend:** React with React Bootstrap
- **Backend:** Node.js, Express, MongoDB, and JWT authentication
- **Production hosting:** AWS Elastic Beanstalk behind CloudFront

## Project structure

```text
.
├── backend/
│   ├── src/
│   ├── uploads/
│   ├── package.json
│   └── .env                 # Local secrets; never commit this file
├── frontend/
│   ├── public/
│   ├── src/
│   ├── build/               # Generated production frontend
│   └── package.json
├── .platform/
│   └── nginx/conf.d/
│       └── upload.conf      # Upload size configuration for Elastic Beanstalk
├── package.json
└── scripts/
    └── package-deploy.ps1   # Creates a POSIX-compatible deployment ZIP
```

## Requirements

- Node.js 22.x
- npm
- MongoDB or a MongoDB Atlas cluster

## Local setup

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install --ignore-scripts
```

Create `backend/.env` with values for your local environment:

```env
PORT=8080
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/disc_golf
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=https://dqg3uf1qf7jek.cloudfront.net
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
```

The following variables are required by the backend:

| Variable | Purpose |
| --- | --- |
| `PORT` | Port used by the Node.js server |
| `NODE_ENV` | Runtime environment, such as `development` or `production` |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `CLIENT_URL` | Allowed frontend origin for CORS |
| `ADMIN_EMAIL` | Email for the initial administrator account |
| `ADMIN_PASSWORD` | Password for the initial administrator account |

Never place real credentials in this README, source control, or a deployment
archive.

## Run locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm start
```

The frontend runs at `http://localhost:3000` and the backend runs at the port
specified by `PORT` (normally `http://localhost:8080`).

## Useful commands

### Backend

```bash
cd backend
npm start       # Start the API
npm run dev     # Start with Node's watch mode
npm run seed    # Seed local data when applicable
```

### Frontend

```bash
cd frontend
npm test -- --watchAll=false
npm run build
```

## Production build

Build the React application directly from the frontend directory:

```bash
cd frontend
npm install --include=dev --ignore-scripts
npm run build
```

The production files are generated in `frontend/build`.

## Elastic Beanstalk deployment

The deployment archive must contain the following at its root:

```text
package.json
package-lock.json
backend/
.platform/
frontend/build/
```

The archive must not include:

- `backend/.env`
- `backend/node_modules`
- Windows-style backslash paths

After building the frontend, create a deployment archive with:

```powershell
npm run package:deploy
```

This runs `scripts/package-deploy.ps1` and creates `deploy.zip` in the project
root. The script writes ZIP entries with POSIX `/` separators and validates the
archive before completing.

Upload `deploy.zip` to Elastic Beanstalk. The root `package.json` starts the
production server with:

```text
node backend/src/server.js
```

Keep the Node.js process on the Elastic Beanstalk internal port, normally
`8080`. HTTPS should be terminated by the load balancer or CloudFront rather
than by changing the Node.js port to `443`.

## CloudFront

Use the CloudFront HTTPS URL as the public website address. Configure the
Elastic Beanstalk environment's `CLIENT_URL` to the same public HTTPS origin,
for example:

```env
CLIENT_URL=https://dqg3uf1qf7jek.cloudfront.net
```

For authenticated API requests, the CloudFront API behavior should forward:

- Cookies
- The `Origin` request header
- Credentialed CORS responses

After deploying a new frontend build, invalidate the CloudFront cache if old
CSS or JavaScript is still being served:

```text
/*
```

## Security notes

- Do not commit `backend/.env`.
- Use strong, unique production values for `JWT_SECRET` and admin credentials.
- Store production secrets in Elastic Beanstalk environment properties or a
  secrets manager.
- Do not upload local `node_modules` directories.
- Use HTTPS for the public CloudFront URL.

## Testing checklist

Before deploying:

1. Run the frontend test suite.
2. Build the frontend successfully.
3. Run `npm run package:deploy`.
4. Confirm `deploy.zip` contains no backslash paths.
5. Confirm `backend/.env` is absent from the archive.
6. Deploy the archive to Elastic Beanstalk.
7. Invalidate CloudFront if the new assets are cached.
