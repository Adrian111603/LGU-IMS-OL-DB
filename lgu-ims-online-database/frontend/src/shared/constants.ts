import { ModuleType, PackageStatus } from './types';

export const moduleTypes: ModuleType[] = [
  'RESIDENTS',
  'HOUSEHOLDS',
  'RESIDENTS_HOUSEHOLDS',
  'RPS',
  'ASSISTANCE',
  'FACED',
  'DOCUMENTS',
  'CERTIFICATES',
  'BARANGAY_PROFILE',
  'MUNICIPALITY_PROFILE',
  'INVENTORY',
  'LEGISLATION',
  'REPORTS',
  'FULL_BACKUP',
  'OTHER'
];

export const packageStatuses: PackageStatus[] = [
  'UPLOADED',
  'DOWNLOADED',
  'REVIEWING',
  'IMPORTED',
  'REJECTED',
  'NEEDS_CORRECTION',
  'ARCHIVED'
];

export const editableStatuses: PackageStatus[] = ['REVIEWING', 'IMPORTED', 'REJECTED', 'NEEDS_CORRECTION', 'ARCHIVED'];

export function label(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

