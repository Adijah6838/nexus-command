import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export function Incidents() {
  const [alerts, setAlerts] = useState<any[]>([]);

  const fetchAlerts = () => {
    api.request('/alerts').then(setAlerts).catch(console.error);
  };

    useEffect(() => {
    fetchAlerts();
    // Connect to WebSocket for instant updates
    const ws = new WebSocket('ws://127.0.0.1:8000/ws');
    
    ws.onmessage = (event) => {
      if (event.data === 'NEW_ALERT') {
        fetchAlerts(); // Instantly refresh when backend says there's an alert
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Active Incidents & Alerts</h1>
        <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '4px 12px', borderRadius: '999px', fontWeight: 600, fontSize: '0.875rem' }}>
          {alerts.filter(a => !a.is_resolved).length} Unresolved
        </span>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {alerts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <CheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: 0 }}>All Systems Operational</h3>
            <p style={{ margin: '8px 0 0 0' }}>No anomalies detected.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px', fontWeight: 600, color: '#64748b' }}>Severity</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#64748b' }}>Service ID</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#64748b' }}>Message</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#64748b' }}>Time</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#64748b' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: alert.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                      color: alert.severity === 'critical' ? '#ef4444' : '#f59e0b'
                    }}>
                      {alert.severity === 'critical' ? <ShieldAlert size={14} /> : <AlertTriangle size={14} />}
                      {alert.severity.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>Service {alert.service_id}</td>
                  <td style={{ padding: '16px', color: '#334155' }}>{alert.message}</td>
                  <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem' }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {alert.is_resolved ? (
                      <span style={{ color: '#10b981', fontWeight: 500, fontSize: '0.875rem' }}>Resolved</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 500, fontSize: '0.875rem' }}>Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
