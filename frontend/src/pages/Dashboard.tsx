import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Server, Activity, AlertTriangle, Cpu } from 'lucide-react';
import { api } from '../services/api';

const StatCard = ({ title, value, icon, color }: any) => (
  <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <p style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '0.875rem', fontWeight: 500 }}>{title}</p>
      <h3 style={{ margin: 0, fontSize: '1.75rem' }}>{value}</h3>
    </div>
    <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: `${color}15`, color: color }}>
      {icon}
    </div>
  </div>
);

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('15m');

  useEffect(() => {
    const fetchDashboard = () => {
      api.request(`/analytics/dashboard?time_range=${timeRange}`).then(setData).catch(console.error);
    };
    
    fetchDashboard();

    const ws = new WebSocket('ws://127.0.0.1:8000/ws');
    ws.onmessage = (event) => {
      if (event.data === 'NEW_ALERT') fetchDashboard();
    };

    return () => ws.close();
  }, [timeRange]); // Re-run when timeRange changes

  if (!data) return <div style={{ padding: '24px' }}>Loading Nexus Command...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header with Time Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>System Overview</h1>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', fontWeight: 500, outline: 'none' }}
        >
          <option value="15m">Last 15 Minutes</option>
          <option value="1h">Last Hour</option>
          <option value="6h">Last 6 Hours</option>
          <option value="24h">Last 24 Hours</option>
        </select>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <StatCard title="Total Services" value={data.total_services} icon={<Server size={24} />} color="#6366f1" />
        <StatCard title="Healthy Services" value={data.healthy_services} icon={<Activity size={24} />} color="#10b981" />
        <StatCard title="Avg CPU" value={`${data.avg_cpu}%`} icon={<Cpu size={24} />} color="#f59e0b" />
        <StatCard title="Avg Response" value={`${data.avg_response}ms`} icon={<AlertTriangle size={24} />} color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px' }}>CPU & Memory Utilization</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chart_data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Area type="monotone" dataKey="cpu" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                <Area type="monotone" dataKey="mem" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px' }}>API Response Times</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chart_data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="resp" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}