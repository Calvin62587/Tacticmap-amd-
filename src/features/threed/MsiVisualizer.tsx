import { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
    Layers, Thermometer, Box, Activity, Plus, Trash2, Edit3,
    CheckCircle, XCircle, AlertTriangle, FileUp, Image, Stethoscope,
} from 'lucide-react';
import { useSensorStore, Lesion } from '../../store/useSensorStore';

// ─── Layer Types ────────────────────────────────────────────────────────────
type LayerType = 'all' | 'heat' | 'density' | 'ultrasound';

// ─── External exam type ─────────────────────────────────────────────────────
interface ExternalExam {
    id: string;
    type: 'mammography' | 'ultrasound' | 'mri' | 'biopsy' | 'other';
    label: string;
    date: string;
    notes: string;
    finding?: string;
}

// ─── Semi-transparent Breast Model using LatheGeometry ──────────────────────
// Redesigned for glass-like translucency so internal lesions are visible
function BreastLobe({ side, activeLayer }: {
    side: 'left' | 'right';
    activeLayer: LayerType;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Anatomical lathe profile
    const profilePoints = [
        new THREE.Vector2(0.01, 0.0),
        new THREE.Vector2(0.38, 0.0),
        new THREE.Vector2(0.52, 0.08),
        new THREE.Vector2(0.54, 0.22),
        new THREE.Vector2(0.50, 0.38),
        new THREE.Vector2(0.40, 0.55),
        new THREE.Vector2(0.24, 0.70),
        new THREE.Vector2(0.10, 0.82),
        new THREE.Vector2(0.05, 0.88),
        new THREE.Vector2(0.03, 0.91),
        new THREE.Vector2(0.015, 0.94),
        new THREE.Vector2(0.01, 0.96),
    ];

    // Glass-like appearance — very low opacity for translucency
    const config = {
        // Semi-transparent but anatomical — warm skin tone, less wireframe
        all: { color: '#c4988a', opacity: 0.35, emissive: '#1a3a4a', emissiveI: 0.06 },
        heat: { color: '#ef6060', opacity: 0.28, emissive: '#7f1d1d', emissiveI: 0.12 },
        density: { color: '#9b7cf6', opacity: 0.30, emissive: '#3b0764', emissiveI: 0.08 },
        ultrasound: { color: '#5b9cf6', opacity: 0.28, emissive: '#1e3a5f', emissiveI: 0.08 },
    }[activeLayer];

    const xDir = side === 'left' ? -1 : 1;

    // Subtle breathing animation
    useFrame((state) => {
        if (meshRef.current) {
            const breathe = Math.sin(state.clock.elapsedTime * 0.55) * 0.004;
            meshRef.current.scale.setScalar(1 + breathe);
        }
    });

    return (
        <group
            position={[xDir * 0.62, -0.28, 0]}
            rotation={[Math.PI / 2, 0, 0]}
        >
            {/* Anatomical semi-transparent shell */}
            <mesh ref={meshRef}>
                <latheGeometry args={[profilePoints, 64]} />
                <meshPhysicalMaterial
                    color={config.color}
                    transparent
                    opacity={config.opacity}
                    side={THREE.DoubleSide}
                    roughness={0.45}
                    metalness={0.0}
                    transmission={0.35}
                    thickness={0.4}
                    ior={1.35}
                    depthWrite={false}
                    emissive={config.emissive}
                    emissiveIntensity={config.emissiveI}
                />
            </mesh>

            {/* Inner subtle wireframe (very faint) */}
            <mesh>
                <latheGeometry args={[
                    profilePoints.map(p => new THREE.Vector2(p.x * 0.92, p.y)),
                    32
                ]} />
                <meshBasicMaterial
                    color={config.color}
                    transparent
                    opacity={0.02}
                    wireframe
                    depthWrite={false}
                />
            </mesh>

            {/* Nipple — opaque marker */}
            <mesh position={[0, 0, 0.96]}>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshStandardMaterial
                    color="#0891b2"
                    emissive="#0891b2"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.85}
                    roughness={0.4}
                />
            </mesh>

            {/* Quadrant reference lines (subtle) */}
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([0, 0, 0, 0, 0, 0.95])}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#0891b2" transparent opacity={0.08} />
            </line>
        </group>
    );
}

