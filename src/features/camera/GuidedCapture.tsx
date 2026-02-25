import { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, Info, Scan, ArrowRight } from 'lucide-react';

type CaptureState = 'onboarding' | 'permission' | 'capturing' | 'processing' | 'done';

export default function GuidedCapture() {
    const [state, setState] = useState<CaptureState>('onboarding');
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Handle camera permission and stream
    useEffect(() => {
        if (state === 'capturing') {
            const startCamera = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'user' }
                    });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    // Fallback if no camera
                }
            };
            startCamera();

            // Simulate auto-alignment and capture after 5 seconds
            const alignmentTimer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(alignmentTimer);
                        setState('processing');
                        return 100;
                    }
                    return prev + 2; // Takes ~5 seconds to reach 100 at 100ms interval
                });
            }, 100);

            return () => {
                clearInterval(alignmentTimer);
                stopCamera();
            };
        }
    }, [state]);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    // Simulate processing time
    useEffect(() => {
        if (state === 'processing') {
            stopCamera();
            const timer = setTimeout(() => {
                setState('done');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [state]);

    const renderOnboarding = () => (
        <div className="flex flex-col items-center justify-center p-6 h-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/30">
                <Camera className="text-blue-400" size={40} />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Mapeo Anatómico
            </h2>
            <div className="glass-panel text-left space-y-4 text-sm text-slate-300">
                <p className="flex items-start gap-3">
                    <Info className="text-blue-400 mt-0.5 shrink-0" size={18} />
                    <span>Para obtener un modelo 3D preciso, utilizaremos la cámara de su dispositivo de forma segura y privada.</span>
                </p>
                <p className="flex items-start gap-3">
                    <Scan className="text-purple-400 mt-0.5 shrink-0" size={18} />
                    <span>Alinee la silueta que aparecerá en pantalla con su cuerpo. El sistema tomará las imágenes automáticamente cuando detecte el ángulo correcto.</span>
                </p>
            </div>
            <button
                onClick={() => setState('capturing')}
                className="btn btn-primary mt-8 w-full font-semibold flex items-center justify-center gap-2"
            >
                <span>Comenzar Captura</span>
                <ArrowRight size={18} />
            </button>
            <p className="text-xs text-slate-500 mt-4">Todo el procesamiento de imágenes se realiza localmente. Ninguna foto cruda se envía a la nube.</p>
        </div>
    );

    const renderCapturing = () => (
        <div className="camera-view-container">
            {/* Live Video Feed (fallback to black/gradient if no camera) */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover opacity-80"
            />

            {/* Silhouette SVG Overlay */}
            <div className="silhouette-overlay">
                <svg viewBox="0 0 200 300" className="w-[80%] max-h-[80%] opacity-40">
                    <path
                        d="M100 20 C100 20, 60 50, 40 100 C20 150, 50 250, 50 250 L150 250 C150 250, 180 150, 160 100 C140 50, 100 20, 100 20 Z"
                        fill="none"
                        stroke={progress > 80 ? "#4ade80" : "#60a5fa"}
                        strokeWidth="4"
                        strokeDasharray="10, 10"
                    />
                    {/* Abstract breast indicators */}
                    <circle cx="70" cy="150" r="30" fill="none" stroke={progress > 80 ? "#4ade80" : "#60a5fa"} strokeWidth="2" strokeDasharray="5, 5" />
                    <circle cx="130" cy="150" r="30" fill="none" stroke={progress > 80 ? "#4ade80" : "#60a5fa"} strokeWidth="2" strokeDasharray="5, 5" />
                </svg>

                {/* Scanning Animation Line */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent h-10 w-full animate-[scanLine_3s_ease-in-out_infinite]" />
            </div>

            <div className="ui-overlay">
                <div className="text-center bg-black/50 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <p className="text-lg font-semibold text-white mb-2">Alineando silueta...</p>
                    <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
                <div className="flex justify-center mb-8">
                    <div className={`p-4 rounded-full backdrop-blur-md transition-colors ${progress > 80 ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                        <Scan className={progress > 80 ? 'text-green-400' : 'text-blue-400'} size={32} />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProcessing = () => (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-r-4 border-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center text-blue-400">
                    <Box size={32} />
                </div>
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Generando Modelo 3D</h3>
                <p className="text-slate-400 text-sm">Aplicando segmentación NeRF Edge...</p>
            </div>
        </div>
    );

    const renderDone = () => (
        <div className="flex flex-col items-center justify-center p-6 h-full text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 mb-4 animate-[pulseGlow_2s_infinite]">
                <CheckCircle className="text-green-400" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white">Captura Completada</h2>
            <p className="text-slate-300 text-sm max-w-xs">
                El mapeo anatómico 3D de alta resolución se ha generado exitosamente en su dispositivo.
            </p>
            <button
                onClick={() => { setState('onboarding'); setProgress(0); }}
                className="btn bg-slate-800 text-white mt-8 px-8 py-3 w-full border border-slate-700"
            >
                Reiniciar Captura
            </button>
        </div>
    );

    return (
        <div className="h-full w-full relative">
            {state === 'onboarding' && renderOnboarding()}
            {state === 'capturing' && renderCapturing()}
            {state === 'processing' && renderProcessing()}
            {state === 'done' && renderDone()}
        </div>
    );
}

// Simple fallback icon if Box is missing
function Box(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
    );
}
