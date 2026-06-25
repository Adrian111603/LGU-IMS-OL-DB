import { FormEvent, useEffect, useState } from 'react';
import { Eye, Pencil, Search, Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '../auth/auth-context';
import { useAlerts } from '../../shared/alerts';
import { Barangay, Role, User, UserStatus } from '../../shared/types';

const PAGE_SIZE = 8;

function label(value?: string | null) {
  if (!value) return '-';
  return value.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function formatDate(value?: string) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleDateString();
}

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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);

  function load() {
    api.request<User[]>('/users').then(setUsers).catch(() => setUsers([]));
    api.request<Barangay[]>('/barangays').then(setBarangays).catch(() => setBarangays([]));
  }

  useEffect(load, [api]);
  useEffect(() => setPage(1), [search, roleFilter, statusFilter]);

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [user.fullName, user.email, user.assignedBarangay?.name, user.role, user.status]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query));
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const visibleUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetForm() {
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('BARANGAY_USER');
    setAssignedBarangayId('');
    setEditingUser(null);
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function editUser(user: User) {
    setEditingUser(user);
    setShowForm(true);
    setFullName(user.fullName);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setAssignedBarangayId(user.assignedBarangayId ?? '');
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const confirmed = await confirm({
      title: editingUser ? 'Update user account?' : 'Create user account?',
      text: `${fullName} will ${editingUser ? 'be updated with' : 'be added with'} ${label(role)} access.`,
      kind: 'question',
      confirmText: editingUser ? 'Save user' : 'Create user'
    });
    if (!confirmed) return;

    try {
      const body = editingUser
        ? { fullName, password: password || undefined, role, assignedBarangayId: role === 'BARANGAY_USER' ? assignedBarangayId : undefined }
        : { fullName, email, password, role, assignedBarangayId: role === 'BARANGAY_USER' ? assignedBarangayId : undefined };

      await api.request(editingUser ? `/users/${editingUser.id}` : '/users', {
        method: editingUser ? 'PATCH' : 'POST',
        body: JSON.stringify(body)
      });
      toast(editingUser ? 'User updated' : 'User created', 'success', `${fullName} ${editingUser ? 'has been updated.' : 'can now access the system.'}`);
      resetForm();
      setShowForm(false);
      load();
    } catch (err) {
      await alert({
        title: editingUser ? 'User not updated' : 'User not created',
        text: err instanceof Error ? err.message : 'Please review the account details.',
        kind: 'error'
      });
    }
  }

  async function viewUser(user: User) {
    await alert({
      title: user.fullName,
      text: `${user.email}\nRole: ${label(user.role)}\nStatus: ${label(user.status ?? 'ACTIVE')}\nBarangay: ${user.assignedBarangay?.name ?? 'Not assigned'}`,
      kind: 'info'
    });
  }

  async function disableUser(user: User) {
    const confirmed = await confirm({
      title: 'Disable user account?',
      text: `${user.fullName} will no longer appear in the active user list.`,
      kind: 'warning',
      confirmText: 'Disable user'
    });
    if (!confirmed) return;

    try {
      await api.request(`/users/${user.id}`, { method: 'DELETE' });
      toast('User disabled', 'success', `${user.fullName} has been disabled.`);
      load();
    } catch (err) {
      await alert({
        title: 'User not disabled',
        text: err instanceof Error ? err.message : 'Please try again.',
        kind: 'error'
      });
    }
  }

  return (
    <main className="page user-management-page">
      <section className="page-heading user-page-heading">
        <div>
          <h1>User Management</h1>
          <p>Manage user accounts, roles, permissions, and access status.</p>
        </div>
        <button className="button" type="button" onClick={openCreateForm}><UserPlus size={17} /> Add User</button>
      </section>
      <section className="user-panel">
        {showForm && (
          <form className="user-editor" onSubmit={submit}>
            <input placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            <input placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required disabled={Boolean(editingUser)} />
            <input placeholder={editingUser ? 'New password (optional)' : 'Password'} value={password} onChange={(event) => setPassword(event.target.value)} type="password" required={!editingUser} />
            <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="MUNICIPAL_ADMIN">Municipal Admin</option>
              <option value="BARANGAY_USER">Barangay User</option>
            </select>
            {role === 'BARANGAY_USER' && (
              <select value={assignedBarangayId} onChange={(event) => setAssignedBarangayId(event.target.value)} required>
                <option value="">Assign barangay</option>
                {barangays.map((barangay) => <option key={barangay.id} value={barangay.id}>{barangay.name}</option>)}
              </select>
            )}
            <div className="user-editor-actions">
              <button className="button" type="submit"><UserPlus size={17} /> {editingUser ? 'Save User' : 'Create User'}</button>
              <button className="button ghost" type="button" onClick={() => { resetForm(); setShowForm(false); }}>Cancel</button>
            </div>
          </form>
        )}
        <div className="user-toolbar">
          <label className="search-control">
            <Search size={17} />
            <input placeholder="Search users..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <div className="user-filters">
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as Role | '')}>
              <option value="">All roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="MUNICIPAL_ADMIN">Municipal Admin</option>
              <option value="BARANGAY_USER">Barangay User</option>
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as UserStatus | '')}>
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Disabled</option>
            </select>
          </div>
        </div>
        <div className="user-table-scroll">
          <table className="user-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Active</th><th>Actions</th></tr></thead>
            <tbody>{visibleUsers.map((item) => {
              const status = item.status ?? 'ACTIVE';
              return (
                <tr key={item.id}>
                  <td>
                    <strong>{item.fullName}</strong>
                    <span>{item.assignedBarangay?.name ?? 'Municipal account'}</span>
                  </td>
                  <td><span className="muted-cell">{item.email}</span></td>
                  <td>{label(item.role)}</td>
                  <td><span className={`user-status ${status.toLowerCase()}`}>{status === 'INACTIVE' ? 'Disabled' : label(status)}</span></td>
                  <td>{formatDate(item.updatedAt ?? item.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="action-button" type="button" title="View user" aria-label={`View ${item.fullName}`} onClick={() => viewUser(item)}><Eye size={16} /></button>
                      <button className="action-button" type="button" title="Edit user" aria-label={`Edit ${item.fullName}`} onClick={() => editUser(item)}><Pencil size={16} /></button>
                      <button className="action-button danger-action" type="button" title="Disable user" aria-label={`Disable ${item.fullName}`} onClick={() => disableUser(item)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
        <div className="pagination">
          <span>{filteredUsers.length} users</span>
          <button className="button ghost compact" type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>Previous</button>
          {Array.from({ length: pageCount }, (_, index) => (
            <button key={index + 1} className={`page-button ${page === index + 1 ? 'active' : ''}`} type="button" onClick={() => setPage(index + 1)}>{index + 1}</button>
          ))}
          <button className="button ghost compact" type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={page === pageCount}>Next</button>
        </div>
      </section>
    </main>
  );
}
