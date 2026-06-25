import { FormEvent, useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { useAuth } from '../auth/auth-context';
import { useAlerts } from '../../shared/alerts';
import { Barangay } from '../../shared/types';

export function BarangayManagementPage() {
  const { api } = useAuth();
  const { confirm, toast, alert } = useAlerts();
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [district, setDistrict] = useState('');

  function load() {
    api.request<Barangay[]>('/barangays').then(setBarangays).catch(() => setBarangays([]));
  }

  useEffect(load, [api]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const confirmed = await confirm({
      title: 'Add barangay?',
      text: `${name} will be added as an active barangay.`,
      kind: 'question',
      confirmText: 'Add barangay'
    });
    if (!confirmed) return;

    try {
      await api.request('/barangays', { method: 'POST', body: JSON.stringify({ name, code, district, active: true }) });
      toast('Barangay added', 'success', `${name} is now available for assignments.`);
      setName('');
      setCode('');
      setDistrict('');
      load();
    } catch (err) {
      await alert({
        title: 'Barangay not added',
        text: err instanceof Error ? err.message : 'Please review the barangay details.',
        kind: 'error'
      });
    }
  }

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Local directory</span>
          <h1>Barangay Management</h1>
          <p>Maintain the barangay list used by package routing and user assignment.</p>
        </div>
      </section>
      <form className="form-card inline-form" onSubmit={submit}>
        <input placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} required />
        <input placeholder="Code" value={code} onChange={(event) => setCode(event.target.value)} />
        <input placeholder="District/Area" value={district} onChange={(event) => setDistrict(event.target.value)} />
        <button className="button" type="submit"><Building2 size={17} /> Add Barangay</button>
      </form>
      <div className="table-wrap elevated">
        <table>
          <thead><tr><th>Name</th><th>Code</th><th>District</th><th>Status</th></tr></thead>
          <tbody>{barangays.map((barangay) => (
            <tr key={barangay.id}><td>{barangay.name}</td><td>{barangay.code}</td><td>{barangay.district}</td><td>{barangay.active ? 'Active' : 'Inactive'}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </main>
  );
}
