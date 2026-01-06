"use client";
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Cpu } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-zinc-950">
            {/* Background Texture - Grid/Tech Vibe */}
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                }}
            />

            {/* Glow Effects */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />

            <div className="container relative z-10 px-6 mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="space-y-8"
                >
                    <div className="flex justify-center gap-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-[0.2em] text-yellow-500 border border-yellow-500/30 uppercase rounded-full bg-yellow-500/5">
                            <Terminal size={12} />
                            Orquestração de Agentes
                        </span>
                        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-[0.2em] text-blue-400 border border-blue-400/30 uppercase rounded-full bg-blue-400/5">
                            <Cpu size={12} />
                            AI Powered
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                        SOMA<span className="text-yellow-500">DEV</span> <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-white">INTELLIGENCE.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-zinc-400 font-light leading-relaxed">
                        O futuro do desenvolvimento de software.
                        Uma equipe de agentes autônomos prontos para construir, testar e implantar suas ideias.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                        <button className="group relative px-8 py-4 bg-yellow-500 text-black font-bold uppercase tracking-widest text-sm transition-transform hover:scale-105 active:scale-95 rounded-sm">
                            <span>Iniciar Projeto</span>
                            <div className="absolute inset-0 border border-yellow-300 translate-x-1 translate-y-1 -z-10 bg-transparent group-hover:translate-x-2 group-hover:translate-y-2 transition-transform" />
                        </button>
                        <button className="px-8 py-4 text-white font-bold uppercase tracking-widest text-sm hover:text-yellow-500 transition-colors flex items-center gap-2 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10">
                            Ver Agentes <ArrowRight size={16} />
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500 opacity-50">
                <span className="text-[10px] uppercase tracking-widest">Scroll</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-zinc-500 to-transparent" />
            </div>
        </section>
    );
}
