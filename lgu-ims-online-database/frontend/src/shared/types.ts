export type Role = 'SUPER_ADMIN' | 'MUNICIPAL_ADMIN' | 'BARANGAY_USER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type PackageDirection = 'BARANGAY_TO_MUNICIPAL' | 'MUNICIPAL_TO_BARANGAY';
export type PackageStatus = 'UPLOADED' | 'DOWNLOADED' | 'REVIEWING' | 'IMPORTED' | 'REJECTED' | 'NEEDS_CORRECTION' | 'ARCHIVED';
export type ModuleType =
  | 'RESIDENTS'
  | 'HOUSEHOLDS'
  | 'RESIDENTS_HOUSEHOLDS'
  | 'RPS'
  | 'ASSISTANCE'
  | 'FACED'
  | 'DOCUMENTS'
  | 'CERTIFICATES'
  | 'BARANGAY_PROFILE'
  | 'MUNICIPALITY_PROFILE'
  | 'INVENTORY'
  | 'LEGISLATION'
  | 'REPORTS'
  | 'FULL_BACKUP'
  | 'OTHER';

export type Barangay = {
  id: string;
  name: string;
  code?: string | null;
  district?: string | null;
  active: boolean;
};

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  assignedBarangayId?: string | null;
  status?: UserStatus;
  assignedBarangay?: Barangay | null;
};

export type FileAsset = {
  id: string;
  originalName: string;
  extension: string;
  sizeBytes: string | number;
  checksum?: string | null;
};

export type ExchangePackage = {
  id: string;
  direction: PackageDirection;
  moduleType: ModuleType;
  title: string;
  status: PackageStatus;
  notes?: string | null;
  sourceBarangay?: Barangay | null;
  targetBarangay?: Barangay | null;
  fileAsset?: FileAsset;
  createdAt: string;
  downloadedAt?: string | null;
  importedAt?: string | null;
  reviewedAt?: string | null;
  logs?: PackageLog[];
};

export type PackageLog = {
  id: string;
  status: PackageStatus;
  message?: string | null;
  createdAt: string;
  createdBy?: User;
};

