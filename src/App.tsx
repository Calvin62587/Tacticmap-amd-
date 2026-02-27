import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import {
  Home, Camera, Activity, Box, FileText, LogOut, Shield, Bluetooth,
} from 'lucide-react';

import HomeScreen from './features/home/HomeScreen';
import GuidedCapture from './features/camera/GuidedCapture';
import SensorDashboard from './features/sensors/SensorDashboard';
import MsiVisualizer from './features/threed/MsiVisualizer';
import RiskResults from './features/triage/RiskResults';
import LoginScreen from './features/auth/LoginScreen';
import RegisterScreen from './features/auth/RegisterScreen';
import LegalConsentScreen from './features/auth/LegalConsentScreen';
import ClinicalHistoryScreen from './features/auth/ClinicalHistoryScreen';
import { useAuthStore } from './store/useAuthStore';

/* ─── Navigation config ──────────────────────────────────────────────────── */
const NAV_ROUTES = [
  { path: '/home', label: 'Inicio', icon: Home },
  { path: '/capture', label: 'Fotos', icon: Camera },
  { path: '/sensors', label: 'Sensores', icon: Activity },
  { path: '/3dmap', label: 'MSI', icon: Box },
  { path: '/triage', label: 'Informe', icon: FileText },
];

/* Step progress labels for the header (matches reference flow) */
const STEPS = [
  { path: '/capture', label: 'Fotos' },
  { path: '/3dmap', label: '3D' },
  { path: '/sensors', label: 'Sensores' },
  { path: '/triage', label: 'MSI' },
];

/* ─── Bottom Nav ──────────────────────────────────────────────────────────── */
function Navigation() {
  const location = useLocation();
  return (
    <nav className="bottom-nav">
      {NAV_ROUTES.map(({ path, label, icon: Icon }) => {
        const isActive = location.pathname.startsWith(path);
        return (
          <NavLink
            key={path}
            to={path}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} strokeWidth={isActive ? 2.4 : 1.7} />
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

/* ─── Header ──────────────────────────────────────────────────────────────── */
function Header() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U';

  /* Determine active step index for progress bar */
  const activeStepIdx = STEPS.findIndex(s => location.pathname.startsWith(s.path));
  const progressPct = activeStepIdx >= 0 ? ((activeStepIdx + 1) / STEPS.length) * 100 : 0;

  return (
    <header className="header">
      {/* Left: Logo */}
      <div className="header-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(8,145,178,0.6))' }}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <span>TACTICMAP</span>
      </div>

      {/* Right: badges + avatar + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span className="badge badge-teal" style={{ fontSize: '0.55rem' }}>
          <Shield size={8} /> SaMD
        </span>

        {user && (
          <>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--teal-500), var(--cyan-500))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.68rem', fontWeight: 800, color: '#fff',
              boxShadow: '0 2px 8px rgba(8,145,178,0.35)',
            }}>
              {initial}
            </div>

            <button onClick={logout} title="Cerrar sesión" style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0.35rem', padding: '0.2rem', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
            }}>
              <LogOut size={12} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

/* ─── Step Progress Bar (shown on workflow screens) ───────────────────────── */
function StepProgress() {
  const location = useLocation();
  const activeIdx = STEPS.findIndex(s => location.pathname.startsWith(s.path));

  if (activeIdx < 0) return null; // not on a workflow screen

  return (
    <div style={{
      padding: '0.5rem 1.25rem 0.6rem',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
    }}>
      {/* Labels */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: '0.35rem',
      }}>
        {STEPS.map((step, idx) => (
          <span key={step.path} style={{
            fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.04em',
            color: idx <= activeIdx ? 'var(--teal-300)' : 'var(--text-dim)',
            transition: 'color 0.3s',
          }}>
            {step.label}
          </span>
        ))}
      </div>
      {/* Bar */}
      <div className="progress-bar" style={{ height: '3px' }}>
        <div className="progress-bar-fill" style={{
          width: `${((activeIdx + 1) / STEPS.length) * 100}%`,
        }} />
      </div>
    </div>
  );
}

/* ─── Auth Gate ────────────────────────────────────────────────────────────── */
function AuthGate() {
  const { onboardingStep } = useAuthStore();

  if (onboardingStep === 'login') return <LoginScreen />;
  if (onboardingStep === 'register') return <RegisterScreen />;
  if (onboardingStep === 'consent') return <LegalConsentScreen />;
  if (onboardingStep === 'clinical') return <ClinicalHistoryScreen />;
  return null;
}

/* ─── App ──────────────────────────────────────────────────────────────────── */
function App() {
  const { onboardingStep } = useAuthStore();
  const isAuthenticated = onboardingStep === 'done';

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Ambient teal glows */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 260, height: 260,
          background: 'rgba(8,145,178,0.10)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: 40, left: -60, width: 200, height: 200,
          background: 'rgba(6,182,212,0.06)', borderRadius: '50%', filter: 'blur(70px)', pointerEvents: 'none'
        }} />

        {!isAuthenticated && <AuthGate />}

        {isAuthenticated && (
          <>
            <Header />
            <StepProgress />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomeScreen />} />
                <Route path="/capture" element={<GuidedCapture />} />
                <Route path="/sensors" element={<SensorDashboard />} />
                <Route path="/3dmap" element={<MsiVisualizer />} />
                <Route path="/triage" element={<RiskResults />} />
              </Routes>
            </main>
            <Navigation />
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
