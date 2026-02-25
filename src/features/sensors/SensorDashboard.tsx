import { useState, useEffect } from 'react';
import { Activity, Bluetooth, BluetoothConnected, Thermometer, Box, Zap, Sun, UploadCloud } from 'lucide-react';

interface SensorData {
    heat: number;
    density: number;
    conductivity: number;
    ultrasound: number;
    ultraviolet: number;
}

export default function SensorDashboard() {
    const [bleStatus, setBleStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [isManual, setIsManual] = useState(false);
    const [data, setData] = useState<SensorData>({
        heat: 36.5,
        density: 1.05,
        conductivity: 0.5,
        ultrasound: 1540,
        ultraviolet: 2.1
    });

    const connectBLE = () => {
        setBleStatus('connecting');
        // Simulate Web Bluetooth connection delay
        setTimeout(() => {
            setBleStatus('connected');
        }, 2000);
    };

    // Simulate incoming real-time data when connected
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (bleStatus === 'connected' && !isManual) {
            interval = setInterval(() => {
                setData(prev => ({
                    heat: prev.heat + (Math.random() * 0.2 - 0.1),
                    density: prev.density + (Math.random() * 0.02 - 0.01),
                    conductivity: prev.conductivity + (Math.random() * 0.05 - 0.025),
                    ultrasound: prev.ultrasound + (Math.random() * 10 - 5),
                    ultraviolet: prev.ultraviolet + (Math.random() * 0.1 - 0.05)
                }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [bleStatus, isManual]);

    const handleManualChange = (field: keyof SensorData, value: string) => {
        setData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    const syncData = () => {
        // Simulate secure edge-to-cloud sync
        alert('Firmas multimodales guardadas de forma segura y cifrada (AES-256) en el dispositivo.');
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Telemetría SaMD</h2>
                <button
                    onClick={() => setIsManual(!isManual)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${isManual ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                >
                    {isManual ? 'Modo Manual' : 'Modo Automático'}
                </button>
            </div>

            {/* BLE Connection Card */}
            <div className={`glass-panel p-4 flex items-center justify-between transition-colors ${bleStatus === 'connected' ? 'border-blue-500/50 bg-blue-500/10' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${bleStatus === 'connected' ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
                        {bleStatus === 'connected' ? <BluetoothConnected className="text-blue-400" size={24} /> : <Bluetooth className="text-slate-400" size={24} />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Dispositivo Multisensor</h3>
                        <p className="text-xs text-muted-foreground">
                            {bleStatus === 'disconnected' && 'Listo para emparejar (BLE 5.0)'}
                            {bleStatus === 'connecting' && 'Conectando de forma segura...'}
                            {bleStatus === 'connected' && 'Conectado - Recibiendo telemetría'}
                        </p>
                    </div>
                </div>

                {bleStatus === 'disconnected' && (
                    <button onClick={connectBLE} className="btn bg-blue-600 hover:bg-blue-500 text-white py-1.5 px-3 text-xs">
                        Conectar
                    </button>
                )}
                {bleStatus === 'connecting' && (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
            </div>

            {/* 5 Sensors Grid */}
            <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto pb-4">
                <SensorCard
                    icon={<Thermometer size={18} className="text-orange-400" />}
                    name="Calor (Térmico)"
                    value={data.heat.toFixed(1)}
                    unit="°C"
                    field="heat"
                    isManual={isManual}
                    onChange={handleManualChange}
                />
                <SensorCard
                    icon={<Box size={18} className="text-indigo-400" />}
                    name="Densidad (Presión)"
                    value={data.density.toFixed(2)}
                    unit="g/cm³"
                    field="density"
                    isManual={isManual}
                    onChange={handleManualChange}
                />
                <SensorCard
                    icon={<Zap size={18} className="text-yellow-400" />}
                    name="Conductividad"
                    value={data.conductivity.toFixed(2)}
                    unit="S/m"
                    field="conductivity"
                    isManual={isManual}
                    onChange={handleManualChange}
                />
                <SensorCard
                    icon={<Activity size={18} className="text-teal-400" />}
                    name="Ultrasonido"
                    value={data.ultrasound.toFixed(0)}
                    unit="m/s"
                    field="ultrasound"
                    isManual={isManual}
                    onChange={handleManualChange}
                />
                <SensorCard
                    icon={<Sun size={18} className="text-purple-400" />}
                    name="Ultravioleta"
                    value={data.ultraviolet.toFixed(2)}
                    unit="mW/cm²"
                    field="ultraviolet"
                    isManual={isManual}
                    onChange={handleManualChange}
                    fullWidth
                />
            </div>

            <button onClick={syncData} className="btn btn-primary w-full flex items-center justify-center gap-2 mt-auto">
                <UploadCloud size={18} />
                <span>Guardar en Edge Seguro</span>
            </button>
        </div>
    );
}

function SensorCard({ icon, name, value, unit, field, isManual, onChange, fullWidth = false }: any) {
    return (
        <div className={`glass-panel p-3 flex flex-col justify-between ${fullWidth ? 'col-span-2' : ''}`}>
            <div className="flex items-center gap-2 mb-2 text-slate-300">
                {icon}
                <span className="text-xs font-semibold">{name}</span>
            </div>
            {isManual ? (
                <div className="flex items-center gap-2 mt-1">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(field, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-xs text-slate-400">{unit}</span>
                </div>
            ) : (
                <div className="flex items-end gap-1 mt-1">
                    <span className="text-2xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                        {value}
                    </span>
                    <span className="text-xs text-slate-400 mb-1">{unit}</span>
                </div>
            )}
        </div>
    );
}