function BreastModel({ activeLayer, onBackgroundClick }: { activeLayer: LayerType; onBackgroundClick?: () => void }) {
    return (
        <group onClick={(e) => { if (onBackgroundClick) { e.stopPropagation(); onBackgroundClick(); } }}>
            <BreastLobe side="left" activeLayer={activeLayer} />
            <BreastLobe side="right" activeLayer={activeLayer} />

            {/* Chest wall (subtle grid plane) */}
            <mesh position={[0, -0.28, -0.02]} rotation={[0, 0, 0]}>
                <planeGeometry args={[2.8, 1.4]} />
                <meshStandardMaterial
                    color="#0e1a2b"
                    transparent
                    opacity={0.08}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Grid reference on chest wall */}
            <gridHelper
                args={[2.4, 12, 'rgba(8,145,178,0.08)', 'rgba(8,145,178,0.04)']}
                position={[0, -0.28, 0]}
                rotation={[Math.PI / 2, 0, 0]}
            />
        </group>
    );
}

// ─── Orthogonal Plane Visuals ────────────────────────────────────────────────
function OrthoPlanes({ axial, sagittal, coronal }: { axial: number; sagittal: number; coronal: number }) {
    return (
        <group>
            {/* Semi-transparent colored planes */}
            <mesh position={[0, axial, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[3.5, 3.5]} />
                <meshBasicMaterial color="#22d3ee" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            <gridHelper args={[3.5, 20, '#22d3ee', '#164e63']} position={[0, axial, 0]} />

            <mesh position={[sagittal, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[3.5, 3.5]} />
                <meshBasicMaterial color="#f472b6" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            <gridHelper args={[3.5, 20, '#f472b6', '#831843']} position={[sagittal, 0, 0]} rotation={[0, 0, Math.PI / 2]} />

            <mesh position={[0, 0, coronal]} rotation={[0, 0, 0]}>
                <planeGeometry args={[3.5, 3.5]} />
                <meshBasicMaterial color="#a3e635" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            <gridHelper args={[3.5, 20, '#a3e635', '#365314']} position={[0, 0, coronal]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
    );
}

// ─── Lesion Sphere with internal glow ────────────────────────────────────────
function LesionMarker({ lesion, isSelected, onClick }: {
    lesion: Lesion;
    isSelected: boolean;
    onClick: () => void;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const { data } = useSensorStore();

    const tempNorm = Math.min(Math.max((data.temperature - 35.0) / 4.0, 0), 1);
    const densityScale = 0.8 + ((data.density - 0.9) / 0.4) * 0.5;

    const severityColor = ['#facc15', '#f97316', '#ef4444'][lesion.severity - 1];
    const pulseColor = `hsl(${(1 - tempNorm) * 40}, 100%, 60%)`;
    const finalColor = tempNorm > 0.5 ? pulseColor : severityColor;

    useFrame((state) => {
        if (meshRef.current) {
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
            const s = lesion.radius * densityScale * pulse * (isSelected ? 1.3 : 1);
            meshRef.current.scale.setScalar(s);
        }
        if (glowRef.current) {
            const glow = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
            const s = lesion.radius * densityScale * glow * 2.5;
            glowRef.current.scale.setScalar(s);
        }
    });

    return (
        <group position={lesion.position}>
            {/* Outer glow halo — visible through transparent model */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[1, 24, 24]} />
                <meshBasicMaterial
                    color={finalColor}
                    transparent
                    opacity={0.08}
                    depthWrite={false}
                />
            </mesh>

            {/* Core lesion sphere */}
            <mesh
                ref={meshRef}
                onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                    color={finalColor}
                    emissive={finalColor}
                    emissiveIntensity={isSelected ? 3.0 : 1.8}
                    transparent
                    opacity={0.85}
                    roughness={0.3}
                />
            </mesh>

            {/* Point light — lesion glows through the glass */}
            <pointLight color={finalColor} intensity={isSelected ? 1.2 : 0.6} distance={1.2} />

            {/* Small floating tooltip — sprite mode so it always faces camera */}
            {isSelected && (
                <Html center sprite distanceFactor={4} style={{ pointerEvents: 'none' }}>
                    <div style={{
                        background: 'rgba(10,14,24,0.92)',
                        border: '1px solid #0891b2',
                        color: '#67e8f9',
                        fontSize: '9px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        transform: 'translateY(-18px)',
                    }}>
                        Sev. {lesion.severity} · r={lesion.radius.toFixed(2)}cm
                    </div>
                </Html>
            )}
        </group>
    );
}

// ─── Lesion Inspector Panel ──────────────────────────────────────────────────
function LesionInspector({ lesionId, onClose }: { lesionId: string; onClose: () => void }) {
    const { lesions, updateLesion, removeLesion } = useSensorStore();
    const lesion = lesions.find(l => l.id === lesionId);
    if (!lesion) return null;

    const SeverityIcon = lesion.severity === 3 ? AlertTriangle : lesion.severity === 2 ? Edit3 : CheckCircle;
    const sevColors = ['var(--yellow-400)', 'var(--orange-400)', 'var(--red-400)'];

    return (
        <div style={{
            margin: '0 1.25rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)',
            background: 'rgba(10,14,24,0.92)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(8,145,178,0.25)',
        }}>
            {/* Prominent close bar */}
            <button onClick={onClose} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.3rem', padding: '0.4rem', marginBottom: '0.5rem',
                background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.2)',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--teal-300)',
                fontSize: '0.68rem', fontWeight: 600,
            }}>
                <XCircle size={13} /> Cerrar inspector — Volver al análisis
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <SeverityIcon size={14} style={{ color: sevColors[lesion.severity - 1] }} />
                    Inspector de Lesión
                </h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <XCircle size={16} />
                </button>
            </div>

            {/* Severity selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem', marginBottom: '0.5rem' }}>
                {([1, 2, 3] as const).map(s => (
                    <button key={s} onClick={() => updateLesion(lesionId, { severity: s })}
                        style={{
                            padding: '0.35rem', borderRadius: 'var(--radius-sm)',
                            fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer',
                            border: `1px solid ${lesion.severity === s ? 'var(--teal-400)' : 'rgba(255,255,255,0.08)'}`,
                            background: lesion.severity === s ? 'rgba(8,145,178,0.15)' : 'transparent',
                            color: lesion.severity === s ? 'var(--teal-300)' : 'var(--text-muted)',
                        }}>
                        {['Baja', 'Media', 'Alta'][s - 1]}
                    </button>
                ))}
            </div>

            {/* Size slider */}
            <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                    Tamaño (radio): {lesion.radius.toFixed(2)} cm
                </label>
                <input type="range" min={0.05} max={0.3} step={0.01}
                    value={lesion.radius}
                    onChange={e => updateLesion(lesionId, { radius: parseFloat(e.target.value) })}
                    style={{ width: '100%', height: 3 }}
                />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                    Notas clínicas
                </label>
                <textarea
                    value={lesion.notes}
                    onChange={e => updateLesion(lesionId, { notes: e.target.value })}
                    className="input"
                    rows={2}
                    style={{ fontSize: '0.72rem', resize: 'none' }}
                />
            </div>

            {/* Coordinates */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem', marginBottom: '0.5rem' }}>
                {['X', 'Y', 'Z'].map((axis, i) => (
                    <span key={axis} style={{
                        fontSize: '0.6rem', fontFamily: 'monospace', textAlign: 'center',
                        color: 'var(--text-muted)',
                    }}>
                        {axis}: {lesion.position[i].toFixed(2)}
                    </span>
                ))}
            </div>

            <button onClick={() => { removeLesion(lesionId); onClose(); }}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.3rem', fontSize: '0.68rem', color: 'var(--red-400)',
                    border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)',
                    padding: '0.4rem', background: 'transparent', cursor: 'pointer',
                }}>
                <Trash2 size={13} /> Eliminar lesión
            </button>
        </div>
    );
}

