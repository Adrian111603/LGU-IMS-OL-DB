import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../features/auth/auth-context';
import { useAlerts } from '../shared/alerts';
import { navItems, PageKey } from '../shared/navigation';

export function Shell({ children, currentPage, onNavigate }: {
  children: React.ReactNode;
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
}) {
  const { user, logout } = useAuth();
  const { confirm } = useAlerts();
  const allowedItems = navItems.filter((item) => user && item.roles.includes(user.role));

  async function confirmLogout() {
    const confirmed = await confirm({
      title: 'Sign out?',
      text: 'Your current session will be closed.',
      kind: 'warning',
      confirmText: 'Sign out'
    });
    if (confirmed) logout();
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-title">
          <div className="sidebar-brand">
            <ShieldCheck size={24} />
            <div>
              <strong>LGU IMS</strong>
              <span>Online Database</span>
            </div>
          </div>
        </div>
        <nav>
          {allowedItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.key} className={currentPage === item.key ? 'active' : ''} onClick={() => onNavigate(item.key)}>
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
        <button className="logout" onClick={confirmLogout}><LogOut size={18} /> Logout</button>
      </aside>
      <section className="content">
        <header className="topbar">
          <div className="topbar-title">
            <strong>{allowedItems.find((item) => item.key === currentPage)?.label ?? 'Package Details'}</strong>
            <span>Secure IMS package exchange workspace</span>
          </div>
          <div>
            <strong>{user?.fullName}</strong>
            <span>{user?.role.replace(/_/g, ' ')}</span>
          </div>
        </header>
        {children}
      </section>
    </div>
  );
}
