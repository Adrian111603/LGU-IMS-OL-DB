import { useMemo, useState } from 'react';
import { LoginPage } from '../features/auth/LoginPage';
import { AuthProvider, useAuth } from '../features/auth/auth-context';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { BarangayManagementPage } from '../features/barangays/BarangayManagementPage';
import { PackageDetailsPage } from '../features/packages/PackageDetailsPage';
import { PackageListPage } from '../features/packages/PackageListPage';
import { UploadPackagePage } from '../features/packages/UploadPackagePage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { UserManagementPage } from '../features/users/UserManagementPage';
import { Shell } from '../layouts/Shell';
import { AlertProvider } from '../shared/alerts';
import { PageKey } from '../shared/navigation';

function RoutedApp() {
  const { user } = useAuth();
  const [page, setPage] = useState<PageKey>('dashboard');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const content = useMemo(() => {
    if (!user) return <LoginPage />;
    if (page === 'dashboard') return <DashboardPage />;
    if (page === 'upload') return <UploadPackagePage />;
    if (page === 'packages') {
      return <PackageListPage onOpenPackage={(id) => {
        setSelectedPackageId(id);
        setPage('packageDetails');
      }} />;
    }
    if (page === 'packageDetails' && selectedPackageId) {
      return <PackageDetailsPage packageId={selectedPackageId} />;
    }
    if (page === 'barangays') return <BarangayManagementPage />;
    if (page === 'users') return <UserManagementPage />;
    if (page === 'settings') return <SettingsPage />;
    return <DashboardPage />;
  }, [page, selectedPackageId, user]);

  if (!user) return content;
  return <Shell currentPage={page} onNavigate={setPage}>{content}</Shell>;
}

export function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <RoutedApp />
      </AlertProvider>
    </AuthProvider>
  );
}
