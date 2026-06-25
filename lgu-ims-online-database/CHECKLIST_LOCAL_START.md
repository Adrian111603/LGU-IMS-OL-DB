# Local Start Checklist

Use these before deploying online.

## One-Time Setup

1. Run `setup-local.cmd`.
2. Open `backend\.env`.
3. Set `DATABASE_URL` to your local PostgreSQL or Supabase PostgreSQL URL.
4. Run `setup-database.cmd`.
5. Run `start-local.cmd`.

## Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

## Seed Accounts

All seeded accounts use password:

```text
ChangeMe123!
```

Accounts:

```text
superadmin@lguims.local
municipal@lguims.local
barangay@lguims.local
```

## Notes

- The starter does not deploy anything online.
- Files uploaded during local testing are stored by the backend using `UPLOAD_DIR`.
- Local systems remain the source of truth; this portal stores package files and metadata only.

