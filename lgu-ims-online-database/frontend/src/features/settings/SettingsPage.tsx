import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../auth/auth-context';

export function SettingsPage() {
  const { api } = useAuth();
  const [systemName, setSystemName] = useState('LGU IMS Online Database');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.request<Record<string, string>>('/settings').then((settings) => {
      if (settings.systemName) setSystemName(settings.systemName);
    }).catch(() => undefined);
  }, [api]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await api.request('/settings', { method: 'PATCH', body: JSON.stringify({ systemName }) });
    setMessage('Settings saved');
  }

  return (
    <main className="page narrow">
      <h1>Settings</h1>
      <form className="form-grid" onSubmit={submit}>
        <label>System name<input value={systemName} onChange={(event) => setSystemName(event.target.value)} /></label>
        {message && <div className="success">{message}</div>}
        <button type="submit">Save Settings</button>
      </form>
    </main>
  );
}

