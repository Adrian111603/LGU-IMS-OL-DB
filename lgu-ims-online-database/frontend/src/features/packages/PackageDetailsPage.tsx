import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useAuth } from '../auth/auth-context';
import { editableStatuses, label } from '../../shared/constants';
import { ExchangePackage, PackageStatus } from '../../shared/types';

export function PackageDetailsPage({ packageId }: { packageId: string }) {
  const { api, token, user } = useAuth();
  const [pkg, setPkg] = useState<ExchangePackage | null>(null);
  const [status, setStatus] = useState<PackageStatus>('REVIEWING');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.request<ExchangePackage>(`/packages/${packageId}`).then(setPkg).catch(() => setPkg(null));
  }, [api, packageId]);

  async function updateStatus() {
    await api.request(`/packages/${packageId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, message })
    });
    const refreshed = await api.request<ExchangePackage>(`/packages/${packageId}`);
    setPkg(refreshed);
    setMessage('');
  }

  async function download() {
    const response = await fetch(api.downloadUrl(`/packages/${packageId}/download`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = pkg?.fileAsset?.originalName ?? 'package';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!pkg) return <main className="page"><h1>Package Details</h1></main>;

  return (
    <main className="page">
      <div className="title-row">
        <h1>{pkg.title}</h1>
        <button onClick={download}><Download size={18} /> Download</button>
      </div>
      <div className="detail-grid">
        <div><span>Status</span><strong>{label(pkg.status)}</strong></div>
        <div><span>Module</span><strong>{label(pkg.moduleType)}</strong></div>
        <div><span>Source</span><strong>{pkg.sourceBarangay?.name ?? 'Municipal'}</strong></div>
        <div><span>Target</span><strong>{pkg.targetBarangay?.name ?? 'Municipal'}</strong></div>
        <div><span>File</span><strong>{pkg.fileAsset?.originalName}</strong></div>
        <div><span>Checksum</span><strong className="mono">{pkg.fileAsset?.checksum ?? 'None'}</strong></div>
      </div>
      {user?.role !== 'BARANGAY_USER' && (
        <section className="status-editor">
          <h2>Update Status</h2>
          <select value={status} onChange={(event) => setStatus(event.target.value as PackageStatus)}>
            {editableStatuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}
          </select>
          <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message" />
          <button onClick={updateStatus}>Save Status</button>
        </section>
      )}
      <section>
        <h2>Status History</h2>
        <div className="history">
          {pkg.logs?.map((log) => (
            <div key={log.id}>
              <strong>{label(log.status)}</strong>
              <span>{new Date(log.createdAt).toLocaleString()}</span>
              <p>{log.message ?? 'No message'}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

