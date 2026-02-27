import { create } from 'zustand';

// ─── Sensor types matching the 5-sensor glove ───────────────────────────────

export interface SensorData {
    pulse: number;        // Sensor sónico de pulso  (bpm)
    pressure: number;    // Sensor de presión        (kPa)
    ultrasound: number;  // Sensor de micro ultrasonido (m/s)
    temperature: number; // Sensor de temperatura    (°C)
    density: number;     // Sensor de densidad       (g/cm³)
}

export type BleStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error' | 'unavailable';

// ─── Lesion markers on the 3D model ─────────────────────────────────────────

export interface Lesion {
    id: string;
    position: [number, number, number];
    radius: number;        // 0.05 – 0.3
    severity: 1 | 2 | 3;  // 1=low, 2=medium, 3=high
    notes: string;
    createdAt: number;
}

// ─── Store definition ─────────────────────────────────────────────────────────

interface SensorStore {
    // Sensor readings
    data: SensorData;
    setData: (data: Partial<SensorData>) => void;

    // BLE connection
    bleStatus: BleStatus;
    bleDeviceName: string | null;
    setBleStatus: (status: BleStatus, deviceName?: string) => void;

    // Input mode
    isManual: boolean;
    setIsManual: (v: boolean) => void;

    // Lesion markers
    lesions: Lesion[];
    addLesion: (lesion: Lesion) => void;
    updateLesion: (id: string, patch: Partial<Omit<Lesion, 'id'>>) => void;
    removeLesion: (id: string) => void;

    // Selected lesion id (for inspector)
    selectedLesionId: string | null;
    selectLesion: (id: string | null) => void;
}

const DEFAULT_DATA: SensorData = {
    pulse: 72,
    pressure: 12.0,
    ultrasound: 1540,
    temperature: 36.5,
    density: 1.05,
};

export const useSensorStore = create<SensorStore>((set) => ({
    data: { ...DEFAULT_DATA },
    setData: (patch) =>
        set((state) => ({ data: { ...state.data, ...patch } })),

    bleStatus: 'disconnected',
    bleDeviceName: null,
    setBleStatus: (status, deviceName) =>
        set({ bleStatus: status, bleDeviceName: deviceName ?? null }),

    isManual: false,
    setIsManual: (v) => set({ isManual: v }),

    lesions: [
        {
            id: 'demo-1',
            position: [0.3, 0.2, 0.4],
            radius: 0.12,
            severity: 2,
            notes: 'Zona de alta densidad detectada',
            createdAt: Date.now(),
        },
    ],
    addLesion: (lesion) =>
        set((state) => ({ lesions: [...state.lesions, lesion] })),
    updateLesion: (id, patch) =>
        set((state) => ({
            lesions: state.lesions.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),
    removeLesion: (id) =>
        set((state) => ({
            lesions: state.lesions.filter((l) => l.id !== id),
            selectedLesionId:
                state.selectedLesionId === id ? null : state.selectedLesionId,
        })),

    selectedLesionId: null,
    selectLesion: (id) => set({ selectedLesionId: id }),
}));
