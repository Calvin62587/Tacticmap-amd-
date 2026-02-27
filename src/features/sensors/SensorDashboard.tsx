import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bluetooth, BluetoothSearching, Check, ArrowRight,
    Thermometer, Zap, Radio, Gauge, RotateCcw as Elastic,
    Signal, Battery, Cpu, ChevronDown,
} from 'lucide-react';
import { useSensorStore } from '../../store/useSensorStore';

/* ─── Sensor definitions (matches PRD 5-sensor multimodal) ───────────────── */
const SENSORS = [
    { id: 'thermal', name: 'Térmico', unit: '°C', icon: Thermometer, gradient: 'sensor-thermal', emoji: '🌡️', min: 30, max: 42, desc: 'Mapa de calor por angiogénesis' },
    { id: 'conductivity', name: 'Conductividad', unit: 'μS/cm', icon: Zap, gradient: 'sensor-conductivity', emoji: '⚡', min: 0, max: 100, desc: 'Conductividad eléctrica tisular' },
    { id: 'ultrasound', name: 'Ultrasonido', unit: 'MHz', icon: Radio, gradient: 'sensor-ultrasound', emoji: '🔊', min: 1, max: 15, desc: 'Estructura interna volumétrica' },
    { id: 'pressure', name: 'Presión', unit: 'kPa', icon: Gauge, gradient: 'sensor-pressure', emoji: '💪', min: 0, max: 50, desc: 'Rigidez / elasticidad tisular' },
    { id: 'elasticity', name: 'Elasticidad', unit: '%', icon: Elastic, gradient: 'sensor-elasticity', emoji: '🔄', min: 0, max: 100, desc: 'Deformación bajo presión' },
] as const;

/* ─── Quadrant definitions (clock-face) ──────────────────────────────────── */
const QUADRANTS = [
    { id: 'se', label: 'Sup. Ext.', position: 'top-right', clock: '10–12 h' },
    { id: 'si', label: 'Sup. Int.', position: 'top-left', clock: '12–2 h' },
    { id: 'ie', label: 'Inf. Ext.', position: 'bottom-right', clock: '8–10 h' },
    { id: 'ii', label: 'Inf. Int.', position: 'bottom-left', clock: '2–4 h' },
];

