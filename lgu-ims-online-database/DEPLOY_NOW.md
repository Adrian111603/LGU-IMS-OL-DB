# Deploy LGU IMS Online Database

No local checking is required for these steps.

## 1. Push Project to GitHub

Commit and push the `lgu-ims-online-database` folder to a GitHub repository.

## 2. Supabase

1. Create a Supabase project.
2. Copy the PostgreSQL connection string.
3. Use the connection string as `DATABASE_URL` in Render.

Use the pooled connection string when possible.

## 3. Render Backend

Create a new Render Web Service.

Settings:

```text
Root Directory: lgu-ims-online-database/backend
Build Command: npm install && npx prisma generate && npm run build
Start Command: npx prisma migrate deploy && npm run start:prod
```

Environment variables:

```text
DATABASE_URL=your_supabase_postgres_url
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=https://your-vercel-app.vercel.app
UPLOAD_DIR=/opt/render/project/src/uploads
MAX_UPLOAD_MB=50
```

After the first successful backend deploy, run this once in Render Shell:

```bash
npm run seed
```

## 4. Vercel Frontend

Create a new Vercel project.

Settings:

```text
Root Directory: lgu-ims-online-database/frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Environment variable:

```text
VITE_API_URL=https://your-render-service.onrender.com
```

## 5. Update CORS

After Vercel gives you the final frontend URL, go back to Render and set:

```text
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

Redeploy the Render backend after changing this value.

## 6. Login

Seeded accounts use:

```text
Password: ChangeMe123!
```

Accounts:

```text
superadmin@lguims.local
municipal@lguims.local
barangay@lguims.local
```

Change seeded passwords after first login.

## Important Storage Note

Render local disk is acceptable for development and trial deployment only. For production, move file storage to Supabase Storage by replacing the backend `StorageService` provider.

