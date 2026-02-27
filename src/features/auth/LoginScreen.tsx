import { useState } from 'react';
import { Eye, EyeOff, Activity } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginScreen() {
    const { login, goToRegister, user } = useAuthStore();

    const [email, setEmail] = useState(user?.email ?? '');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) { setError('Completa todos los campos.'); return; }
        setLoading(true);
        setError('');
        await new Promise(r => setTimeout(r, 600)); // simulate network
        const ok = login(email, password);
        setLoading(false);
        if (!ok) setError('Correo o contraseña incorrectos. Si eres nuevo, crea una cuenta.');
    };

    return (
        <div style={SHELL}>
            {/* Ambient blobs */}
            <div style={{ position: 'absolute', top: '-80px', right: '-60px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '100px', left: '-80px', width: 260, height: 260, borderRadius: '50%', background: 'rgba(236,72,153,0.10)', filter: 'blur(70px)', pointerEvents: 'none' }} />

            {/* Card */}
            <div style={CARD} className="animate-fade-up">
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 56, height: 56, borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(236,72,153,0.2))',
                        border: '1px solid rgba(255,255,255,0.1)',
                        marginBottom: '1rem',
                    }}>
                        <Activity size={28} style={{ color: 'var(--rose-400)' }} />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, var(--blue-400), var(--rose-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        TACTICMAP
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                        Cuida tu salud con inteligencia
                    </p>
                </div>

                {/* Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <div>
                        <label style={LABEL}>Correo electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            style={INPUT}
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label style={LABEL}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ ...INPUT, paddingRight: '2.5rem' }}
                                autoComplete="current-password"
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            />
                            <button
                                onClick={() => setShowPw(v => !v)}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                            >
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--rose-400)', background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
                            {error}
                        </p>
                    )}

                    <button
                        className="btn btn-primary"
                        onClick={handleLogin}
                        disabled={loading}
                        style={{ width: '100%', padding: '0.85rem', fontSize: '0.925rem', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Verificando…' : 'Iniciar sesión'}
                    </button>

                    <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', marginTop: '-0.25rem' }}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>¿Primera vez?</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>

                <button
                    className="btn"
                    onClick={goToRegister}
                    style={{
                        width: '100%', padding: '0.75rem', fontSize: '0.875rem',
                        border: '1px solid rgba(236,72,153,0.4)',
                        background: 'rgba(236,72,153,0.07)',
                        color: 'var(--rose-400)',
                    }}
                >
                    Crear cuenta nueva
                </button>
            </div>

            {/* SaMD disclaimer */}
            <p style={{ position: 'absolute', bottom: '1.25rem', left: 0, right: 0, textAlign: 'center', fontSize: '0.62rem', color: 'var(--text-muted)', padding: '0 1.5rem' }}>
                TACTICMAP es un SaMD · Instrumento clínico de apoyo, no diagnóstico definitivo · ISO 62304
            </p>
        </div>
    );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const SHELL: React.CSSProperties = {
    position: 'fixed', inset: 0,
    background: 'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(59,130,246,0.14) 0%, transparent 55%), hsl(220,28%,6%)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '1.5rem', zIndex: 100,
};

const CARD: React.CSSProperties = {
    width: '100%', maxWidth: 420,
    background: 'rgba(18,27,44,0.85)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.5rem',
    padding: '2rem 2rem 1.75rem',
    boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
};

export const INPUT: React.CSSProperties = {
    width: '100%',
    background: 'rgba(10,14,24,0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.625rem',
    padding: '0.75rem 0.9rem',
    fontSize: '0.875rem',
    color: '#e2e8f0',
    outline: 'none',
    transition: 'border-color 0.2s',
};

const LABEL: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '0.35rem', letterSpacing: '0.02em',
};
