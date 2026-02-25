import { AlertCircle, ShieldCheck, Activity, Brain, FileText, ChevronRight } from 'lucide-react';

export default function RiskResults() {
    const cdssResult = {
        nivel_riesgo_triaje: "CAMBIO A VIGILAR",
        recomendacion_accionable: "Recomendación de evaluación diagnóstica estándar (ecografía clínica preferente) en los próximos 30 días.",
        justificacion_clinica: "Se detectó un gradiente térmico focal asimétrico y un vector de rigidez tisular de 14 KPa no documentado en la baseline de hace 6 meses. La integración ortogonal sugiere una correlación espacial que requiere validación ecográfica, alineado a directrices NCCN para vigilancia activa."
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Resumen de Triaje</h2>
                <div className="flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/50">
                    <Brain size={14} />
                    <span>CDSS RAG Activo</span>
                </div>
            </div>

            {/* Main Risk Target Card */}
            <div className="glass-panel text-center p-6 border-yellow-500/30 glow-yellow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                <AlertCircle size={48} className="text-yellow-400 mx-auto mb-4" />
                <h3 className="text-sm text-slate-400 font-semibold mb-1">ESTRATIFICACIÓN DE RIESGO</h3>
                <p className="text-2xl font-bold text-yellow-400 mb-2">{cdssResult.nivel_riesgo_triaje}</p>
                <p className="text-xs text-slate-500 bg-black/40 inline-block px-3 py-1 rounded-full w-fit mx-auto mt-2">
                    Confianza del Modelo: 94.2%
                </p>
            </div>

            {/* Actionable Recommendation */}
            <div className="glass-panel p-5 bg-blue-900/10 border-blue-500/20">
                <div className="flex items-center gap-2 mb-3">
                    <Activity size={20} className="text-blue-400" />
                    <h4 className="font-semibold text-white">Recomendación Accionable</h4>
                </div>
                <p className="text-sm text-blue-100 leading-relaxed border-l-2 border-blue-500 pl-4 py-1">
                    {cdssResult.recomendacion_accionable}
                </p>
            </div>

            {/* Clinical Justification (RAG Output) */}
            <div className="glass-panel p-5 bg-slate-900/50 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={20} className="text-green-400" />
                        <h4 className="font-semibold text-white text-sm">Justificación Clínica</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">Basado en normas OMS/NCCN</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed text-justify">
                    {cdssResult.justificacion_clinica}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-800">
                    <h5 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                        <FileText size={14} /> Fuentes Citadas (RAG)
                    </h5>
                    <ul className="text-[10px] text-slate-500 space-y-2">
                        <li className="flex items-center justify-between hover:text-slate-300 transition-colors cursor-pointer">
                            <span>[1] NCCN Guidelines v2.2023 - Clinical Validation</span>
                            <ChevronRight size={14} />
                        </li>
                        <li className="flex items-center justify-between hover:text-slate-300 transition-colors cursor-pointer">
                            <span>[2] Telemetry Baseline Analysis (Historial Paciente)</span>
                            <ChevronRight size={14} />
                        </li>
                    </ul>
                </div>
            </div>

            <p className="text-[10px] text-center text-slate-600 px-4 pb-2">
                Aviso SaMD: Este reporte es un instrumento de estratificación de riesgo no diagnóstico. Consulte a su profesional de la salud.
            </p>
        </div>
    );
}