// ─── External Exam Panel ─────────────────────────────────────────────────────
const EXAM_TYPES = [
    { id: 'mammography', label: 'Mamografía', icon: Image, color: '#f59e0b' },
    { id: 'ultrasound', label: 'Ecografía', icon: Activity, color: '#3b82f6' },
    { id: 'mri', label: 'RM / IRM', icon: Box, color: '#8b5cf6' },
    { id: 'biopsy', label: 'Biopsia', icon: Stethoscope, color: '#ef4444' },
    { id: 'other', label: 'Otro', icon: FileUp, color: '#6b7280' },
] as const;

function ExternalExamPanel({ exams, onAdd }: {
    exams: ExternalExam[];
    onAdd: (exam: ExternalExam) => void;
}) {
    const [adding, setAdding] = useState(false);
    const [newType, setNewType] = useState<string>('mammography');
    const [newDate, setNewDate] = useState('');
    const [newNotes, setNewNotes] = useState('');
    const [newFinding, setNewFinding] = useState('');

    const handleSubmit = () => {
        if (!newDate) return;
        onAdd({
            id: `exam-${Date.now()}`,
            type: newType as ExternalExam['type'],
            label: EXAM_TYPES.find(e => e.id === newType)?.label ?? 'Examen',
            date: newDate,
            notes: newNotes,
            finding: newFinding,
        });
        setAdding(false);
        setNewDate('');
        setNewNotes('');
        setNewFinding('');
    };

    return (
        <div style={{ margin: '0 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Exámenes Complementarios
                </p>
                <button onClick={() => setAdding(!adding)} className="badge badge-teal" style={{ cursor: 'pointer', border: 'none' }}>
                    <Plus size={9} /> Agregar
                </button>
            </div>

            {/* Existing exams */}
            {exams.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.5rem' }}>
                    {exams.map(exam => {
                        const cfg = EXAM_TYPES.find(e => e.id === exam.type);
                        const Icon = cfg?.icon ?? FileUp;
                        return (
                            <div key={exam.id} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.45rem 0.6rem', borderRadius: 'var(--radius-md)',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                            }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                                    background: `${cfg?.color ?? '#666'}20`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Icon size={13} style={{ color: cfg?.color }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{exam.label}</span>
                                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>
                                        {exam.date}
                                    </span>
                                    {exam.finding && (
                                        <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                                            {exam.finding}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {exams.length === 0 && !adding && (
                <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'center', padding: '0.5rem' }}>
                    Agregue mamografías, ecografías, IRM u otros resultados para correlacionar con el modelo 3D.
                </p>
            )}

            {/* Add form */}
            {adding && (
                <div style={{
                    padding: '0.6rem', borderRadius: 'var(--radius-md)',
                    background: 'rgba(8,145,178,0.04)', border: '1px solid rgba(8,145,178,0.12)',
                }}>
                    {/* Type selector */}
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        {EXAM_TYPES.map(et => {
                            const Icon = et.icon;
                            return (
                                <button key={et.id} onClick={() => setNewType(et.id)}
                                    style={{
                                        padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.6rem', fontWeight: 600, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.2rem',
                                        border: `1px solid ${newType === et.id ? et.color : 'rgba(255,255,255,0.06)'}`,
                                        background: newType === et.id ? `${et.color}15` : 'transparent',
                                        color: newType === et.id ? et.color : 'var(--text-muted)',
                                    }}>
                                    <Icon size={10} /> {et.label}
                                </button>
                            );
                        })}
                    </div>

                    <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                        className="input" style={{ fontSize: '0.72rem', marginBottom: '0.35rem' }} />

                    <input type="text" placeholder="Hallazgo principal (ej: BIRADS 2)"
                        value={newFinding} onChange={e => setNewFinding(e.target.value)}
                        className="input" style={{ fontSize: '0.72rem', marginBottom: '0.35rem' }} />

                    <textarea placeholder="Notas adicionales..."
                        value={newNotes} onChange={e => setNewNotes(e.target.value)}
                        className="input" rows={2}
                        style={{ fontSize: '0.72rem', marginBottom: '0.35rem', resize: 'none' }} />

                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button onClick={() => setAdding(false)} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.68rem', padding: '0.4rem' }}>
                            Cancelar
                        </button>
                        <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1, fontSize: '0.68rem', padding: '0.4rem' }}>
                            <Plus size={12} /> Guardar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Main Visualizer
// ═══════════════════════════════════════════════════════════════════════════════
export default function MsiVisualizer() {
    const [activeLayer, setActiveLayer] = useState<LayerType>('all');
    const [axial, setAxial] = useState(2);
    const [sagittal, setSagittal] = useState(2);
    const [coronal, setCoronal] = useState(2);
    const [showPlanes, setShowPlanes] = useState(false);
    const [externalExams, setExternalExams] = useState<ExternalExam[]>([]);

    const { lesions, addLesion, selectedLesionId, selectLesion } = useSensorStore();

    const addNewLesion = useCallback(() => {
        const id = `lesion-${Date.now()}`;
        addLesion({
            id,
            position: [
                (Math.random() - 0.5) * 0.8,
                (Math.random() - 0.5) * 0.5,
                (Math.random()) * 0.4,
            ],
            radius: 0.1,
            severity: 1,
            notes: '',
            createdAt: Date.now(),
        });
        selectLesion(id);
    }, [addLesion, selectLesion]);

    const addExternalExam = (exam: ExternalExam) => {
        setExternalExams(prev => [...prev, exam]);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.5rem', position: 'relative', overflow: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1.25rem 0' }}>
                <div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Análisis 3D</h2>
                    <span className="step-badge" style={{ fontSize: '0.6rem', marginTop: '0.1rem', display: 'inline-flex' }}>
                        Modelo Semitransparente MSI
                    </span>
                </div>
                <div className={lesions.length > 0 ? 'badge badge-yellow' : 'badge badge-green'}>
                    {lesions.length > 0 ? `${lesions.length} hallazgo${lesions.length !== 1 ? 's' : ''}` : 'Sin hallazgos'}
                </div>
            </div>

            {/* 3D Canvas */}
            <div style={{
                borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative',
                border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                background: '#050a14', height: showPlanes ? '36vh' : '44vh',
                margin: '0 1.25rem',
            }}>
                <Canvas camera={{ position: [0, 0.2, 3.2], fov: 48 }}>
                    <ambientLight intensity={0.4} />
                    <spotLight position={[6, 8, 6]} angle={0.25} penumbra={1} intensity={1.2} castShadow />
                    <spotLight position={[-6, -4, -4]} angle={0.25} penumbra={1} intensity={0.4} color="#0891b2" />
                    <pointLight position={[0, 0, 2]} intensity={0.3} color="#22d3ee" />

                    <BreastModel activeLayer={activeLayer} onBackgroundClick={() => selectLesion(null)} />
                    {showPlanes && <OrthoPlanes axial={-axial} sagittal={-sagittal} coronal={-coronal} />}

                    {lesions.map(lesion => (
                        <LesionMarker
                            key={lesion.id}
                            lesion={lesion}
                            isSelected={selectedLesionId === lesion.id}
                            onClick={() => selectLesion(selectedLesionId === lesion.id ? null : lesion.id)}
                        />
                    ))}

                    <Environment preset="studio" />
                    <ContactShadows position={[0, -1.2, 0]} opacity={0.15} scale={5} blur={3} far={3} />

                    {/* Full 3-axis rotation + zoom */}
                    <OrbitControls
                        enableZoom
                        enablePan
                        enableRotate
                        minDistance={0.8}
                        maxDistance={8}
                        zoomSpeed={0.8}
                        rotateSpeed={0.6}
                    /* No polar angle restriction — full 3-axis rotation */
                    />
                </Canvas>

                {/* Layer toggles */}
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4, pointerEvents: 'auto' }}>
                    {([
                        ['all', 'Integrado', Layers],
                        ['heat', 'Térmico', Thermometer],
                        ['density', 'Densidad', Box],
                        ['ultrasound', 'Ultrasonido', Activity],
                    ] as const).map(([key, label, Icon]) => (
                        <button
                            key={key}
                            onClick={() => setActiveLayer(key)}
                            className={`layer-toggle ${activeLayer === key ? 'active' : ''}`}
                        >
                            <Icon size={11} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Resolution stats */}
                <div style={{
                    position: 'absolute', top: 10, right: 10, textAlign: 'right',
                    padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)',
                    background: 'rgba(10,14,24,0.7)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Resolución MSI</p>
                    <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--teal-300)', fontFamily: 'monospace' }}>~0.5mm³</p>
                    <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: 2 }}>5 sensores</p>
                </div>

                {/* Add lesion FAB */}
                <button onClick={addNewLesion}
                    style={{
                        position: 'absolute', bottom: 10, right: 10,
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--teal-500), var(--teal-600))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer', color: '#fff',
                        boxShadow: '0 4px 14px rgba(8,145,178,0.4)',
                    }}
                    title="Agregar lesión">
                    <Plus size={20} />
                </button>

                {/* Planes toggle */}
                <button
                    onClick={() => setShowPlanes(v => !v)}
                    className={`layer-toggle ${showPlanes ? 'active' : ''}`}
                    style={{ position: 'absolute', bottom: 10, left: 10 }}>
                    Planos ortog.
                </button>
            </div>

            {/* Lesion Inspector */}
            {selectedLesionId && (
                <LesionInspector
                    lesionId={selectedLesionId}
                    onClose={() => selectLesion(null)}
                />
            )}

            {/* Orthogonal plane sliders */}
            {showPlanes && !selectedLesionId && (
                <div className="glass-panel" style={{ margin: '0 1.25rem', padding: '0.75rem 1rem' }}>
                    <h3 style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Planos de Corte</h3>
                    {[
                        { label: 'Axial (Y)', value: axial, set: setAxial },
                        { label: 'Sagital (X)', value: sagittal, set: setSagittal },
                        { label: 'Coronal (Z)', value: coronal, set: setCoronal },
                    ].map(({ label, value, set }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', width: 75, flexShrink: 0 }}>{label}</span>
                            <input type="range" min={-1.5} max={2} step={0.05}
                                value={value}
                                onChange={e => set(parseFloat(e.target.value))}
                                style={{ flex: 1, height: 3 }}
                            />
                            <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--text-muted)', width: 36, textAlign: 'right' }}>{value.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            )}

            {!showPlanes && !selectedLesionId && (
                <p style={{ fontSize: '0.68rem', textAlign: 'center', color: 'var(--text-dim)', padding: '0 1.25rem' }}>
                    Rota en 3 ejes · Zoom con pinch/scroll · Toca lesión para inspeccionar · <span style={{ color: 'var(--teal-400)' }}>Planos</span> para cortes internos
                </p>
            )}

            {/* External Exams Section */}
            {!selectedLesionId && (
                <ExternalExamPanel exams={externalExams} onAdd={addExternalExam} />
            )}

            {/* Share CTA */}
            {!selectedLesionId && (
                <div style={{ padding: '0 1.25rem', paddingBottom: '1rem' }}>
                    <button
                        onClick={() => alert('Análisis 3D exportado — función de compartir con médico próximamente.')}
                        className="btn btn-primary btn-block"
                        style={{ padding: '0.8rem', fontSize: '0.82rem' }}>
                        📧 Compartir análisis con Médico
                    </button>
                </div>
            )}
        </div>
    );
}
