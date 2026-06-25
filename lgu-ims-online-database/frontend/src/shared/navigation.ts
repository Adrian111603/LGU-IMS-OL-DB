import { Building2, Gauge, Settings, Upload, Users, FileStack } from 'lucide-react';
import { Role } from './types';

export type PageKey = 'dashboard' | 'upload' | 'packages' | 'packageDetails' | 'barangays' | 'users' | 'settings';

export const navItems: Array<{ key: PageKey; label: string; icon: typeof Gauge; roles: Role[] }> = [
  { key: 'dashboard', label: 'Dashboard', icon: Gauge, roles: ['SUPER_ADMIN', 'MUNICIPAL_ADMIN', 'BARANGAY_USER'] },
  { key: 'upload', label: 'Upload Package', icon: Upload, roles: ['SUPER_ADMIN', 'MUNICIPAL_ADMIN', 'BARANGAY_USER'] },
  { key: 'packages', label: 'Packages', icon: FileStack, roles: ['SUPER_ADMIN', 'MUNICIPAL_ADMIN', 'BARANGAY_USER'] },
  { key: 'barangays', label: 'Barangays', icon: Building2, roles: ['SUPER_ADMIN'] },
  { key: 'users', label: 'Users', icon: Users, roles: ['SUPER_ADMIN'] },
  { key: 'settings', label: 'Settings', icon: Settings, roles: ['SUPER_ADMIN'] }
];
