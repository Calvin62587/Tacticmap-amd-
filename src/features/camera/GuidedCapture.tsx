import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Camera, CheckCircle, Info, RotateCcw, ArrowRight,
    Sun, Ruler, RefreshCw, AlertCircle,
} from 'lucide-react';

/* ─── Shot definitions (8 positions for photogrammetry) ──────────────────── */
const SHOTS = [
    { id: 1, label: 'Frontal', instruction: 'Párese de frente, hombros relajados, cámara a la altura del pecho.', angle: 0, icon: '⬆' },
    { id: 2, label: '45° Der.', instruction: 'Gire 45° hacia la izquierda. Capture el ángulo oblicuo derecho.', angle: 45, icon: '↗' },
    { id: 3, label: 'Perfil Derecho', instruction: 'Gire 90° hacia la izquierda. Vista lateral derecha completa.', angle: 90, icon: '→' },
    { id: 4, label: '45° Post. Der.', instruction: 'Continúe girando. Capture la vista oblicua posterior derecha.', angle: 135, icon: '↘' },
    { id: 5, label: '45° Post. Izq.', instruction: 'Siga girando. Vista oblicua posterior izquierda.', angle: 225, icon: '↙' },
    { id: 6, label: 'Perfil Izquierdo', instruction: 'Gire 90° hacia su derecha. Vista lateral izquierda completa.', angle: 270, icon: '←' },
    { id: 7, label: '45° Izq.', instruction: 'Gire 45° hacia la derecha. Capture el ángulo oblicuo izquierdo.', angle: 315, icon: '↖' },
    { id: 8, label: 'Superior', instruction: 'De frente, eleve la cámara para capturar el ángulo superior.', angle: 360, icon: '⬆' },
];

/* Quality check thresholds */
const QUALITY_TIPS = [
    { icon: Sun, title: 'Iluminación Uniforme', desc: 'Evite sombras marcadas. Luz natural difusa o ring-light.' },
    { icon: Ruler, title: 'Distancia 50–70 cm', desc: 'Mantenga distancia constante para precisión <0.5 cm.' },
    { icon: RefreshCw, title: 'Rotación Completa', desc: 'Capture los 8 ángulos para cobertura 360° completa.' },
];

