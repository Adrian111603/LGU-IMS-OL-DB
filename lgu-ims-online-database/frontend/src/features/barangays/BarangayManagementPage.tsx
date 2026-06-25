import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../auth/auth-context';
import { Barangay } from '../../shared/types';

export function BarangayManagementPage() {
  const { api } = useAuth();
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
    await api.request('/barangays', { method: 'POST', body: JSON.stringify({ name, code, district, active: true }) });
    setName('');
    setCode('');
    setDistrict('');
    load();
  }

  return (
    <main className="page">
      <h1>Barangay Management</h1>
      <form className="inline-form" onSubmit={submit}>
        <input placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} required />
        <input placeholder="Code" value={code} onChange={(event) => setCode(event.target.value)} />
        <input placeholder="District/Area" value={district} onChange={(event) => setDistrict(event.target.value)} />
        <button type="submit">Add Barangay</button>
      </form>
      <div className="table-wrap">
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

