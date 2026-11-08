import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar, Navbar } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { DependencyGraph } from './pages/DependencyGraph';
import { Incidents } from './pages/Incidents';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '250px', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ padding: '24px' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dependencies" element={<DependencyGraph />} />
              <Route path="/incidents" element={<Incidents />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
export default App;
