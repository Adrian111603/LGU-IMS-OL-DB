import { FormEvent, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '../auth/auth-context';
import { useAlerts } from '../../shared/alerts';

export function SettingsPage() {
  const { api } = useAuth();
  const { confirm, toast, alert } = useAlerts();
  const [systemName, setSystemName] = useState('LGU IMS Online Database');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.request<Record<string, string>>('/settings').then((settings) => {
      if (settings.systemName) setSystemName(settings.systemName);
    }).catch(() => undefined);
  }, [api]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const confirmed = await confirm({
      title: 'Save settings?',
      text: 'The system name will be updated for this workspace.',
      kind: 'warning',
      confirmText: 'Save settings'
    });
    if (!confirmed) return;

    try {
      await api.request('/settings', { method: 'PATCH', body: JSON.stringify({ systemName }) });
      setMessage('Settings saved successfully');
      toast('Settings saved', 'success');
    } catch (err) {
      await alert({
        title: 'Settings not saved',
        text: err instanceof Error ? err.message : 'Please try again.',
        kind: 'error'
      });
    }
  }

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Configuration</span>
          <h1>Settings</h1>
          <p>Keep the workspace identity clear for administrators and barangay users.</p>
        </div>
      </section>
      <form className="form-card narrow" onSubmit={submit}>
        <label>System name<input value={systemName} onChange={(event) => setSystemName(event.target.value)} /></label>
        {message && <div className="success">{message}</div>}
        <button className="button" type="submit"><Save size={17} /> Save Settings</button>
      </form>
    </main>
  );
}
