"use client";
import { X } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface'; // Reutilizando a interface existente

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
    if (!isOpen) return null;

    return (
        <>
            <svg style={{ display: "none" }}>
                <filter
                    id="glass-distortion-chat"
                    x="0%"
                    y="0%"
                    width="100%"
                    height="100%"
                    filterUnits="objectBoundingBox"
                >
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.002 0.01"
                        numOctaves="3"
                        seed="42"
                        result="turbulence"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 .1
                     0 0 0 0 .1
                     0 0 0 0 .1
                     0 0 0 0 1"
                        in="turbulence"
                        result="coloredNoise"
                    />
                    <feComponentTransfer in="coloredNoise" result="mapped">
                        <feFuncR type="gamma" amplitude="1" exponent="1" offset="0" />
                        <feFuncG type="gamma" amplitude="1" exponent="1" offset="0" />
                        <feFuncB type="gamma" amplitude="1" exponent="1" offset="0" />
                    </feComponentTransfer>
                    <feGaussianBlur in="turbulence" stdDeviation="5" result="softMap" />
                    <feSpecularLighting
                        in="softMap"
                        surfaceScale="20"
                        specularConstant="1.2"
                        specularExponent="40"
                        lightingColor="#ffffff"
                        result="specLight"
                    >
                        <fePointLight x="100" y="-100" z="500" />
                        {/* Luz vindo da direita/topo para o painel lateral */}
                    </feSpecularLighting>

                    <feComposite
                        in="specLight"
                        in2="SourceAlpha"
                        operator="in"
                        result="specLightMasked"
                    />

                    <feComposite
                        in="specLightMasked"
                        in2="SourceGraphic"
                        operator="arithmetic"
                        k1="0"
                        k2="1"
                        k3="1"
                        k4="0"
                        result="litImage"
                    />

                    <feDisplacementMap
                        in="litImage"
                        in2="softMap"
                        scale="30"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </svg>

            {/* Overlay Backdrop - Invisível e sem blur para permitir visualização, mas captura clique para fechar */}
            <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />

            {/* Painel Lateral Copilot - Slide In da Direita */}
            <div className="fixed top-0 right-0 h-full w-[480px] z-50 flex flex-col overflow-hidden bg-zinc-950 border-l border-white/10 animate-in slide-in-from-right duration-500 shadow-2xl">

                {/* Camada de Efeito Vulto */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-hard-light"
                    style={{
                        filter: "url(#glass-distortion-chat)",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.0) 50%, rgba(255,255,255,0.05) 100%)",
                        boxShadow: "inset 2px 0 5px rgba(255,255,255,0.1), inset -5px 0 10px rgba(0,0,0,0.5)"
                    }}
                />

                {/* Header do Copilot */}
                <div className="relative z-20 flex justify-between items-center p-5 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-500 blur-sm opacity-50 rounded-full animate-pulse" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500 relative z-10" />
                        </div>
                        <div>
                            <h3 className="text-zinc-100 font-bold tracking-wide text-sm uppercase">SARA Copilot</h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Orchestrator Online</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Interface de Chat */}
                <div className="relative z-20 flex-1 overflow-hidden">
                    <ChatInterface />
                </div>
            </div>
        </>
    );
}
