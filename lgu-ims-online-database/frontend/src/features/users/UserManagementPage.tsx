import { FormEvent, useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../auth/auth-context';
import { useAlerts } from '../../shared/alerts';
import { Barangay, Role, User } from '../../shared/types';

export function UserManagementPage() {
  const { api } = useAuth();
  const { confirm, toast, alert } = useAlerts();
  const [users, setUsers] = useState<User[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('BARANGAY_USER');
  const [assignedBarangayId, setAssignedBarangayId] = useState('');

  function load() {
    api.request<User[]>('/users').then(setUsers).catch(() => setUsers([]));
    api.request<Barangay[]>('/barangays').then(setBarangays).catch(() => setBarangays([]));
  }

  useEffect(load, [api]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const confirmed = await confirm({
      title: 'Create user account?',
      text: `${fullName} will be added with ${role.replace(/_/g, ' ')} access.`,
      kind: 'question',
      confirmText: 'Create user'
    });
    if (!confirmed) return;

    try {
      await api.request('/users', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, role, assignedBarangayId: role === 'BARANGAY_USER' ? assignedBarangayId : undefined })
      });
      setFullName('');
      setEmail('');
      setPassword('');
      toast('User created', 'success', `${fullName} can now access the system.`);
      load();
    } catch (err) {
      await alert({
        title: 'User not created',
        text: err instanceof Error ? err.message : 'Please review the account details.',
        kind: 'error'
      });
    }
  }

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Access control</span>
          <h1>User Management</h1>
          <p>Create and monitor accounts for municipal and barangay users.</p>
        </div>
      </section>
      <form className="form-card inline-form" onSubmit={submit}>
        <input placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
        <input placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        <input placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
          <option value="MUNICIPAL_ADMIN">Municipal Admin</option>
          <option value="BARANGAY_USER">Barangay User</option>
        </select>
        {role === 'BARANGAY_USER' && (
          <select value={assignedBarangayId} onChange={(event) => setAssignedBarangayId(event.target.value)} required>
            <option value="">Assign barangay</option>
            {barangays.map((barangay) => <option key={barangay.id} value={barangay.id}>{barangay.name}</option>)}
          </select>
        )}
        <button className="button" type="submit"><UserPlus size={17} /> Create User</button>
      </form>
      <div className="table-wrap elevated">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Barangay</th><th>Status</th></tr></thead>
          <tbody>{users.map((item) => (
            <tr key={item.id}><td>{item.fullName}</td><td>{item.email}</td><td>{item.role}</td><td>{item.assignedBarangay?.name ?? '-'}</td><td>{item.status}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </main>
  );
}
