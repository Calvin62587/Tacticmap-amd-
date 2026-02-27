import { useState } from 'react';
import { useAuthStore, ClinicalProfile } from '../../store/useAuthStore';
import { INPUT } from './LoginScreen';

type Step = 1 | 2 | 3;

const LABEL: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '0.35rem', letterSpacing: '0.02em',
};

const SECTION_TITLES: Record<Step, { title: string; subtitle: string }> = {
    1: { title: 'Datos Físicos', subtitle: 'Medidas corporales básicas' },
    2: { title: 'Antecedentes Clínicos', subtitle: 'Historial médico personal y familiar' },
    3: { title: 'Estilo de Vida', subtitle: 'Factores de contexto para el análisis' },
};

export default function ClinicalHistoryScreen() {
    const { saveClinicalProfile, skipClinicalProfile, user } = useAuthStore();
    const [step, setStep] = useState<Step>(1);

    // Section 1
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bloodType, setBloodType] = useState('');

    // Section 2
    const [priorCancerDx, setPriorCancerDx] = useState(false);
    const [familyHistory, setFamilyHistory] = useState(false);
    const [lastExamDate, setLastExamDate] = useState('');

    // Section 3
    const [physicalActivity, setPhysicalActivity] = useState<ClinicalProfile['physicalActivity']>('light');
    const [breastfeeding, setBreastfeeding] = useState(false);
    const [hormonalContraceptives, setHormonalContraceptives] = useState(false);

    const handleSave = () => {
        saveClinicalProfile({
            weight, height, bloodType,
            priorCancerDx, familyHistory, lastExamDate,
            physicalActivity, breastfeeding, hormonalContraceptives,
            isComplete: true,
        });
    };

    const nextStep = () => setStep(prev => Math.min(3, prev + 1) as Step);
    const prevStep = () => setStep(prev => Math.max(1, prev - 1) as Step);

    return (
        <div style={SHELL}>
            <div style={CARD} className="animate-fade-up">
                {/* Header */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Tu Historia Clínica</h2>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                🔒 Información confidencial · cifrada AES-256
                            </p>
                        </div>
                        <button
                            onClick={skipClinicalProfile}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
                        >
                            Completar más tarde
                        </button>
                    </div>

                    {/* Step indicator */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {([1, 2, 3] as Step[]).map(s => (
                            <div key={s} style={{
                                flex: 1, height: 4, borderRadius: 999,
                                background: s <= step
                                    ? 'linear-gradient(90deg, var(--blue-500), var(--rose-500))'
                                    : 'rgba(255,255,255,0.1)',
                                transition: 'background 0.3s',
                            }} />
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{SECTION_TITLES[step].title}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{step}/3</p>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{SECTION_TITLES[step].subtitle}</p>
                </div>

                {/* ── Section 1 ─────────────────── */}
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div>
                            <label style={LABEL}>Peso (kg)</label>
                            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="65" style={INPUT} min={30} max={200} />
                        </div>
                        <div>
                            <label style={LABEL}>Talla (cm)</label>
                            <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="165" style={INPUT} min={100} max={220} />
                        </div>
                        <div>
                            <label style={LABEL}>Grupo sanguíneo</label>
                            <select value={bloodType} onChange={e => setBloodType(e.target.value)} style={{ ...INPUT, appearance: 'none' }}>
                                <option value="">Seleccionar…</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                                    <option key={bt} value={bt}>{bt}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* ── Section 2 ─────────────────── */}
                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <YesNoField
                            label="¿Has tenido un diagnóstico previo de cáncer?"
                            value={priorCancerDx}
                            onChange={setPriorCancerDx}
                        />
                        <YesNoField
                            label="¿Tienes antecedentes familiares de cáncer de mama?"
                            value={familyHistory}
                            onChange={setFamilyHistory}
                        />
                        <div>
                            <label style={LABEL}>Fecha de tu último examen mamario</label>
                            <input type="date" value={lastExamDate} onChange={e => setLastExamDate(e.target.value)} style={INPUT} max={new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>
                )}

                {/* ── Section 3 ─────────────────── */}
                {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div>
                            <label style={LABEL}>Nivel de actividad física</label>
                            <select value={physicalActivity} onChange={e => setPhysicalActivity(e.target.value as any)} style={{ ...INPUT, appearance: 'none' }}>
                                <option value="sedentary">Sedentario (sin ejercicio regular)</option>
                                <option value="light">Ligero (1–2 días/semana)</option>
                                <option value="moderate">Moderado (3–4 días/semana)</option>
                                <option value="active">Activo (5+ días/semana)</option>
                            </select>
                        </div>
                        <YesNoField
                            label="¿Estás en periodo de lactancia materna?"
                            value={breastfeeding}
                            onChange={setBreastfeeding}
                        />
                        <YesNoField
                            label="¿Usas anticonceptivos hormonales?"
                            value={hormonalContraceptives}
                            onChange={setHormonalContraceptives}
                        />
                    </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.5rem' }}>
                    {step > 1 && (
                        <button
                            onClick={prevStep}
                            style={{ flex: 1, padding: '0.8rem', borderRadius: '0.625rem', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                            ← Atrás
                        </button>
                    )}
                    {step < 3 ? (
                        <button className="btn btn-primary" onClick={nextStep} style={{ flex: 2, padding: '0.85rem', fontSize: '0.875rem' }}>
                            Siguiente →
                        </button>
                    ) : (
                        <button className="btn btn-warm" onClick={handleSave} style={{ flex: 2, padding: '0.875rem', fontSize: '0.9rem' }}>
                            Guardar y Comenzar 🚀
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function YesNoField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div>
            <label style={{ ...LABEL, marginBottom: '0.5rem' }}>{label}</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[{ val: true, txt: 'Sí' }, { val: false, txt: 'No' }].map(({ val, txt }) => (
                    <button
                        key={txt}
                        onClick={() => onChange(val)}
                        style={{
                            flex: 1, padding: '0.6rem', borderRadius: '0.625rem', cursor: 'pointer',
                            border: value === val ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                            background: value === val ? 'rgba(59,130,246,0.15)' : 'rgba(10,14,24,0.6)',
                            color: value === val ? 'var(--blue-400)' : 'var(--text-secondary)',
                            fontWeight: 600, fontSize: '0.875rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        {txt}
                    </button>
                ))}
            </div>
        </div>
    );
}

const SHELL: React.CSSProperties = {
    position: 'fixed', inset: 0,
    background: 'radial-gradient(ellipse 70% 40% at 10% 90%, rgba(59,130,246,0.10) 0%, transparent 55%), hsl(220,28%,6%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', zIndex: 100,
};

const CARD: React.CSSProperties = {
    width: '100%', maxWidth: 440,
    background: 'rgba(18,27,44,0.9)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.5rem',
    padding: '1.75rem',
    boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
};
