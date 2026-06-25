import { useEffect, useState } from 'react';
import { Filter, FolderOpen } from 'lucide-react';
import { useAuth } from '../auth/auth-context';
import { label, moduleTypes, packageStatuses } from '../../shared/constants';
import { Barangay, ExchangePackage, ModuleType, PackageStatus } from '../../shared/types';

export function PackageListPage({ onOpenPackage }: { onOpenPackage: (id: string) => void }) {
  const { api, user } = useAuth();
  const [packages, setPackages] = useState<ExchangePackage[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [moduleType, setModuleType] = useState('');
  const [status, setStatus] = useState('');
  const [barangayId, setBarangayId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (moduleType) params.set('moduleType', moduleType);
    if (status) params.set('status', status);
    if (barangayId) params.set('barangayId', barangayId);
    api.request<ExchangePackage[]>(`/packages?${params}`).then(setPackages).catch(() => setPackages([]));
  }, [api, barangayId, moduleType, status]);

  useEffect(() => {
    if (user?.role !== 'BARANGAY_USER') api.request<Barangay[]>('/barangays').then(setBarangays).catch(() => setBarangays([]));
  }, [api, user?.role]);

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Package registry</span>
          <h1>Package List</h1>
          <p>Filter, review, and open exchange records from one organized workspace.</p>
        </div>
        <div className="highlight-panel">
          <span>Visible packages</span>
          <strong>{packages.length}</strong>
          <small>Matching current filters</small>
        </div>
      </section>
      <section className="filter-panel">
        <div className="filter-title"><Filter size={18} /><strong>Filters</strong></div>
        <div className="filters">
          <select value={moduleType} onChange={(event) => setModuleType(event.target.value as ModuleType | '')}>
            <option value="">All modules</option>
            {moduleTypes.map((item) => <option key={item} value={item}>{label(item)}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value as PackageStatus | '')}>
            <option value="">All statuses</option>
            {packageStatuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}
          </select>
          {user?.role !== 'BARANGAY_USER' && (
            <select value={barangayId} onChange={(event) => setBarangayId(event.target.value)}>
              <option value="">All barangays</option>
              {barangays.map((barangay) => <option key={barangay.id} value={barangay.id}>{barangay.name}</option>)}
            </select>
          )}
        </div>
      </section>
      <div className="table-wrap elevated">
        <table>
          <thead><tr><th>Title</th><th>Direction</th><th>Module</th><th>Status</th><th>Barangay</th><th>Action</th></tr></thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td>{pkg.title}</td>
                <td>{label(pkg.direction)}</td>
                <td>{label(pkg.moduleType)}</td>
                <td><span className={`badge ${pkg.status.toLowerCase()}`}>{label(pkg.status)}</span></td>
                <td>{pkg.sourceBarangay?.name ?? pkg.targetBarangay?.name ?? 'Municipal'}</td>
                <td><button className="button ghost compact" onClick={() => onOpenPackage(pkg.id)}><FolderOpen size={16} /> Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
