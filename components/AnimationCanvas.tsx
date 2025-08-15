
import React, { useState, useEffect, useCallback } from 'react';
import { generateImage, describeImage, generateAnimationPrompts } from '../services/geminiService';
import { 
    FilmIcon, PlayIcon, PauseIcon, SparklesIcon, AlertTriangleIcon, 
    LassoSelectIcon, PaintBrushIcon, EraserIcon, LayersIcon, ColorSwatchIcon,
    OnionSkinIcon, TrashIcon, DuplicateIcon, AddCircleIcon
} from './Icons';

type AnimationTool = 'select' | 'brush' | 'eraser' | 'ai' | 'layers' | 'palette' | 'onion-skin';

const BLANK_FRAME = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';


const AnimationCanvas: React.FC = () => {
    const [frames, setFrames] = useState<string[]>([]);
    const [basePrompt, setBasePrompt] = useState('A cute anime robot mascot, simple background, cel shaded');
    const [animationInstruction, setAnimationInstruction] = useState('It waves its hand slowly');
    const [numFramesToGenerate, setNumFramesToGenerate] = useState(8);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState('');

    const [currentFrame, setCurrentFrame] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [fps, setFps] = useState(12);
    
    const [activeTool, setActiveTool] = useState<AnimationTool>('ai');
    const [isOnionSkinEnabled, setIsOnionSkinEnabled] = useState(true);

    useEffect(() => {
        if (isPlaying && frames.length > 0) {
            const interval = setInterval(() => {
                setCurrentFrame(prev => (prev + 1) % frames.length);
            }, 1000 / fps);
            return () => clearInterval(interval);
        }
    }, [isPlaying, fps, frames]);

    const handleGenerateInitialScene = async () => {
        setIsLoading(true);
        setError(null);
        setFrames([]);
        setCurrentFrame(0);
        try {
            if (!basePrompt.trim()) throw new Error("Base prompt cannot be empty.");
            setProgressMessage('Generating base frame...');
            const imageB64 = await generateImage(basePrompt, '1:1');
            const imageUrl = `data:image/png;base64,${imageB64}`;
            setFrames([imageUrl]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setProgressMessage('');
        }
    };

    const handleGenerateInbetweens = useCallback(async () => {
        if (frames.length === 0) {
            setError("Please generate an initial scene first.");
            return;
        }
        setIsLoading(true);
        setError(null);
        
        try {
            const lastFrameB64 = frames[frames.length-1].split(',')[1];
            setProgressMessage('Analyzing last frame for context...');
            const promptForAnimation = await describeImage(lastFrameB64, 'image/png');

            setProgressMessage('Generating animation prompts...');
            const prompts = await generateAnimationPrompts(promptForAnimation, animationInstruction, numFramesToGenerate);

            if (!prompts || prompts.length === 0) {
                throw new Error("AI failed to generate animation prompts.");
            }

            const newFrames = [...frames];
            for (let i = 0; i < prompts.length; i++) {
                setProgressMessage(`Generating frame ${i + 1} of ${prompts.length}...`);
                const imageB64 = await generateImage(prompts[i], '1:1');
                const imageUrl = `data:image/png;base64,${imageB64}`;
                newFrames.push(imageUrl);
                setFrames([...newFrames]);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setProgressMessage('');
        }

    }, [animationInstruction, numFramesToGenerate, frames]);

    const handleAddBlankFrame = () => {
        setFrames(f => [...f, BLANK_FRAME]);
        setCurrentFrame(frames.length);
    };

    const handleDuplicateFrame = (index: number) => {
        const newFrames = [...frames];
        newFrames.splice(index + 1, 0, frames[index]);
        setFrames(newFrames);
    };

    const handleDeleteFrame = (index: number) => {
        if (frames.length <= 1) {
            setFrames([]);
            setCurrentFrame(0);
            return;
        }
        const newFrames = frames.filter((_, i) => i !== index);
        setFrames(newFrames);
        if (currentFrame >= index && currentFrame > 0) {
            setCurrentFrame(c => c - 1);
        }
    };


    const ToolbarButton = ({ tool, label, icon }: { tool: AnimationTool; label: string; icon: React.ReactNode; }) => {
        const isActive = activeTool === tool;
        const isToggle = tool === 'onion-skin';
        const isToggledOn = isToggle && isOnionSkinEnabled;

        const handleClick = () => {
            if (isToggle) {
                setIsOnionSkinEnabled(!isOnionSkinEnabled);
            } else {
                setActiveTool(tool);
            }
        };

        return (
            <button onClick={handleClick} title={label} className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors duration-200 ${ isToggledOn ? 'bg-indigo-600 text-white' : isActive ? 'bg-slate-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white' }`}>
                {icon}
            </button>
        )
    };

    const InspectorControl = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 tracking-wide">{label}</label>
            {children}
        </div>
    );
    
    const textInputClasses = "w-full bg-slate-800 text-slate-200 p-2.5 text-sm rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none placeholder-slate-500 transition-colors";
    const buttonClasses = "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center space-x-2 transform active:scale-[0.98] hover:shadow-lg hover:shadow-indigo-500/30 disabled:bg-slate-600 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed";

    return (
        <div className="w-full h-full bg-slate-900 flex text-white font-sans overflow-hidden animate-pop-in">
            {/* Left Toolbar */}
            <div className="w-20 bg-slate-800/50 p-3 flex flex-col items-center space-y-3 flex-shrink-0 border-r border-slate-700">
                <ToolbarButton tool="select" label="Select" icon={<LassoSelectIcon className="w-6 h-6"/>} />
                <ToolbarButton tool="brush" label="Brush" icon={<PaintBrushIcon className="w-6 h-6"/>} />
                <ToolbarButton tool="eraser" label="Eraser" icon={<EraserIcon className="w-6 h-6"/>} />
                <div className="w-full h-px bg-slate-700 my-2"></div>
                <ToolbarButton tool="ai" label="AI Tools" icon={<SparklesIcon className="w-6 h-6"/>} />
                <ToolbarButton tool="layers" label="Layers" icon={<LayersIcon className="w-6 h-6"/>} />
                <ToolbarButton tool="palette" label="Palette" icon={<ColorSwatchIcon className="w-6 h-6"/>} />
                <div className="w-full h-px bg-slate-700 my-2"></div>
                <ToolbarButton tool="onion-skin" label="Toggle Onion Skin" icon={<OnionSkinIcon className="w-6 h-6"/>} />
            </div>

            {/* Center Stage & Timeline */}
            <div className="flex-grow flex flex-col">
                <div className="flex-grow bg-black/50 flex items-center justify-center p-4 relative overflow-hidden">
                    {/* Viewport Content */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center z-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mb-4"></div>
                            <p className="text-lg font-medium text-slate-300">{progressMessage || "Generating..."}</p>
                        </div>
                    )}
                    {error && (
                        <div className="p-8 bg-red-900/50 border border-red-500/50 rounded-lg text-center max-w-md z-20">
                           <AlertTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                           <h3 className="text-lg font-bold text-white mb-1">Animation Failed</h3>
                           <p className="text-sm text-red-200">{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && frames.length === 0 && (
                         <div className="text-center text-slate-400 z-20">
                             <FilmIcon className="w-24 h-24 mx-auto mb-4" />
                             <h2 className="text-2xl font-bold text-white">Animation Studio</h2>
                             <p className="max-w-md mt-2">Use the AI Tools panel on the right to generate your first scene.</p>
                         </div>
                    )}
                    {/* Onion Skin & Main Frame */}
                    {frames.length > 0 && (
                        <>
                            {isOnionSkinEnabled && currentFrame > 0 && <img src={frames[currentFrame - 1]} className="max-w-full max-h-full object-contain absolute opacity-20 pointer-events-none" />}
                            <img src={frames[currentFrame]} alt={`Frame ${currentFrame + 1}`} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-black/50 relative z-10" />
                            {isOnionSkinEnabled && currentFrame < frames.length - 1 && <img src={frames[currentFrame + 1]} className="max-w-full max-h-full object-contain absolute opacity-20 pointer-events-none" />}
                        </>
                    )}
                </div>
                {/* Timeline */}
                <div className="h-48 bg-slate-800/50 p-2 border-t-2 border-slate-700 flex flex-shrink-0 items-center space-x-2">
                     <div className="flex-grow bg-black/20 h-full p-2 rounded-md flex items-center space-x-3 overflow-x-auto">
                        {frames.map((frame, index) => (
                           <div key={index} onClick={() => setCurrentFrame(index)} className={`relative h-full flex-shrink-0 group rounded-md cursor-pointer border-2 transition-all ${index === currentFrame ? 'border-indigo-500 scale-105 shadow-lg shadow-indigo-900/50' : 'border-transparent hover:border-slate-500'}`}>
                                <img src={frame} className="h-full w-auto object-cover rounded" alt={`Thumbnail ${index + 1}`}/>
                                <div className="absolute top-1 right-1 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => {e.stopPropagation(); handleDuplicateFrame(index)}} className="w-6 h-6 rounded-full bg-slate-900/80 hover:bg-indigo-600 text-white backdrop-blur-sm flex items-center justify-center"><DuplicateIcon className="w-4 h-4"/></button>
                                    <button onClick={(e) => {e.stopPropagation(); handleDeleteFrame(index)}} className="w-6 h-6 rounded-full bg-slate-900/80 hover:bg-red-600 text-white backdrop-blur-sm flex items-center justify-center"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-slate-900/80 text-white text-xs font-bold rounded">{index+1}</div>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAddBlankFrame} disabled={isLoading} title="Add Blank Frame" className="h-full w-24 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md flex flex-col items-center justify-center flex-shrink-0 disabled:opacity-50 transition-colors">
                        <AddCircleIcon className="w-8 h-8"/>
                    </button>
                </div>
            </div>
            
            {/* Right Inspector Panel */}
            <div className={`w-[380px] bg-slate-800 p-6 flex flex-col space-y-6 flex-shrink-0 h-full overflow-y-auto border-l border-slate-700 transition-all duration-300 ${activeTool === 'ai' ? 'mr-0' : '-mr-[380px]'}`}>
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white flex items-center"><SparklesIcon className="w-6 h-6 mr-2 text-indigo-400"/> AI Tools</h2>
                    <p className="text-sm text-slate-400">Use AI to generate scenes and motion.</p>
                </div>
                
                <div className="space-y-4 p-4 bg-slate-900/50 rounded-lg">
                    <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Scene Generation</h3>
                     <InspectorControl label="Base Prompt">
                        <textarea value={basePrompt} onChange={(e) => setBasePrompt(e.target.value)} placeholder="A knight standing in a field..." className={textInputClasses} rows={3} disabled={isLoading}/>
                    </InspectorControl>
                    <button onClick={handleGenerateInitialScene} disabled={isLoading || !basePrompt.trim()} className={buttonClasses}>Generate Scene</button>
                </div>

                <div className="space-y-4 p-4 bg-slate-900/50 rounded-lg">
                    <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">AI In-betweening</h3>
                     <InspectorControl label="Animation Instruction">
                        <textarea value={animationInstruction} onChange={(e) => setAnimationInstruction(e.target.value)} placeholder="The knight draws their sword..." className={textInputClasses} rows={2} disabled={isLoading}/>
                    </InspectorControl>
                     <InspectorControl label="Number of Frames">
                        <input type="number" value={numFramesToGenerate} onChange={(e) => setNumFramesToGenerate(Math.max(1, Number(e.target.value)))} className={textInputClasses} min="1" max="24" disabled={isLoading}/>
                    </InspectorControl>
                    <button onClick={handleGenerateInbetweens} disabled={isLoading || frames.length === 0} className={buttonClasses}>Generate In-betweens</button>
                </div>
                
                <div className="space-y-4 p-4 bg-slate-900/50 rounded-lg">
                     <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Playback</h3>
                     <InspectorControl label={`Frames per second (FPS): ${fps}`}>
                        <input type="range" min="1" max="30" value={fps} onChange={e => setFps(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" disabled={isLoading || frames.length === 0} />
                     </InspectorControl>
                     <button onClick={() => setIsPlaying(!isPlaying)} disabled={isLoading || frames.length === 0} className={buttonClasses}>
                        {isPlaying ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>}
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                     </button>
                </div>
            </div>
        </div>
    );
};

export default AnimationCanvas;
