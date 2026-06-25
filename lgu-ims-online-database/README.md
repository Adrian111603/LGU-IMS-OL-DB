# LGU IMS Online Database

Standalone online file exchange portal for LGU IMS export/import packages.

This system is intentionally separate from the local LGU IMS. It does not sync local databases and does not store residents or households as live online records. Local barangay and municipal IMS installations remain the source of truth.

## Purpose

Barangay local IMS exports a file package, then the barangay uploads it here. Municipal users download the package and import it into their own local IMS.

Municipal users can also export packages locally, upload them here, and target one or more barangays for download and local import.

## Stack

- Frontend: React + Vite
- Backend: NestJS API
- Database: Supabase PostgreSQL via Prisma
- File storage: local backend disk for development, behind a storage service for later Supabase Storage migration

## Project Layout

```text
lgu-ims-online-database/
  backend/
    prisma/
    src/
      auth/
      barangays/
        dto/
      packages/
        dto/
      prisma/
      settings/
      storage/
      users/
        dto/
  frontend/
    src/
      app/
      features/
        auth/
        barangays/
        dashboard/
        packages/
        settings/
        users/
      layouts/
      lib/
      shared/
  docs/
```

The backend is organized by NestJS feature modules. The frontend is organized by feature pages, shared types/constants, app shell, and API utilities.

## Quick Start

For local testing on Windows:

```text
setup-local.cmd
setup-database.cmd
start-local.cmd
```

See [CHECKLIST_LOCAL_START.md](CHECKLIST_LOCAL_START.md) for the local trial checklist.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Supabase, Render, and Vercel deployment notes.

For a direct deployment checklist, see [DEPLOY_NOW.md](DEPLOY_NOW.md).
