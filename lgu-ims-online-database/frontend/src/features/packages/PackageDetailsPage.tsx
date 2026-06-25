import { useEffect, useState } from 'react';
import { Download, History, Save } from 'lucide-react';
import { useAuth } from '../auth/auth-context';
import { editableStatuses, label } from '../../shared/constants';
import { useAlerts } from '../../shared/alerts';
import { ExchangePackage, PackageStatus } from '../../shared/types';

export function PackageDetailsPage({ packageId }: { packageId: string }) {
  const { api, token, user } = useAuth();
  const { confirm, toast, alert } = useAlerts();
  const [pkg, setPkg] = useState<ExchangePackage | null>(null);
  const [status, setStatus] = useState<PackageStatus>('REVIEWING');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.request<ExchangePackage>(`/packages/${packageId}`).then(setPkg).catch(() => setPkg(null));
  }, [api, packageId]);

  async function updateStatus() {
    const confirmed = await confirm({
      title: 'Update package status?',
      text: `This package will be marked as ${label(status)}.`,
      kind: 'warning',
      confirmText: 'Save status'
    });
    if (!confirmed) return;

    try {
      await api.request(`/packages/${packageId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, message })
      });
      const refreshed = await api.request<ExchangePackage>(`/packages/${packageId}`);
      setPkg(refreshed);
      setMessage('');
      toast('Status updated', 'success', `Package marked as ${label(status)}.`);
    } catch (err) {
      await alert({
        title: 'Status not saved',
        text: err instanceof Error ? err.message : 'Please try again.',
        kind: 'error'
      });
    }
  }

  async function download() {
    const confirmed = await confirm({
      title: 'Download package file?',
      text: pkg?.fileAsset?.originalName ?? 'The package file will be downloaded to this device.',
      kind: 'question',
      confirmText: 'Download'
    });
    if (!confirmed) return;

    try {
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
      toast('Download started', 'success', pkg?.fileAsset?.originalName);
    } catch (err) {
      await alert({
        title: 'Download failed',
        text: err instanceof Error ? err.message : 'Please try again.',
        kind: 'error'
      });
    }
  }

  if (!pkg) return <main className="page"><section className="page-heading"><div><h1>Package Details</h1><p>Loading package information.</p></div></section></main>;

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Package details</span>
          <h1>{pkg.title}</h1>
          <p>{pkg.notes || 'Review the package metadata, file checksum, and status history.'}</p>
        </div>
        <button className="button" onClick={download}><Download size={18} /> Download</button>
      </section>
      <div className="detail-grid">
        <div><span>Status</span><strong>{label(pkg.status)}</strong></div>
        <div><span>Module</span><strong>{label(pkg.moduleType)}</strong></div>
        <div><span>Source</span><strong>{pkg.sourceBarangay?.name ?? 'Municipal'}</strong></div>
        <div><span>Target</span><strong>{pkg.targetBarangay?.name ?? 'Municipal'}</strong></div>
        <div><span>File</span><strong>{pkg.fileAsset?.originalName}</strong></div>
        <div><span>Checksum</span><strong className="mono">{pkg.fileAsset?.checksum ?? 'None'}</strong></div>
      </div>
      {user?.role !== 'BARANGAY_USER' && (
        <section className="form-card status-editor">
          <div>
            <span className="eyebrow">Review action</span>
            <h2>Update Status</h2>
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value as PackageStatus)}>
            {editableStatuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}
          </select>
          <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message" />
          <button className="button" onClick={updateStatus}><Save size={17} /> Save Status</button>
        </section>
      )}
      <section className="section-block">
        <div className="section-title">
          <div>
            <span className="eyebrow">Audit trail</span>
            <h2>Status History</h2>
          </div>
          <History size={20} />
        </div>
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
