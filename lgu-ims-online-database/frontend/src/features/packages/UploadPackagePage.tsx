import { FormEvent, useEffect, useState } from 'react';
import { FileUp } from 'lucide-react';
import { useAuth } from '../auth/auth-context';
import { label, moduleTypes } from '../../shared/constants';
import { useAlerts } from '../../shared/alerts';
import { Barangay, ModuleType } from '../../shared/types';

export function UploadPackagePage() {
  const { api, user } = useAuth();
  const { confirm, toast, alert } = useAlerts();
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [title, setTitle] = useState('');
  const [moduleType, setModuleType] = useState<ModuleType>('RESIDENTS');
  const [direction, setDirection] = useState('MUNICIPAL_TO_BARANGAY');
  const [targetBarangayId, setTargetBarangayId] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.role !== 'BARANGAY_USER') api.request<Barangay[]>('/barangays').then(setBarangays).catch(() => setBarangays([]));
  }, [api, user?.role]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    const confirmed = await confirm({
      title: 'Upload this package?',
      text: `${title || 'Selected package'} will be submitted for exchange and review.`,
      kind: 'question',
      confirmText: 'Upload package'
    });
    if (!confirmed) return;

    const form = new FormData();
    form.set('title', title);
    form.set('moduleType', moduleType);
    form.set('notes', notes);
    form.set('file', file);
    if (user?.role !== 'BARANGAY_USER') {
      form.set('direction', direction);
      if (targetBarangayId) form.set('targetBarangayId', targetBarangayId);
    }
    try {
      await api.request('/packages/upload', { method: 'POST', body: form });
      setMessage('Package uploaded successfully');
      toast('Package uploaded', 'success', 'The file is now available in the package list.');
      setTitle('');
      setNotes('');
      setFile(null);
      setFileInputKey((current) => current + 1);
    } catch (err) {
      await alert({
        title: 'Upload failed',
        text: err instanceof Error ? err.message : 'Please check the package details and try again.',
        kind: 'error'
      });
    }
  }

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">New exchange</span>
          <h1>Upload Package</h1>
          <p>Prepare a clean upload with the right module, destination, notes, and source file.</p>
        </div>
      </section>
      <form className="form-card upload-grid" onSubmit={submit}>
        <div className="form-main">
          <label>Package title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
          <label>Module type<select value={moduleType} onChange={(event) => setModuleType(event.target.value as ModuleType)}>
            {moduleTypes.map((item) => <option key={item} value={item}>{label(item)}</option>)}
          </select></label>
        {user?.role !== 'BARANGAY_USER' && (
          <>
            <label>Direction<select value={direction} onChange={(event) => setDirection(event.target.value)}>
              <option value="MUNICIPAL_TO_BARANGAY">Municipal to Barangay</option>
              {user?.role === 'SUPER_ADMIN' && <option value="BARANGAY_TO_MUNICIPAL">Barangay to Municipal</option>}
            </select></label>
            <label>Target barangay<select value={targetBarangayId} onChange={(event) => setTargetBarangayId(event.target.value)} required={direction === 'MUNICIPAL_TO_BARANGAY'}>
              <option value="">Select barangay</option>
              {barangays.map((barangay) => <option key={barangay.id} value={barangay.id}>{barangay.name}</option>)}
            </select></label>
          </>
        )}
          <label>Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} /></label>
        </div>
        <aside className="upload-panel">
          <FileUp size={34} />
          <label>File<input key={fileInputKey} type="file" accept=".json,.csv,.xls,.xlsx,.zip,.pdf,.doc,.docx" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required /></label>
          <span>{file ? file.name : 'Accepted: JSON, CSV, Excel, ZIP, PDF, DOC'}</span>
          {message && <div className="success">{message}</div>}
          <button className="button full" type="submit">Upload Package</button>
        </aside>
      </form>
    </main>
  );
}
