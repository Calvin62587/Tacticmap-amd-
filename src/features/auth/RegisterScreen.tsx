import { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { INPUT } from './LoginScreen';

const LABEL: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '0.35rem', letterSpacing: '0.02em',
};

export default function RegisterScreen() {
    const { register, goToLogin } = useAuthStore();

    const [step, setStep] = useState(1);
    const [showPw, setShowPw] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Step 1 fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');

    // Step 2 fields
    const [birthdate, setBirthdate] = useState('');
    const [country, setCountry] = useState('');
    const [gender, setGender] = useState<'female' | 'male' | 'other' | 'prefer_not'>('female');

    const validateStep1 = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = 'Ingresa tu nombre completo.';
        if (!email.includes('@')) e.email = 'Correo inválido.';
        if (password.length < 8) e.password = 'Mínimo 8 caracteres.';
        if (password !== confirmPw) e.confirmPw = 'Las contraseñas no coinciden.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        const e: Record<string, string> = {};
        if (!birthdate) e.birthdate = 'Ingresa tu fecha de nacimiento.';
        if (!country.trim()) e.country = 'Ingresa tu país.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) setStep(2);
    };

    const handleRegister = () => {
        if (!validateStep2()) return;
        register({ name, email, birthdate, country, gender });
    };

    return (
        <div style={SHELL}>
            {/* Ambient blobs */}
            <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: 260, height: 260, borderRadius: '50%', background: 'rgba(236,72,153,0.10)', filter: 'blur(70px)', pointerEvents: 'none' }} />

            <div style={CARD} className="animate-fade-up">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <button onClick={step === 1 ? goToLogin : () => setStep(1)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.35rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <ChevronLeft size={18} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Crear cuenta</h2>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Paso {step} de 2</p>
                    </div>
                    {/* Step dots */}
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {[1, 2].map(i => (
                            <div key={i} style={{
                                width: i <= step ? 20 : 6, height: 6,
                                borderRadius: 999,
                                background: i <= step
                                    ? 'linear-gradient(90deg, var(--blue-500), var(--rose-500))'
                                    : 'rgba(255,255,255,0.12)',
                                transition: 'all 0.3s',
                            }} />
                        ))}
                    </div>
                </div>

                {step === 1 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <Field label="Nombre completo" error={errors.name}>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="María García López" style={INPUT} />
                        </Field>
                        <Field label="Correo electrónico" error={errors.email}>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" style={INPUT} autoComplete="email" />
                        </Field>
                        <Field label="Contraseña" error={errors.password}>
                            <div style={{ position: 'relative' }}>
                                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" style={{ ...INPUT, paddingRight: '2.5rem' }} />
                                <button onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </Field>
                        <Field label="Confirmar contraseña" error={errors.confirmPw}>
                            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repite tu contraseña" style={INPUT} />
                        </Field>

                        <button className="btn btn-primary" onClick={handleNext} style={{ width: '100%', padding: '0.85rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                            Siguiente <ChevronRight size={16} />
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <Field label="Fecha de nacimiento" error={errors.birthdate}>
                            <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} style={INPUT} max={new Date().toISOString().split('T')[0]} />
                        </Field>
                        <Field label="País / Ciudad" error={errors.country}>
                            <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="Colombia, Bogotá" style={INPUT} />
                        </Field>
                        <Field label="Género">
                            <select value={gender} onChange={e => setGender(e.target.value as any)} style={{ ...INPUT, appearance: 'none' }}>
                                <option value="female">Femenino</option>
                                <option value="male">Masculino</option>
                                <option value="other">Otro</option>
                                <option value="prefer_not">Prefiero no decir</option>
                            </select>
                        </Field>

                        <button className="btn btn-warm" onClick={handleRegister} style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}>
                            Crear mi cuenta
                        </button>
                    </div>
                )}

                <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    ¿Ya tienes cuenta?{' '}
                    <button onClick={goToLogin} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose-400)', fontWeight: 600, fontSize: '0.78rem' }}>
                        Iniciar sesión
                    </button>
                </p>
            </div>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label style={LABEL}>{label}</label>
            {children}
            {error && <p style={{ fontSize: '0.72rem', color: 'var(--rose-400)', marginTop: '0.25rem' }}>{error}</p>}
        </div>
    );
}

const SHELL: React.CSSProperties = {
    position: 'fixed', inset: 0,
    background: 'radial-gradient(ellipse 80% 50% at 80% 100%, rgba(236,72,153,0.1) 0%, transparent 55%), hsl(220,28%,6%)',
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
    padding: '1.75rem 2rem',
    boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
};
