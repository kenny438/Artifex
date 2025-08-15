import React, { useState, FormEvent } from 'react';
import { generateUI } from '../services/geminiService';
import { SparklesIconV2 } from './Icons';

const DesignCanvas: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const examplePrompts = [
        "A login form for a space-themed app",
        "A vibrant pricing page with 3 tiers",
        "A recipe card for chocolate chip cookies",
        "A minimalist contact form",
        "A user profile card with a profile picture",
        "A landing page hero section for a SaaS company"
    ];

    const handleSubmit = async (e: FormEvent, currentPrompt: string) => {
        e.preventDefault();
        if (!currentPrompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setGeneratedHtml(null);

        try {
            const html = await generateUI(currentPrompt);
            setGeneratedHtml(html);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleExampleClick = (example: string) => {
        setPrompt(example);
        handleSubmit({ preventDefault: () => {} } as FormEvent, example);
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ease-in-out animate-pop-in" style={{ fontFamily: "'Manrope', sans-serif" }}>
            
            {/* Main Artboard */}
            <div className="w-full max-w-5xl h-full bg-white rounded-2xl shadow-2xl shadow-slate-300/40 border border-slate-200/80 flex items-center justify-center p-2 relative overflow-hidden">
                 <div className="w-full h-full rounded-xl overflow-auto p-4">
                    {isLoading && (
                         <div className="w-full h-full flex items-center justify-center">
                            <div className="w-full h-full rounded-lg bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 animate-pulse"></div>
                         </div>
                    )}
                    {error && (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg">Generation Failed</h3>
                            <p className="text-slate-500 text-sm max-w-md">{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && generatedHtml && (
                        <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: generatedHtml }} />
                    )}
                    {!isLoading && !error && !generatedHtml && (
                         <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <SparklesIconV2 className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-800">AI Design Canvas</h2>
                            <p className="text-slate-500 max-w-lg mt-1">Describe a UI component, and watch it come to life. Start by typing in the prompt bar below, or try an example.</p>
                             <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                {examplePrompts.slice(0, 3).map(p => (
                                    <button key={p} onClick={() => handleExampleClick(p)} className="bg-slate-100/80 text-slate-600 hover:bg-slate-200/90 hover:text-slate-800 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors">
                                        {p}
                                    </button>
                                ))}
                            </div>
                         </div>
                    )}
                 </div>
            </div>

            {/* Prompt Bar */}
            <form onSubmit={(e) => handleSubmit(e, prompt)} className="absolute bottom-6 w-full max-w-2xl px-2">
                <div className="relative w-full">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A pricing page with three feature tiers..."
                        className="w-full pl-5 pr-32 py-4 text-base bg-white/80 backdrop-blur-md rounded-xl shadow-2xl shadow-slate-400/30 border border-slate-200/50 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-all transform active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        <SparklesIconV2 className="w-5 h-5" />
                        <span>Generate</span>
                    </button>
                </div>
            </form>

        </div>
    );
};

export default DesignCanvas;
