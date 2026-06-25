import { LogOut } from 'lucide-react';
import { useAuth } from '../features/auth/auth-context';
import { navItems, PageKey } from '../shared/navigation';

export function Shell({ children, currentPage, onNavigate }: {
  children: React.ReactNode;
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
}) {
  const { user, logout } = useAuth();
  const allowedItems = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-title">
          <strong>LGU IMS</strong>
          <span>Online Database</span>
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
        <button className="logout" onClick={logout}><LogOut size={18} /> Logout</button>
      </aside>
      <section className="content">
        <header className="topbar">
          <div>
            <strong>{user?.fullName}</strong>
            <span>{user?.role.replaceAll('_', ' ')}</span>
          </div>
        </header>
        {children}
      </section>
    </div>
  );
}

