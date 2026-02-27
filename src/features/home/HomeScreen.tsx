import { useNavigate } from 'react-router-dom';
import {
    Camera, Hand, ChevronRight, Calendar,
    Activity, Clock, Shield, Bluetooth
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSensorStore } from '../../store/useSensorStore';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  HomeScreen — Hub central de TACTICMAP                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function HomeScreen() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const bleConnected = useSensorStore((s) => s.bleStatus === 'connected');
    const firstName = user?.name?.split(' ')[0] ?? 'Paciente';

    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    /* ── Action cards config ─────────────────────────────────────────────── */
    const actions = [
        {
            id: 'baseline',
            title: 'Crear Baseline',
            subtitle: 'Primera sesión de referencia',
            description:
                'Captura 3D + escaneo con guante para establecer la línea base de comparación.',
            icon: Camera,
            gradient: 'linear-gradient(135deg, var(--teal-500), var(--cyan-500))',
            badge: null,
            path: '/capture',
        },
        {
            id: 'followup',
            title: 'Seguimiento Mensual',
            subtitle: 'Compare con su baseline',
            description:
                'Nuevo escaneo para detectar cambios respecto a la última sesión.',
            icon: Activity,
            gradient: 'linear-gradient(135deg, var(--conductivity-from), var(--conductivity-to))',
            badge: 'Último: hace 28 días',
            path: '/capture',
        },
        {
            id: 'manual',
            title: 'Ingreso Manual',
            subtitle: 'Anotar directamente en el 3D',
            description:
                'Abrir el modelo 3D y colocar marcadores, notas o etiquetas manualmente.',
            icon: Hand,
            gradient: 'linear-gradient(135deg, var(--ultrasound-from), var(--ultrasound-to))',
            badge: null,
            path: '/3dmap',
        },
    ];

    return (
        <div className="screen-section" style={{ paddingTop: '0.5rem' }}>
            {/* ── Greeting ─────────────────────────────────────────────────────── */}
            <div style={{ marginBottom: '1.5rem' }}>
                <p
                    style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        textTransform: 'capitalize',
                        marginBottom: '0.2rem',
                    }}
                >
                    {dateStr}
                </p>
                <h1
                    style={{
                        fontSize: '1.6rem',
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.2,
                    }}
                >
                    Hola,{' '}
                    <span
                        style={{
                            background: 'linear-gradient(135deg, var(--teal-400), var(--cyan-400))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        {firstName}
                    </span>
                </h1>
                <p
                    style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        marginTop: '0.25rem',
                    }}
                >
                    ¿Qué deseas hacer hoy?
                </p>
            </div>

            {/* ── Status pills ─────────────────────────────────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1.25rem',
                    flexWrap: 'wrap',
                }}
            >
                {/* Glove status */}
                <div
                    className="badge"
                    style={{
                        background: bleConnected
                            ? 'rgba(34,197,94,0.1)'
                            : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${bleConnected ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'
                            }`,
                        color: bleConnected ? 'var(--green-400)' : 'var(--text-muted)',
                    }}
                >
                    <Bluetooth size={10} />
                    {bleConnected ? 'Guante conectado' : 'Guante desconectado'}
                </div>

                {/* SaMD badge */}
                <div className="badge badge-teal">
                    <Shield size={10} />
                    SaMD · ISO 62304
                </div>
            </div>

            {/* ── Action Cards ─────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {actions.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.id}
                            onClick={() => navigate(action.path)}
                            className="animate-fade-up"
                            style={{
                                animationDelay: `${idx * 0.08}s`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.9rem',
                                padding: '1rem 1.1rem',
                                background: 'hsl(var(--bg-card))',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 'var(--radius-xl)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                color: 'inherit',
                                transition: 'all 0.3s ease',
                                width: '100%',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.borderColor =
                                    'rgba(8,145,178,0.25)';
                                (e.currentTarget as HTMLElement).style.transform =
                                    'translateY(-2px)';
                                (e.currentTarget as HTMLElement).style.boxShadow =
                                    '0 8px 24px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.borderColor =
                                    'rgba(255,255,255,0.06)';
                                (e.currentTarget as HTMLElement).style.transform = 'none';
                                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                            }}
                        >
                            {/* Icon bubble */}
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 'var(--radius-lg)',
                                    background: action.gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                                }}
                            >
                                <Icon size={22} color="#fff" strokeWidth={2} />
                            </div>

                            {/* Text */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        marginBottom: '0.15rem',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: '0.92rem',
                                            fontWeight: 700,
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        {action.title}
                                    </span>
                                    {action.badge && (
                                        <span
                                            className="badge badge-yellow"
                                            style={{ fontSize: '0.55rem' }}
                                        >
                                            <Clock size={8} />
                                            {action.badge}
                                        </span>
                                    )}
                                </div>
                                <p
                                    style={{
                                        fontSize: '0.72rem',
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.35,
                                    }}
                                >
                                    {action.description}
                                </p>
                            </div>

                            {/* Arrow */}
                            <ChevronRight
                                size={18}
                                style={{
                                    color: 'var(--text-dim)',
                                    flexShrink: 0,
                                }}
                            />
                        </button>
                    );
                })}
            </div>

            {/* ── Last Session Summary ──────────────────────────────────────────── */}
            <div
                className="card-teal animate-fade-up"
                style={{
                    marginTop: '1.25rem',
                    animationDelay: '0.3s',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginBottom: '0.6rem',
                    }}
                >
                    <Calendar size={14} style={{ color: 'var(--teal-300)' }} />
                    <span
                        style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'var(--teal-300)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                        }}
                    >
                        Última sesión
                    </span>
                </div>

                <p
                    style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                    }}
                >
                    Aún no tiene sesiones registradas. Comience creando su{' '}
                    <strong style={{ color: 'var(--teal-300)' }}>baseline</strong> para
                    habilitar el seguimiento longitudinal.
                </p>

                {/* Adherence bar */}
                <div style={{ marginTop: '0.75rem' }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.65rem',
                            color: 'var(--text-muted)',
                            marginBottom: '0.3rem',
                        }}
                    >
                        <span>Adherencia</span>
                        <span>0 de 12 sesiones</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: '0%' }} />
                    </div>
                </div>
            </div>

            {/* ── Disclaimer ────────────────────────────────────────────────────── */}
            <p
                style={{
                    textAlign: 'center',
                    fontSize: '0.58rem',
                    color: 'var(--text-dim)',
                    marginTop: '1.5rem',
                    lineHeight: 1.5,
                    padding: '0 1rem',
                }}
            >
                TACTICMAP es un SaMD de triaje — instrumento clínico de apoyo, no
                diagnóstico definitivo · ISO 62304
            </p>
        </div>
    );
}
