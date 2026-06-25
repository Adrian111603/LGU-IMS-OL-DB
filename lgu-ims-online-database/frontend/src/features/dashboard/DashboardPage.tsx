import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/auth-context';
import { ExchangePackage } from '../../shared/types';

export function DashboardPage() {
  const { api, user } = useAuth();
  const [packages, setPackages] = useState<ExchangePackage[]>([]);

  useEffect(() => {
    api.request<ExchangePackage[]>('/packages').then(setPackages).catch(() => setPackages([]));
  }, [api]);

  const counts = useMemo(() => ({
    total: packages.length,
    uploaded: packages.filter((pkg) => pkg.status === 'UPLOADED').length,
    reviewing: packages.filter((pkg) => pkg.status === 'REVIEWING').length,
    imported: packages.filter((pkg) => pkg.status === 'IMPORTED').length
  }), [packages]);

  return (
    <main className="page">
      <h1>Dashboard</h1>
      <div className="metric-grid">
        <div className="metric"><span>Total Packages</span><strong>{counts.total}</strong></div>
        <div className="metric"><span>Uploaded</span><strong>{counts.uploaded}</strong></div>
        <div className="metric"><span>Reviewing</span><strong>{counts.reviewing}</strong></div>
        <div className="metric"><span>Imported</span><strong>{counts.imported}</strong></div>
      </div>
      <section>
        <h2>{user?.role === 'BARANGAY_USER' ? 'Recent Barangay Activity' : 'Recent Uploads'}</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Module</th><th>Status</th><th>Barangay</th><th>Date</th></tr></thead>
            <tbody>
              {packages.slice(0, 8).map((pkg) => (
                <tr key={pkg.id}>
                  <td>{pkg.title}</td>
                  <td>{pkg.moduleType}</td>
                  <td><span className={`badge ${pkg.status.toLowerCase()}`}>{pkg.status}</span></td>
                  <td>{pkg.sourceBarangay?.name ?? pkg.targetBarangay?.name ?? 'Municipal'}</td>
                  <td>{new Date(pkg.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