type Phase = 'prepare' | 'capture' | 'review';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  GuidedCapture — Guided photo capture for 3D reconstruction               */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function GuidedCapture() {
    const navigate = useNavigate();
    const [phase, setPhase] = useState<Phase>('prepare');
    const [currentShot, setCurrentShot] = useState(0);
    const [captured, setCaptured] = useState<boolean[]>(Array(SHOTS.length).fill(false));
    const [isCapturing, setIsCapturing] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const completedCount = captured.filter(Boolean).length;
    const progressPct = (completedCount / SHOTS.length) * 100;
    const allDone = completedCount === SHOTS.length;

    /* ── Camera start / stop ────────────────────────────────────────────── */
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch {
            // camera not available — continue with simulated mode
        }
    }, []);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }, []);

    /* ── Begin capture phase ────────────────────────────────────────────── */
    const handleBeginCapture = () => {
        setPhase('capture');
        startCamera();
    };

    /* ── Capture one shot ───────────────────────────────────────────────── */
    const handleCapture = () => {
        if (isCapturing) return;
        setIsCapturing(true);
        // simulate quality check + capture delay
        setTimeout(() => {
            setCaptured(prev => {
                const next = [...prev];
                next[currentShot] = true;
                return next;
            });
            setIsCapturing(false);
            if (currentShot < SHOTS.length - 1) {
                setTimeout(() => setCurrentShot(currentShot + 1), 400);
            }
        }, 1200);
    };

    /* ── Reset ──────────────────────────────────────────────────────────── */
    const handleReset = () => {
        stopCamera();
        setCaptured(Array(SHOTS.length).fill(false));
        setCurrentShot(0);
        setPhase('prepare');
    };

    /* ── Finish ─────────────────────────────────────────────────────────── */
    const handleFinish = () => {
        stopCamera();
        setPhase('review');
    };

    /* ═══════════════════════════════════════════════════════════════════════ */
    /*  Phase: PREPARE — Pre-capture instructions                             */
    /* ═══════════════════════════════════════════════════════════════════════ */
    if (phase === 'prepare') {
        return (
            <div className="screen-section">
                {/* Header */}
                <div className="section-header" style={{ marginBottom: '0.25rem' }}>
                    <Camera size={20} style={{ color: 'var(--teal-400)' }} />
                    <h2>Captura Multiángulo</h2>
                </div>

                {/* Info banner */}
                <div className="card-teal" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <Info size={16} style={{ color: 'var(--teal-300)', marginTop: 2, flexShrink: 0 }} />
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                            Para la reconstrucción 3D por fotogrametría se necesitan{' '}
                            <strong style={{ color: 'var(--teal-300)' }}>8 fotografías guiadas</strong> desde distintos ángulos.
                            <br /><br />
                            La resolución interna final (~0.5mm³) proviene de la{' '}
                            <strong style={{ color: 'var(--teal-300)' }}>fusión con los 5 sensores del guante</strong>, no solo de la cámara.
                            <br /><br />
                            Todo el procesamiento ocurre <strong>localmente</strong> en el dispositivo.
                        </div>
                    </div>
                </div>

                {/* Positioning guide image */}
                <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textAlign: 'center' }}>
                        Ubíquese correctamente para la captura
                    </p>
                    <img
                        src="/positioning-guide.png"
                        alt="Guía de posicionamiento para captura de 8 ángulos"
                        style={{
                            width: '100%',
                            maxWidth: 280,
                            margin: '0 auto',
                            display: 'block',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(8,145,178,0.15)',
                        }}
                    />
                    <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '0.5rem' }}>
                        8 posiciones de cámara · Gire lentamente · Mantenga distancia uniforme
                    </p>
                </div>

                {/* Tips */}
                <div className="card" style={{ padding: '0.5rem', marginBottom: '1rem' }}>
                    {QUALITY_TIPS.map((tip, idx) => {
                        const Icon = tip.icon;
                        return (
                            <div key={idx} className="tip-card">
                                <div className="tip-icon"><Icon size={14} style={{ color: 'var(--teal-400)' }} /></div>
                                <div className="tip-text">
                                    <h4>{tip.title}</h4>
                                    <p>{tip.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Precision stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <div className="data-stat">
                        <div className="data-stat-value">&lt;0.5cm</div>
                        <div className="data-stat-label">Precisión</div>
                    </div>
                    <div className="data-stat">
                        <div className="data-stat-value">8</div>
                        <div className="data-stat-label">Ángulos</div>
                    </div>
                    <div className="data-stat">
                        <div className="data-stat-value">360°</div>
                        <div className="data-stat-label">Cobertura</div>
                    </div>
                </div>

                {/* CTA */}
                <button onClick={handleBeginCapture} className="btn btn-primary btn-block btn-lg">
                    <Camera size={18} /> Iniciar Captura Guiada
                </button>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════════════════════════ */
    /*  Phase: CAPTURE — Active camera viewfinder                             */
    /* ═══════════════════════════════════════════════════════════════════════ */
    if (phase === 'capture') {
        const shot = SHOTS[currentShot];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* ── Viewfinder ──────────────────────────────────────────────── */}
                <div style={{
                    position: 'relative', flex: '0 0 52%', background: '#0a0e18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                    <video ref={videoRef} autoPlay playsInline muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    {/* Ghost silhouette overlay — changes per shot angle */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        pointerEvents: 'none',
                    }}>
                        <img
                            src={
                                [
                                    '/ghost-frontal.png',   // 1: Frontal
                                    '/ghost-45deg.png',     // 2: 45° Der.
                                    '/ghost-lateral.png',   // 3: Lateral Der.
                                    '/ghost-45deg.png',     // 4: 45° Post. Der.
                                    '/ghost-posterior.png',  // 5: Posterior
                                    '/ghost-45deg.png',     // 6: 45° Post. Izq.
                                    '/ghost-lateral.png',   // 7: Lateral Izq.
                                    '/ghost-45deg.png',     // 8: 45° Izq.
                                ][currentShot]
                            }
                            alt={`Posición ${shot.label}`}
                            style={{
                                height: '85%',
                                opacity: 0.45,
                                objectFit: 'contain',
                                mixBlendMode: 'screen',
                                filter: 'brightness(1.6)',
                                transform: [3, 5, 6, 7].includes(currentShot) ? 'scaleX(-1)' : 'none',
                                transition: 'all 0.4s ease',
                            }}
                        />
                        {/* Alignment hint */}
                        <span style={{
                            position: 'absolute', bottom: 56, left: '50%', transform: 'translateX(-50%)',
                            fontSize: '0.6rem', color: 'rgba(8,145,178,0.7)',
                            fontWeight: 600, whiteSpace: 'nowrap',
                            background: 'rgba(0,0,0,0.4)', padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                        }}>
                            Alinee su cuerpo con la silueta
                        </span>
                    </div>

                    {/* Frame corners */}
                    <div style={{ position: 'absolute', inset: '2rem' }}>
                        <div className="camera-frame-corner tl" />
                        <div className="camera-frame-corner tr" />
                        <div className="camera-frame-corner bl" />
                        <div className="camera-frame-corner br" />
                    </div>

                    {/* Scan line when capturing */}
                    {isCapturing && (
                        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                            <div className="animate-scan-line" style={{
                                position: 'absolute', width: '100%', height: 2,
                                background: 'linear-gradient(90deg, transparent, var(--teal-400), transparent)',
                            }} />
                        </div>
                    )}

                    {/* Top label */}
                    <div style={{
                        position: 'absolute', top: 12, left: 12,
                        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                        padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem', fontWeight: 700, color: '#fff',
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                    }}>
                        <span style={{ fontSize: '0.85rem' }}>{shot.icon}</span>
                        {shot.label}
                    </div>

                    {/* Shot counter */}
                    <div style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                        padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-full)',
                        fontSize: '0.68rem', fontWeight: 700, color: 'var(--teal-300)',
                    }}>
                        {currentShot + 1} / {SHOTS.length}
                    </div>

                    {/* Capture button */}
                    <div style={{ position: 'absolute', bottom: 16 }}>
                        <button
                            onClick={handleCapture}
                            disabled={isCapturing}
                            className={`capture-btn ${isCapturing ? 'capturing' : ''}`}
                            style={captured[currentShot] ? {} : {}}
                        >
                            <div className="capture-btn-inner" />
                        </button>
                    </div>
                </div>

                {/* ── Bottom panel ────────────────────────────────────────────── */}
                <div style={{ flex: 1, padding: '0.75rem 1.25rem', overflow: 'auto' }}>
                    {/* Instruction */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        marginBottom: '0.75rem',
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 'var(--radius-md)',
                            background: 'linear-gradient(135deg, var(--teal-500), var(--cyan-500))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.82rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                        }}>
                            {shot.id}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>{shot.label}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                                {shot.instruction}
                            </p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginBottom: '0.6rem' }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '0.25rem',
                        }}>
                            <span>Progreso de captura</span>
                            <span>{Math.round(progressPct)}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>

                    {/* Photo grid */}
                    <div className="photo-grid" style={{ marginBottom: '0.75rem' }}>
                        {SHOTS.map((s, idx) => (
                            <div
                                key={s.id}
                                className={`photo-grid-item ${captured[idx] ? 'completed' : idx === currentShot ? 'active' : ''
                                    }`}
                                onClick={() => !captured[idx] && setCurrentShot(idx)}
                                style={{ cursor: !captured[idx] ? 'pointer' : 'default' }}
                            >
                                {captured[idx] ? (
                                    <CheckCircle size={14} />
                                ) : (
                                    <span>{s.id}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={handleReset} className="btn btn-secondary" style={{ flex: 1 }}>
                            <RotateCcw size={14} /> Reiniciar
                        </button>
                        {allDone ? (
                            <button onClick={handleFinish} className="btn btn-primary" style={{ flex: 2 }}>
                                Continuar al 3D <ArrowRight size={14} />
                            </button>
                        ) : (
                            <button disabled className="btn btn-secondary" style={{ flex: 2, opacity: 0.4 }}>
                                Capture las 8 fotos
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════════════════════════ */
    /*  Phase: REVIEW — Post-capture quality summary                          */
    /* ═══════════════════════════════════════════════════════════════════════ */
    return (
        <div className="screen-section">
            <div className="section-header">
                <CheckCircle size={20} style={{ color: 'var(--green-400)' }} />
                <h2>Captura Completa</h2>
            </div>

            <p className="section-subtitle">
                Las 8 fotografías han sido capturadas exitosamente. El modelo 3D de superficie está listo para reconstrucción.
            </p>

            {/* Quality scores */}
            <div className="card" style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    Calidad de Captura
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    <div className="data-stat">
                        <div className="data-stat-value" style={{ color: 'var(--green-400)' }}>100%</div>
                        <div className="data-stat-label">Cobertura</div>
                    </div>
                    <div className="data-stat">
                        <div className="data-stat-value" style={{ color: 'var(--green-400)' }}>8/8</div>
                        <div className="data-stat-label">Fotos</div>
                    </div>
                    <div className="data-stat">
                        <div className="data-stat-value">&lt;0.5cm</div>
                        <div className="data-stat-label">Precisión</div>
                    </div>
                    <div className="data-stat">
                        <div className="data-stat-value" style={{ color: 'var(--green-400)' }}>✓</div>
                        <div className="data-stat-label">Enfoque</div>
                    </div>
                </div>
            </div>

            {/* Shot thumbnails */}
            <div className="card" style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Fotos Capturadas
                </p>
                <div className="photo-grid">
                    {SHOTS.map(s => (
                        <div key={s.id} className="photo-grid-item completed" style={{
                            aspectRatio: '1', fontSize: '0.6rem',
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <CheckCircle size={14} />
                                <div style={{ fontSize: '0.55rem', marginTop: 2 }}>{s.label.split(' ')[0]}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Next steps */}
            <div className="card-teal" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <Info size={14} style={{ color: 'var(--teal-300)' }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal-300)' }}>Próximo paso</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Conecte el guante multimodal para el <strong style={{ color: 'var(--teal-300)' }}>protocolo de escaneo por cuadrantes</strong>.
                    Los 5 sensores se fusionarán con el modelo 3D.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleReset} className="btn btn-secondary" style={{ flex: 1 }}>
                    <RotateCcw size={14} /> Repetir
                </button>
                <button onClick={() => navigate('/sensors')}
                    className="btn btn-primary" style={{ flex: 2 }}>
                    Ir al Escaneo con Guante <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
