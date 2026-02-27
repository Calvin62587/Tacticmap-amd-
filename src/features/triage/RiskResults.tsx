import {
    FileText, Download, Share2, AlertTriangle, CheckCircle,
    Clock, Shield, TrendingUp,
} from 'lucide-react';
import { useSensorStore } from '../../store/useSensorStore';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  RiskResults — Comprehensive MSI Report + Temporal Comparison              */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function RiskResults() {
    const { lesions, data } = useSensorStore();

    /* Simulated MSI score based on amount of lesions and sensor data */
    const activeSensors = Object.values(data).filter(v => v > 0).length;
    const msiScore = activeSensors > 0
        ? (data.temperature + data.pressure + data.density * 10 + (data.pulse / 10)).toFixed(1)
        : '0';
    const score = parseFloat(msiScore);
    const riskLevel: 'BAJO' | 'MEDIO' | 'ALTO' =
        score > 60 ? 'ALTO' : score > 50 ? 'MEDIO' : 'BAJO';

    const riskConfig: Record<string, { class: string; icon: typeof CheckCircle; color: string; desc: string }> = {
        BAJO: { class: 'risk-low', icon: CheckCircle, color: 'var(--green-400)', desc: '✓ Sin hallazgos relevantes. Continúe monitoreo regular cada 90 días.' },
        MEDIO: { class: 'risk-medium', icon: AlertTriangle, color: 'var(--yellow-400)', desc: '⚠ Cambio a vigilar. Se recomienda seguimiento en 30 días y comparación con histórico.' },
        ALTO: { class: 'risk-high', icon: AlertTriangle, color: 'var(--red-400)', desc: '🔴 Hallazgo sospechoso. Se recomienda evaluación diagnóstica estándar con profesional.' },
    };

    const risk = riskConfig[riskLevel];
    const RiskIcon = risk.icon;

    /* Simulated scan history */
    const scanHistory = [
        { date: '2026-01-15', score: 42.3, level: 'BAJO', findings: 0 },
        { date: '2026-01-28', score: 43.1, level: 'BAJO', findings: 0 },
        { date: '2026-02-27', score, level: riskLevel, findings: lesions.length },
    ];

    /* Sensor readings for the report */
    const sensorRows = [
        { label: 'Temperatura', value: `${data.temperature}°C`, status: data.temperature > 38 ? 'alto' : 'normal' },
        { label: 'Presión', value: `${data.pressure} kPa`, status: data.pressure > 20 ? 'alto' : 'normal' },
        { label: 'Ultrasonido', value: `${data.ultrasound} m/s`, status: 'normal' },
        { label: 'Pulso Sónico', value: `${data.pulse} bpm`, status: data.pulse > 90 ? 'alto' : 'normal' },
        { label: 'Densidad', value: `${data.density} g/cm³`, status: data.density > 1.2 ? 'alto' : 'normal' },
    ];

    return (
        <div className="screen-section">
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="section-header" style={{ marginBottom: '0.25rem' }}>
                <FileText size={20} style={{ color: 'var(--teal-400)' }} />
                <h2>Informe MSI</h2>
            </div>
            <p className="section-subtitle">
                Resultado del análisis multimodal integrado con recomendaciones clínicas.
            </p>

            {/* ┌─────────────────────────────────────────────────────────────────┐
         │  Risk Level Banner                                              │
         └─────────────────────────────────────────────────────────────────┘ */}
            <div className={risk.class} style={{
                borderRadius: 'var(--radius-xl)', padding: '1.25rem',
                marginBottom: '0.75rem',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                            <RiskIcon size={18} style={{ color: risk.color }} />
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: risk.color }}>
                                Nivel de Riesgo: {riskLevel}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                            {risk.desc}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: risk.color, lineHeight: 1 }}>
                            {msiScore}
                        </div>
                        <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            Puntuación MSI
                        </div>
                    </div>
                </div>
            </div>

            {/* ┌─────────────────────────────────────────────────────────────────┐
         │  Session Summary Stats                                          │
         └─────────────────────────────────────────────────────────────────┘ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <div className="data-stat">
                    <div className="data-stat-value">{lesions.length}</div>
                    <div className="data-stat-label">Hallazgos</div>
                </div>
                <div className="data-stat">
                    <div className="data-stat-value">{activeSensors}/5</div>
                    <div className="data-stat-label">Sensores</div>
                </div>
                <div className="data-stat">
                    <div className="data-stat-value">&lt;0.5cm</div>
                    <div className="data-stat-label">Precisión</div>
                </div>
                <div className="data-stat">
                    <div className="data-stat-value" style={{ fontSize: '0.85rem' }}>✓</div>
                    <div className="data-stat-label">Ortogonal</div>
                </div>
            </div>

            {/* ┌─────────────────────────────────────────────────────────────────┐
         │  Sensor Readings Table                                          │
         └─────────────────────────────────────────────────────────────────┘ */}
            <div className="card" style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Lecturas de Sensores
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {sensorRows.map(row => (
                        <div key={row.label} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255,255,255,0.02)',
                        }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'monospace' }}>{row.value}</span>
                                <span className={`badge ${row.status === 'alto' ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '0.5rem' }}>
                                    {row.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ┌─────────────────────────────────────────────────────────────────┐
         │  Temporal Comparison (Scan History)                              │
         └─────────────────────────────────────────────────────────────────┘ */}
            <div className="card" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        Historial de Escaneos
                    </p>
                    <span className="badge badge-teal">
                        <TrendingUp size={8} /> {scanHistory.length} sesiones
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {scanHistory.map((scan, idx) => {
                        const isCurrent = idx === scanHistory.length - 1;
                        return (
                            <div key={scan.date} className={`timeline-item ${isCurrent ? 'current' : ''}`}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                                {new Date(scan.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            {isCurrent && (
                                                <span className="badge badge-teal" style={{ fontSize: '0.48rem' }}>Actual</span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                                            {scan.findings} hallazgo{scan.findings !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>{scan.score}</span>
                                        <div>
                                            <span className={`badge ${scan.level === 'ALTO' ? 'badge-red' : scan.level === 'MEDIO' ? 'badge-yellow' : 'badge-green'}`}
                                                style={{ fontSize: '0.48rem' }}>
                                                {scan.level}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ┌─────────────────────────────────────────────────────────────────┐
         │  Actions                                                        │
         └─────────────────────────────────────────────────────────────────┘ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button className="btn btn-primary btn-block" style={{ padding: '0.75rem' }}>
                    <Download size={16} /> Exportar Reporte PDF
                </button>
                <button className="btn btn-secondary btn-block" style={{ padding: '0.75rem' }}>
                    <Share2 size={16} /> Compartir con Médico
                </button>
            </div>

            {/* ┌─────────────────────────────────────────────────────────────────┐
         │  SaMD Disclaimer                                                │
         └─────────────────────────────────────────────────────────────────┘ */}
            <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                    <Shield size={12} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Aviso SaMD · IEC 62304
                    </span>
                </div>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                    TACTICMAP es un instrumento SaMD de Clase IIa según IEC 62304, diseñado para{' '}
                    <strong>triaje accionable y seguimiento longitudinal</strong>, no para diagnóstico confirmatorio.
                    Este informe NO sustituye la evaluación diagnóstica de un profesional médico especializado.
                    Los datos se almacenan con encriptación AES-256 cumpliendo HIPAA/GDPR.
                </p>
            </div>
        </div>
    );
}
