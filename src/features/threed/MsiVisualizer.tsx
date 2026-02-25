import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Layers, Thermometer, Box, Activity } from 'lucide-react';

type LayerType = 'all' | 'heat' | 'density' | 'ultrasound';

function TopographyModel({ activeLayer }: { activeLayer: LayerType }) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Animate breathing/slight movement
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
        }
    });

    // Dynamic colors based on active MSI layer
    const getMaterialColor = () => {
        switch (activeLayer) {
            case 'heat': return '#ef4444'; // Red-ish for heat map
            case 'density': return '#8b5cf6'; // Purple for density/stiffness
            case 'ultrasound': return '#3b82f6'; // Blue for echogenicity
            default: return '#e2e8f0'; // Default gray-white skin tone baseline
        }
    };

    const getDistort = () => {
        switch (activeLayer) {
            case 'density': return 0.6; // High distortion for density map
            case 'heat': return 0.3;
            default: return 0.4;
        }
    };

    return (
        <mesh ref={meshRef} position={[0, 0, 0]} scale={1.5}>
            <sphereGeometry args={[1, 64, 64]} />
            <MeshDistortMaterial
                color={getMaterialColor()}
                envMapIntensity={1}
                clearcoat={0.8}
                clearcoatRoughness={0.2}
                metalness={0.1}
                roughness={0.4}
                distort={getDistort()} // Amount of distortion
                speed={1.5} // Speed of movement
            />

            {/* Simulated Anomaly Node (Tumor/Cyst simulation) */}
            {(activeLayer === 'all' || activeLayer === 'heat') && (
                <mesh position={[0.7, 0.5, 0.6]} scale={0.15}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
                    <pointLight color="#ff0000" intensity={0.5} distance={1} />
                </mesh>
            )}

            {(activeLayer === 'all' || activeLayer === 'density') && (
                <mesh position={[-0.5, -0.4, 0.8]} scale={0.2}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial color="#8b5cf6" wireframe />
                </mesh>
            )}
        </mesh>
    );
}

export default function MsiVisualizer() {
    const [activeLayer, setActiveLayer] = useState<LayerType>('all');

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex justify-between items-center mb-2 px-1">
                <h2 className="text-xl font-bold">Mapeo 3D (NeRF)</h2>
                <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
                    Render Edge Local
                </div>
            </div>

            <div className="flex-1 rounded-2xl overflow-hidden relative border border-slate-700 shadow-2xl bg-slate-900">
                <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                    <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.5} color="#4f46e5" />

                    <TopographyModel activeLayer={activeLayer} />

                    <Environment preset="city" />
                    <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
                    <OrbitControls enableZoom={true} enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.5} />
                </Canvas>

                {/* 3D UI Overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                    <div className="glass-panel p-2 flex flex-col gap-1 pointer-events-auto">
                        <LayerButton
                            icon={<Layers size={16} />}
                            label="Integrado"
                            active={activeLayer === 'all'}
                            onClick={() => setActiveLayer('all')}
                        />
                        <LayerButton
                            icon={<Thermometer size={16} />}
                            label="Termografía"
                            active={activeLayer === 'heat'}
                            onClick={() => setActiveLayer('heat')}
                        />
                        <LayerButton
                            icon={<Box size={16} />}
                            label="Densidad"
                            active={activeLayer === 'density'}
                            onClick={() => setActiveLayer('density')}
                        />
                        <LayerButton
                            icon={<Activity size={16} />}
                            label="Ultrasonido"
                            active={activeLayer === 'ultrasound'}
                            onClick={() => setActiveLayer('ultrasound')}
                        />
                    </div>

                    <div className="glass-panel p-3 h-fit text-right">
                        <p className="text-xs text-slate-400">Resolución</p>
                        <p className="font-mono text-sm font-bold text-blue-400">0.5mm³</p>
                        <p className="text-xs text-slate-400 mt-2">Vectores</p>
                        <p className="font-mono text-sm font-bold text-purple-400">1.2M</p>
                    </div>
                </div>
            </div>

            <p className="text-xs text-center text-slate-500 pb-2">
                Interaccione con el modelo (zoom, rotar). Los puntos brillantes representan anomalías detectadas en la integración ortogonal.
            </p>
        </div>
    );
}

function LayerButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all text-sm font-medium ${active
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
