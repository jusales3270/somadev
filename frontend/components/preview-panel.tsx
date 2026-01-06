export function PreviewPanel() {
    return (
        <div className="w-full h-full bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>

            <div className="text-center z-10 p-6">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800 group-hover:border-indigo-500/50 transition-colors shadow-2xl shadow-indigo-900/20">
                    <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-slate-200 font-medium mb-1">Live Preview</h3>
                <p className="text-slate-500 text-sm max-w-[200px] mx-auto">
                    A aplicação será renderizada aqui em tempo real.
                </p>
                <div className="mt-6 flex justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-700 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-slate-700 animate-bounce delay-75"></span>
                    <span className="w-2 h-2 rounded-full bg-slate-700 animate-bounce delay-150"></span>
                </div>
            </div>

            {/* Mock overlay for "loading" or "building" state */}
            {/* <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-mono text-sm">Building...</span>
            </div> */}
        </div>
    )
}
