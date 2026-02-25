import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Camera, Activity, Box, FileText } from 'lucide-react';
import GuidedCapture from './features/camera/GuidedCapture';
import SensorDashboard from './features/sensors/SensorDashboard';
import MsiVisualizer from './features/threed/MsiVisualizer';
import RiskResults from './features/triage/RiskResults';

function Navigation() {
  const location = useLocation();
  const routes = [
    { path: '/capture', label: 'Captura', icon: Camera },
    { path: '/sensors', label: 'Sensores', icon: Activity },
    { path: '/3dmap', label: 'Mapa 3D', icon: Box },
    { path: '/triage', label: 'Resultados', icon: FileText },
  ];

  return (
    <nav className="bottom-nav">
      {routes.map((route) => {
        const Icon = route.icon;
        const isActive = location.pathname.startsWith(route.path);
        return (
          <NavLink
            key={route.path}
            to={route.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span>{route.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function Header() {
  return (
    <header className="header glass-panel" style={{ margin: '1rem 1.5rem', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.15)' }}>
      <div className="header-title">
        <Activity className="text-blue-400" size={24} />
        <span>TACTICMAP</span>
      </div>
      <div className="text-xs text-muted-foreground bg-slate-800 px-2 py-1 rounded-full border border-slate-700">
        SaMD
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse-glow"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

        <Header />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/capture" replace />} />
            <Route path="/capture" element={<GuidedCapture />} />
            <Route path="/sensors" element={<SensorDashboard />} />
            <Route path="/3dmap" element={<MsiVisualizer />} />
            <Route path="/triage" element={<RiskResults />} />
          </Routes>
        </main>

        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
