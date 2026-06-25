import { useEffect, useMemo, useState } from 'react';
import { Archive, CheckCircle2, Clock3, FileStack, Inbox, ShieldCheck, UploadCloud } from 'lucide-react';
import { useAuth } from '../auth/auth-context';
import { ExchangePackage } from '../../shared/types';
import { label } from '../../shared/constants';

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
    imported: packages.filter((pkg) => pkg.status === 'IMPORTED').length,
    archived: packages.filter((pkg) => pkg.status === 'ARCHIVED').length
  }), [packages]);

  const latestPackage = packages[0];
  const actionRequired = packages.filter((pkg) => ['REVIEWING', 'NEEDS_CORRECTION', 'REJECTED'].includes(pkg.status)).length;

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Operations overview</span>
          <h1>Dashboard</h1>
          <p>{user?.role === 'BARANGAY_USER' ? 'Track barangay submissions and municipal feedback.' : 'Monitor package movement across barangays and municipal review.'}</p>
        </div>
        {latestPackage && (
          <div className="highlight-panel">
            <span>Latest package</span>
            <strong>{latestPackage.title}</strong>
            <small>{label(latestPackage.status)} | {new Date(latestPackage.createdAt).toLocaleDateString()}</small>
          </div>
        )}
      </section>
      <section className="dashboard-strip">
        <div>
          <ShieldCheck size={22} />
          <span>Signed in as</span>
          <strong>{label(user?.role ?? 'User')}</strong>
        </div>
        <div>
          <Clock3 size={22} />
          <span>Action required</span>
          <strong>{actionRequired}</strong>
        </div>
        <div>
          <Inbox size={22} />
          <span>Current workspace</span>
          <strong>{user?.assignedBarangay?.name ?? 'Municipal'}</strong>
        </div>
      </section>
      <div className="metric-grid">
        <div className="metric"><FileStack size={22} /><span>Total Packages</span><strong>{counts.total}</strong></div>
        <div className="metric"><UploadCloud size={22} /><span>Uploaded</span><strong>{counts.uploaded}</strong></div>
        <div className="metric"><Clock3 size={22} /><span>Reviewing</span><strong>{counts.reviewing}</strong></div>
        <div className="metric"><CheckCircle2 size={22} /><span>Imported</span><strong>{counts.imported}</strong></div>
        <div className="metric"><Archive size={22} /><span>Archived</span><strong>{counts.archived}</strong></div>
      </div>
      <section className="section-block">
        <div className="section-title">
          <div>
            <span className="eyebrow">Recent activity</span>
            <h2>{user?.role === 'BARANGAY_USER' ? 'Barangay Activity' : 'Recent Uploads'}</h2>
          </div>
          <span>{packages.slice(0, 8).length} visible</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Module</th><th>Status</th><th>Barangay</th><th>Date</th></tr></thead>
            <tbody>
              {packages.slice(0, 8).map((pkg) => (
                <tr key={pkg.id}>
                  <td>{pkg.title}</td>
                  <td>{label(pkg.moduleType)}</td>
                  <td><span className={`badge ${pkg.status.toLowerCase()}`}>{label(pkg.status)}</span></td>
                  <td>{pkg.sourceBarangay?.name ?? pkg.targetBarangay?.name ?? 'Municipal'}</td>
                  <td>{new Date(pkg.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {packages.length === 0 && (
            <div className="empty-state">
              <Inbox size={34} />
              <strong>No package activity yet</strong>
              <span>New uploads and review actions will appear here once records are available.</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
