import { PackageStatus } from '@prisma/client';

export const allowedPackageExtensions = new Set(['.json', '.csv', '.xls', '.xlsx', '.zip', '.pdf', '.doc', '.docx']);

export const editablePackageStatuses = new Set<PackageStatus>([
  'REVIEWING',
  'IMPORTED',
  'REJECTED',
  'NEEDS_CORRECTION',
  'ARCHIVED'
]);

