# Deployment Notes

## 1. Create Supabase Project

1. Create a Supabase project.
2. Open Project Settings > Database.
3. Copy the pooled PostgreSQL connection string.
4. Use it as `DATABASE_URL`.

## 2. Deploy NestJS API to Render

Create a Render Web Service from the `backend` folder.

Recommended settings:

- Root Directory: `lgu-ims-online-database/backend`
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `npx prisma migrate deploy && npm run start:prod`
- Environment: Node

Set environment variables:

```text
DATABASE_URL=your_supabase_postgres_url
JWT_SECRET=long_random_secret
JWT_EXPIRES_IN=1d
PORT=3000
CORS_ORIGIN=https://your-vercel-app.vercel.app
UPLOAD_DIR=/opt/render/project/src/uploads
MAX_UPLOAD_MB=50
```

Run seed once from Render shell or locally against Supabase:

```bash
npm run seed
```

Default seeded accounts use password `ChangeMe123!`. Change these after first login.

## 3. Deploy React/Vite Frontend to Vercel

Create a Vercel project from the `frontend` folder.

Recommended settings:

- Root Directory: `lgu-ims-online-database/frontend`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Set environment variables:

```text
VITE_API_URL=https://your-render-api.onrender.com
```

## 4. CORS

Set backend `CORS_ORIGIN` to the Vercel frontend URL. For multiple origins, separate values with commas.

## 5. Storage Migration Note

Development stores files on backend local disk through `StorageService`. To move to Supabase Storage later, add a `SupabaseStorageService` implementing the same interface and change the provider in `StorageModule`.
