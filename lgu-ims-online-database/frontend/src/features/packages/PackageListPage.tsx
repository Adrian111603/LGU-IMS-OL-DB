import { useEffect, useState } from 'react';
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
      <h1>Package List</h1>
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
      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Direction</th><th>Module</th><th>Status</th><th>Barangay</th><th></th></tr></thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td>{pkg.title}</td>
                <td>{label(pkg.direction)}</td>
                <td>{label(pkg.moduleType)}</td>
                <td><span className={`badge ${pkg.status.toLowerCase()}`}>{label(pkg.status)}</span></td>
                <td>{pkg.sourceBarangay?.name ?? pkg.targetBarangay?.name ?? 'Municipal'}</td>
                <td><button className="ghost" onClick={() => onOpenPackage(pkg.id)}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

