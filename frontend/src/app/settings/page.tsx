"use client";

import { useState } from 'react';
import { Settings, Cpu, Globe, Bell, ShieldAlert, Save, RefreshCw, Trash } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    // Simulated State
    const [model, setModel] = useState('gemini-2.0-flash');
    const [temperature, setTemperature] = useState(0.7);
    const [language, setLanguage] = useState('pt-BR');
    const [notifications, setNotifications] = useState(true);

    const handleSave = () => {
        toast.success("Configurações salvas com sucesso!");
    };

    const handleReset = () => {
        if (confirm("Tem certeza? Isso apagará todos os dados do projeto atual.")) {
            // In a real app this would call the API to clear data
            toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
                loading: 'Resetando sistema...',
                success: 'Sistema reiniciado. Recarregue a página.',
                error: 'Erro no reset.'
            });
        }
    };

    return (
        <div className="h-full flex flex-col bg-zinc-950 p-8 overflow-y-auto no-scrollbar">
            <header className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                    <Settings className="text-zinc-200" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
                    <p className="text-zinc-500 text-sm">Global System Configuration</p>
                </div>
            </header>

            <div className="space-y-8 max-w-4xl pb-20">

                {/* AI Configuration */}
                <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Cpu size={20} className="text-purple-500" />
                        Intelligence Engine
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Modelo Principal</label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:ring-2 focus:ring-purple-500/50 outline-none"
                            >
                                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Powerful)</option>
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Balanced)</option>
                            </select>
                            <p className="text-xs text-zinc-500 mt-2">Determina a velocidade e capacidade de raciocínio da SARA.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Criatividade (Temperatura): {temperature}</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                className="w-full accent-purple-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-zinc-600 mt-2">
                                <span>Conservador</span>
                                <span>Criativo</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Interface Preferences */}
                <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Globe size={20} className="text-blue-500" />
                        Interface & Region
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Idioma da UI</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:ring-2 focus:ring-blue-500/50 outline-none"
                            >
                                <option value="pt-BR">Português (Brasil)</option>
                                <option value="en-US">English (US)</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <Bell size={20} className="text-zinc-500" />
                                <div>
                                    <p className="text-sm font-medium text-zinc-300">Notificações Sonoras</p>
                                    <p className="text-xs text-zinc-600">Feedback de áudio para tasks.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="border border-red-900/30 bg-red-900/5 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-red-500 mb-6 flex items-center gap-2">
                        <ShieldAlert size={20} />
                        Danger Zone
                    </h2>

                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="text-sm text-zinc-400">
                            <p className="font-bold text-zinc-300">Factory Reset</p>
                            <p>Apaga permanentemente todas as tarefas, histórico e arquivos gerados.</p>
                        </div>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Trash size={16} /> Resetar Projeto
                        </button>
                    </div>
                </section>

                {/* Save Button */}
                <div className="fixed bottom-8 right-8">
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-white text-black font-bold rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <Save size={18} /> Salvar Alterações
                    </button>
                </div>

            </div>
        </div>
    );
}
