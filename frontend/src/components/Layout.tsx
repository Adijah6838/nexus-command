import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Network, ShieldAlert, Activity, Bell } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const menu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Network, label: 'Dependencies', path: '/dependencies' },
    { icon: ShieldAlert, label: 'Incidents', path: '/incidents' },
  ];
  return (
    <aside style={{ width: '250px', backgroundColor: '#0f172a', color: '#fff', height: '100vh', position: 'fixed', left: 0, top: 0, padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
        <Activity size={28} color="#6366f1" />
        <h2 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '1px' }}>NEXUS</h2>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menu.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
              color: active ? '#fff' : '#94a3b8', backgroundColor: active ? '#1e293b' : 'transparent', textDecoration: 'none'
            }}>
              <item.icon size={20} />
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function Navbar() {
  return (
    <header style={{ height: '64px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', position: 'sticky', top: 0 }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Bell size={20} color="#64748b" />
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
      </div>
    </header>
  );
}