type ConnectionMode = 'idle' | 'scanning' | 'connected';
type QuadrantStatus = 'pending' | 'partial' | 'complete';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SensorDashboard — BLE + Calibration + Quadrant Protocol                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function SensorDashboard() {
    const navigate = useNavigate();
    const { bleStatus, setBleStatus } = useSensorStore();
    const bleConnected = bleStatus === 'connected';
    const [connectionMode, setConnectionMode] = useState<ConnectionMode>(bleConnected ? 'connected' : 'idle');
    const [inputMode, setInputMode] = useState<'ble' | 'manual'>('manual');
    const [manualValues, setManualValues] = useState<Record<string, string>>({});
    const [quadrantStatus, setQuadrantStatus] = useState<Record<string, QuadrantStatus>>({
        se: 'pending', si: 'pending', ie: 'pending', ii: 'pending',
    });
    const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);
    const [expandedSensor, setExpandedSensor] = useState<string | null>(null);

    const completedQuadrants = Object.values(quadrantStatus).filter(s => s === 'complete').length;
    const protocolProgress = (completedQuadrants / 4) * 100;

    /* ── BLE scan simulation ────────────────────────────────────────────── */
    const handleBleScan = () => {
        setConnectionMode('scanning');
        setTimeout(() => {
            setConnectionMode('connected');
            setBleStatus('connected', 'TacticGlove™ v2.1');
        }, 3000);
    };

    /* ── Mark quadrant as scanned ───────────────────────────────────────── */
    const handleQuadrantTap = (qId: string) => {
        setActiveQuadrant(qId);
        setQuadrantStatus(prev => ({
            ...prev,
            [qId]: prev[qId] === 'complete' ? 'complete' : 'partial',
        }));
    };

    const handleCompleteQuadrant = () => {
        if (!activeQuadrant) return;
        setQuadrantStatus(prev => ({ ...prev, [activeQuadrant]: 'complete' }));
        setActiveQuadrant(null);
    };

    return (
        <div className="screen-section">
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="section-header" style={{ marginBottom: '0.25rem' }}>
                <Bluetooth size={20} style={{ color: 'var(--teal-400)' }} />
                <h2>Escaneo con Guante</h2>
            </div>
            <p className="section-subtitle">
                Conecte el guante multimodal y complete el protocolo de escaneo por cuadrantes.
            </p>

            {/* ┌─────────────────────────────────────────────────────────────────┐
         │  BLE Connection                                                 │
         └─────────────────────────────────────────────────────────────────┘ */}
            <div className="card" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {/* Status dot */}
                        <div style={{
                            width: 40, height: 40, borderRadius: 'var(--radius-lg)',
                            background: connectionMode === 'connected'
                                ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${connectionMode === 'connected' ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'} `,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {connectionMode === 'scanning' ? (
                                <BluetoothSearching size={18} className="animate-pulse" style={{ color: 'var(--teal-400)' }} />
                            ) : connectionMode === 'connected' ? (
                                <Bluetooth size={18} style={{ color: 'var(--green-400)' }} />
                            ) : (
                                <Bluetooth size={18} style={{ color: 'var(--text-muted)' }} />
                            )}
                        </div>

                        <div>
                            <p style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                                {connectionMode === 'connected' ? 'TacticGlove™ v2.1'
                                    : connectionMode === 'scanning' ? 'Buscando...'
                                        : 'Guante no conectado'}
                            </p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                {connectionMode === 'connected' ? 'BLE · 5 sensores activos'
                                    : connectionMode === 'scanning' ? 'Escaneando dispositivos BLE'
                                        : 'Bluetooth LE'}
                            </p>
                        </div>
                    </div>

                    {connectionMode !== 'connected' && (
                        <button onClick={handleBleScan} disabled={connectionMode === 'scanning'}
                            className="btn btn-primary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.72rem' }}>
                            {connectionMode === 'scanning' ? 'Buscando…' : 'Conectar'}
                        </button>
                    )}
                </div>

                {/* Telemetry pills when connected */}
                {connectionMode === 'connected' && (
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-green"><Battery size={9} /> 87%</span>
                        <span className="badge badge-teal"><Signal size={9} /> 95 dBm</span>
                        <span className="badge badge-teal"><Cpu size={9} /> FW 2.1.0</span>
                    </div>
                )}
            </div>

            {/* ┌─────────────────────────────────────────────────────────────────┐
         │  Input Mode Toggle                                              │
         └─────────────────────────────────────────────────────────────────┘ */}
            <div style={{
                display: 'flex', gap: '0.35rem', marginBottom: '0.75rem',
                background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)', padding: '0.25rem',
                border: '1px solid rgba(255,255,255,0.05)',
            }}>
                {(['ble', 'manual'] as const).map(mode => (
                    <button key={mode} onClick={() => setInputMode(mode)} style={{
                        flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)',
                        fontSize: '0.72rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                        background: inputMode === mode ? 'rgba(8,145,178,0.15)' : 'transparent',
                        color: inputMode === mode ? 'var(--teal-300)' : 'var(--text-muted)',
                        transition: 'all 0.25s ease',
                    }}>
                        {mode === 'ble' ? '📡 Bluetooth' : '✏️ Manual'}
                    </button>
                ))}
            </div>

            {/* ┌─────────────────────────────────────────────────────────────────┐
         │  Quadrant Protocol (Clock-face SVG)                             │
         └─────────────────────────────────────────────────────────────────┘ */}
            <div className="card" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <p style={{ fontSize: '0.78rem', fontWeight: 700 }}>Protocolo por Cuadrantes</p>
                    <span className="badge badge-teal">{completedQuadrants}/4</span>
                </div>

                {/* Clock-face SVG */}
                <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 200, margin: '0 auto', display: 'block' }}>
                    {/* Outer circle */}
                    <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(8,145,178,0.1)" strokeWidth="0.5" />

                    {/* Clock marks */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
                        const rad = (deg - 90) * Math.PI / 180;
                        const x1 = 100 + 80 * Math.cos(rad);
                        const y1 = 100 + 80 * Math.sin(rad);
                        const x2 = 100 + 88 * Math.cos(rad);
                        const y2 = 100 + 88 * Math.sin(rad);
                        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />;
                    })}

                    {/* Crosshair lines */}
                    <line x1="100" y1="12" x2="100" y2="188" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                    <line x1="12" y1="100" x2="188" y2="100" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

                    {/* Nipple center */}
                    <circle cx="100" cy="100" r="8" fill="rgba(8,145,178,0.2)" stroke="var(--teal-500)" strokeWidth="1" />
                    <circle cx="100" cy="100" r="3" fill="var(--teal-400)" />

                    {/* Quadrant areas */}
                    {/* SE (top-right) */}
                    <path d="M100,100 L100,15 A85,85 0 0,1 185,100 Z"
                        fill={quadrantStatus.se === 'complete' ? 'rgba(34,197,94,0.12)' : quadrantStatus.se === 'partial' ? 'rgba(234,179,8,0.08)' : 'rgba(255,255,255,0.02)'}
                        stroke={activeQuadrant === 'se' ? 'var(--teal-400)' : 'rgba(255,255,255,0.06)'}
                        strokeWidth={activeQuadrant === 'se' ? '2' : '0.5'}
                        style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                        onClick={() => handleQuadrantTap('se')} />
                    <text x="140" y="60" fill={quadrantStatus.se === 'complete' ? 'var(--green-400)' : 'var(--text-muted)'} fontSize="8" fontWeight="600" textAnchor="middle">SE</text>

                    {/* SI (top-left) */}
                    <path d="M100,100 L15,100 A85,85 0 0,1 100,15 Z"
                        fill={quadrantStatus.si === 'complete' ? 'rgba(34,197,94,0.12)' : quadrantStatus.si === 'partial' ? 'rgba(234,179,8,0.08)' : 'rgba(255,255,255,0.02)'}
                        stroke={activeQuadrant === 'si' ? 'var(--teal-400)' : 'rgba(255,255,255,0.06)'}
                        strokeWidth={activeQuadrant === 'si' ? '2' : '0.5'}
                        style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                        onClick={() => handleQuadrantTap('si')} />
                    <text x="60" y="60" fill={quadrantStatus.si === 'complete' ? 'var(--green-400)' : 'var(--text-muted)'} fontSize="8" fontWeight="600" textAnchor="middle">SI</text>

                    {/* IE (bottom-right) */}
                    <path d="M100,100 L185,100 A85,85 0 0,1 100,185 Z"
                        fill={quadrantStatus.ie === 'complete' ? 'rgba(34,197,94,0.12)' : quadrantStatus.ie === 'partial' ? 'rgba(234,179,8,0.08)' : 'rgba(255,255,255,0.02)'}
                        stroke={activeQuadrant === 'ie' ? 'var(--teal-400)' : 'rgba(255,255,255,0.06)'}
                        strokeWidth={activeQuadrant === 'ie' ? '2' : '0.5'}
                        style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                        onClick={() => handleQuadrantTap('ie')} />
                    <text x="140" y="146" fill={quadrantStatus.ie === 'complete' ? 'var(--green-400)' : 'var(--text-muted)'} fontSize="8" fontWeight="600" textAnchor="middle">IE</text>

                    {/* II (bottom-left) */}
                    <path d="M100,100 L100,185 A85,85 0 0,1 15,100 Z"
                        fill={quadrantStatus.ii === 'complete' ? 'rgba(34,197,94,0.12)' : quadrantStatus.ii === 'partial' ? 'rgba(234,179,8,0.08)' : 'rgba(255,255,255,0.02)'}
                        stroke={activeQuadrant === 'ii' ? 'var(--teal-400)' : 'rgba(255,255,255,0.06)'}
                        strokeWidth={activeQuadrant === 'ii' ? '2' : '0.5'}
                        style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                        onClick={() => handleQuadrantTap('ii')} />
                    <text x="60" y="146" fill={quadrantStatus.ii === 'complete' ? 'var(--green-400)' : 'var(--text-muted)'} fontSize="8" fontWeight="600" textAnchor="middle">II</text>
                </svg>

                {/* Active quadrant info */}
                {activeQuadrant && (
                    <div style={{
                        marginTop: '0.75rem', padding: '0.65rem',
                        background: 'rgba(8,145,178,0.06)', borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(8,145,178,0.15)',
                    }}>
                        <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--teal-300)', marginBottom: '0.25rem' }}>
                            Cuadrante {QUADRANTS.find(q => q.id === activeQuadrant)?.label} —{' '}
                            {QUADRANTS.find(q => q.id === activeQuadrant)?.clock}
                        </p>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                            Coloque el guante en este cuadrante y presione "Registrar" para capturar los datos de los 5 sensores.
                        </p>
                        <button onClick={handleCompleteQuadrant} className="btn btn-primary btn-block"
                            style={{ marginTop: '0.5rem', padding: '0.55rem', fontSize: '0.75rem' }}>
                            <Check size={14} /> Registrar Cuadrante
                        </button>
                    </div>
                )}

                {/* Progress */}
                <div style={{ marginTop: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        <span>Progreso del protocolo</span>
                        <span>{Math.round(protocolProgress)}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${protocolProgress}% ` }} />
                    </div>
                </div>
            </div>

            {/* ┌─────────────────────────────────────────────────────────────────┐
         │  Sensor Cards (5 sensors with gradient)                         │
         └─────────────────────────────────────────────────────────────────┘ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {inputMode === 'manual' ? 'Entrada Manual de Sensores' : 'Telemetría en Tiempo Real'}
                </p>

                {SENSORS.map(sensor => {
                    const value = manualValues[sensor.id];
                    const isExpanded = expandedSensor === sensor.id;

                    return (
                        <div key={sensor.id} style={{
                            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            {/* Collapsed row */}
                            <button
                                onClick={() => setExpandedSensor(isExpanded ? null : sensor.id)}
                                className={sensor.gradient}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                                    padding: '0.65rem 0.85rem', border: 'none', cursor: 'pointer',
                                    color: '#fff', fontSize: '0.78rem', fontWeight: 600,
                                    textAlign: 'left',
                                }}
                            >
                                <span style={{ fontSize: '1.1rem' }}>{sensor.emoji}</span>
                                <div style={{ flex: 1 }}>
                                    <span>{sensor.name}</span>
                                    <span style={{ fontSize: '0.62rem', opacity: 0.8, marginLeft: '0.4rem' }}>
                                        ({sensor.unit})
                                    </span>
                                </div>
                                <span style={{ fontSize: '1rem', fontWeight: 800 }}>
                                    {value || '—'}
                                </span>
                                <ChevronDown size={14} style={{
                                    transform: isExpanded ? 'rotate(180deg)' : 'none',
                                    transition: 'transform 0.25s',
                                    opacity: 0.7,
                                }} />
                            </button>

                            {/* Expanded detail */}
                            {isExpanded && (
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'hsl(var(--bg-card))',
                                }}>
                                    <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                        {sensor.desc} · Rango: {sensor.min}–{sensor.max} {sensor.unit}
                                    </p>
                                    {inputMode === 'manual' ? (
                                        <input
                                            type="number"
                                            step="0.1"
                                            min={sensor.min}
                                            max={sensor.max}
                                            placeholder={`Valor en ${sensor.unit} `}
                                            value={manualValues[sensor.id] || ''}
                                            onChange={(e) => setManualValues(prev => ({ ...prev, [sensor.id]: e.target.value }))}
                                            className="input animate-input-glow"
                                            style={{ fontSize: '0.82rem' }}
                                        />
                                    ) : (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        }}>
                                            <div className="progress-bar" style={{ flex: 1 }}>
                                                <div className="progress-bar-fill" style={{
                                                    width: `${((parseFloat(value || '0') - sensor.min) / (sensor.max - sensor.min)) * 100}% `,
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal-300)' }}>
                                                {value || '—'} {sensor.unit}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ┌─────────────────────────────────────────────────────────────────┐
         │  Integration Summary + CTA                                      │
         └─────────────────────────────────────────────────────────────────┘ */}
            <div className="card-teal" style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal-300)', marginBottom: '0.5rem' }}>
                    Información MSI
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', fontSize: '0.68rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Sensores</span>
                        <span style={{ fontWeight: 700 }}>
                            {Object.values(manualValues).filter(v => v).length}/5
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Precisión</span>
                        <span style={{ fontWeight: 700 }}>&lt;0.5cm</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Ortogonal</span>
                        <span style={{ fontWeight: 700, color: Object.values(manualValues).filter(v => v).length >= 3 ? 'var(--green-400)' : 'var(--text-muted)' }}>
                            {Object.values(manualValues).filter(v => v).length >= 3 ? '✓' : '⏳'}
                        </span>
                    </div>
                </div>
            </div>

            <button onClick={() => navigate('/3dmap')} className="btn btn-primary btn-block btn-lg">
                Guardar Sesión y Continuar <ArrowRight size={16} />
            </button>
        </div>
    );
}
