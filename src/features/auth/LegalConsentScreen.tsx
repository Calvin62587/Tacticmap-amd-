import { useState } from 'react';
import { CheckSquare, Square, ShieldCheck, FileText, Heart, Lock } from 'lucide-react';
import { useAuthStore, Consents } from '../../store/useAuthStore';

const CONSENT_ITEMS: { key: keyof Consents; Icon: typeof CheckSquare; title: string; description: string }[] = [
    {
        key: 'termsOfUse',
        Icon: FileText,
        title: 'Términos de Uso',
        description: 'Acepto los Términos de Uso de TACTICMAP, incluyendo el uso de la plataforma exclusivamente como herramienta complementaria de salud.',
    },
    {
        key: 'healthDataGdpr',
        Icon: Heart,
        title: 'Tratamiento de Datos de Salud (GDPR Art. 9)',
        description: 'Autorizo el tratamiento de mis datos de salud (categoría especial según RGPD Art. 9) para análisis clínico personalizado. Mis datos son cifrados con AES-256 y nunca se comparten con terceros sin mi consentimiento explícito.',
    },
    {
        key: 'samdDisclaimer',
        Icon: ShieldCheck,
        title: 'SaMD — Instrumento de Apoyo (ISO 62304)',
        description: 'Entiendo que TACTICMAP es un Software as a Medical Device (SaMD) de estratificación de riesgo. No reemplaza el diagnóstico médico profesional ni las pruebas clínicas convencionales (mamografía, ecografía, biopsia).',
    },
    {
        key: 'privacyPolicy',
        Icon: Lock,
        title: 'Política de Privacidad',
        description: 'He leído y acepto la Política de Privacidad de TACTICMAP. Sé que tengo derecho de acceso, rectificación, supresión y portabilidad de mis datos en cualquier momento.',
    },
];

const FULL_TERMS = `TÉRMINOS Y CONDICIONES DE USO — TACTICMAP SaMD

1. DEFINICIÓN DEL SERVICIO
TACTICMAP es una aplicación de Software as a Medical Device (SaMD) diseñada para la estratificación de riesgo mamario mediante integración multimodal de sensores. Su uso se limita a apoyo clínico y no constituye diagnóstico médico.

2. LIMITACIÓN DE RESPONSABILIDAD
TACTICMAP no es un sustituto de la atención médica profesional. Toda decisión clínica debe ser tomada por un profesional de la salud debidamente certificado. Los resultados generados son orientativos.

3. PRIVACIDAD Y SEGURIDAD DE DATOS
Sus datos biométricos y clínicos son tratados conforme al Reglamento General de Protección de Datos (RGPD) de la UE, la HIPAA (EE.UU.) y la Ley 1581 de 2012 (Colombia). Se aplica cifrado AES-256 en reposo y TLS 1.3 en tránsito.

4. DATOS DE CATEGORÍA ESPECIAL
Los datos de salud son considerados datos de categoría especial según el RGPD (Art. 9). Usted otorga su consentimiento explícito e informado para el tratamiento de dichos datos con finalidades estrictamente sanitarias.

5. DERECHOS DEL PACIENTE
Usted tiene derecho a: acceder a sus datos, solicitar rectificación o eliminación, portabilidad de datos, y retirar su consentimiento en cualquier momento sin que ello afecte la licitud del tratamiento previo.

6. NORMATIVA APLICABLE
Este software cumple con: ISO 62304 (ciclo de vida del software médico), IEC 62366 (usabilidad), ISO 14155 (investigación clínica) y MDR 2017/745 (Reglamento de Dispositivos Médicos de la UE).`;

export default function LegalConsentScreen() {
    const { acceptConsents, user } = useAuthStore();
    const [consents, setConsents] = useState<Consents>({
        termsOfUse: false, healthDataGdpr: false, samdDisclaimer: false, privacyPolicy: false,
    });

    const allAccepted = Object.values(consents).every(Boolean);

    const toggle = (key: keyof Consents) =>
        setConsents(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div style={SHELL}>
            <div style={{ ...CARD, maxHeight: '95vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} className="animate-fade-up">
                {/* Header */}
                <div style={{ marginBottom: '1.25rem', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Antes de continuar</h2>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Hola <strong style={{ color: 'var(--rose-400)' }}>{user?.name?.split(' ')[0]}</strong>, necesitamos tu consentimiento informado para proceder.
                    </p>
                </div>

                {/* Full Terms scrollable */}
                <div style={{
                    flex: '0 0 140px',
                    overflowY: 'auto', overflowX: 'hidden',
                    background: 'rgba(10,14,24,0.5)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '0.75rem',
                    padding: '0.875rem 1rem',
                    marginBottom: '1rem',
                    fontSize: '0.7rem',
                    lineHeight: 1.65,
                    color: 'var(--text-muted)',
                    whiteSpace: 'pre-wrap',
                    scrollbarWidth: 'thin',
                }}>
                    {FULL_TERMS}
                </div>

                {/* Checkboxes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', flex: 1, scrollbarWidth: 'none' }}>
                    {CONSENT_ITEMS.map(({ key, Icon, title, description }) => (
                        <button
                            key={key}
                            onClick={() => toggle(key)}
                            style={{
                                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                textAlign: 'left',
                                background: consents[key] ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${consents[key] ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
                                borderRadius: '0.75rem',
                                padding: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                flexShrink: 0,
                            }}
                        >
                            <div style={{ marginTop: '0.1rem', flexShrink: 0 }}>
                                {consents[key]
                                    ? <CheckSquare size={18} style={{ color: 'var(--blue-400)' }} />
                                    : <Square size={18} style={{ color: 'var(--text-muted)' }} />}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                                    <Icon size={13} style={{ color: consents[key] ? 'var(--blue-400)' : 'var(--text-muted)', flexShrink: 0 }} />
                                    <p style={{ fontSize: '0.78rem', fontWeight: 700, color: consents[key] ? '#e2e8f0' : 'var(--text-secondary)' }}>{title}</p>
                                </div>
                                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{description}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ marginTop: '1rem', flexShrink: 0 }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => acceptConsents(consents)}
                        disabled={!allAccepted}
                        style={{
                            width: '100%', padding: '0.875rem', fontSize: '0.9rem',
                            opacity: allAccepted ? 1 : 0.4,
                            cursor: allAccepted ? 'pointer' : 'not-allowed',
                            transition: 'opacity 0.3s',
                        }}
                    >
                        {allAccepted ? 'Acepto y Continuar →' : `Acepta todos los términos (${Object.values(consents).filter(Boolean).length}/4)`}
                    </button>
                    <p style={{ textAlign: 'center', marginTop: '0.6rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        Tu información está protegida con cifrado AES-256
                    </p>
                </div>
            </div>
        </div>
    );
}

const SHELL: React.CSSProperties = {
    position: 'fixed', inset: 0,
    background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 55%), hsl(220,28%,6%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', zIndex: 100,
};

const CARD: React.CSSProperties = {
    width: '100%', maxWidth: 460,
    background: 'rgba(18,27,44,0.9)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.5rem',
    padding: '1.75rem',
    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
};
