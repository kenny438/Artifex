
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { LintError } from '../types';
import { 
    FilesIcon, SearchIcon, PlayIcon, BookOpenIcon, 
    FolderIcon, CodeBracketIcon, ChevronDownIcon, ChevronRightIcon, XMarkIcon,
    AlertTriangleIcon, TerminalIcon, SparklesIcon
} from './Icons';
import { parseImageScript, generateImage } from '../services/geminiService';


// --- MOCK FILE SYSTEM ---
const initialFiles = {
    "Welcome.md": `# Welcome to the ImageScript IDE

This is a dedicated environment for writing and managing your ImageScript files.

- Use the **Explorer** on the left to navigate your scripts.
- Click a file to open it in a new tab.
- The **Run** button in the status bar or Activity Bar will execute your script and show the result on the right.
- The editor features **syntax highlighting** and real-time **error linting**.
- Check the **Problems** tab below for any syntax errors.
- The **Output** tab shows the final prompt generated from your script.
- Access the full **ImageScript Book** from the Activity Bar for detailed documentation.
`,
    "recipes": {
        "character-design.imagescript": `// A photorealistic character concept.
create person "old, weathered fisherman" {
    description: "face like a roadmap, kind eyes, thick white beard";
    wearing: "a thick, hand-knit wool sweater and a beanie";
    action: "staring out at a stormy sea, a thoughtful expression";
}

set scene "on the deck of a small fishing boat" {
    weather: "stormy, waves crashing, sea spray";
    lighting: "dramatic, overcast lighting";
}

set style {
    type: "photograph";
    realism: "hyperrealistic, sharp focus";
}

set camera {
    lens: "85mm f/1.4 portrait lens";
    angle: "medium close-up shot";
    focus: "sharp on the man's face, background is blurred";
}`,
        "fantasy-landscape.imagescript": `// An epic fantasy landscape.
create scene "a hidden valley with a crystal clear lake" {
    details: "giant, ancient trees with glowing moss, floating islands in the sky";
    atmosphere: "magical, serene, untouched";
}

set style {
    type: "epic fantasy digital painting";
    artist: "in the style of Studio Ghibli and Thomas Kinkade";
}

set palette {
    colors: "vibrant greens, deep blues, and soft, glowing yellows";
}`,
    },
    "README.md": `# Project: My Image Creations
A collection of my best ImageScripts.`
};

// --- TYPES ---
interface Tab { name: string; content: string; }
interface GenerationResult { status: 'idle' | 'loading' | 'success' | 'error'; data: string | null; }

// --- CORE UTILS: SYNTAX HIGHLIGHTING & LINTING ---
const highlightSyntax = (code: string) => {
    return code
        .replace(/(&)/g, '&amp;')
        .replace(/(<)/g, '&lt;')
        .replace(/(>)/g, '&gt;')
        .replace(/\b(create|set)\b/g, '<span class="text-fuchsia-500 font-semibold">$1</span>') // Keywords
        .replace(/\b(person|creature|object|vehicle|building|scene|style|camera|palette)\b/g, '<span class="text-sky-600">$1</span>') // Types
        .replace(/(\w+)(?=:)/g, '<span class="text-blue-500">$1</span>') // Properties
        .replace(/(".*?")/g, '<span class="text-amber-600">$1</span>') // Strings
        .replace(/(\/\/.*)/g, '<span class="text-slate-400 italic">$1</span>'); // Comments
};

const lintScript = (code: string): LintError[] => {
    const errors: LintError[] = [];
    const lines = code.split('\n');
    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        // Check for missing semicolon on a property line
        if (line.trim().match(/\w+\s*:\s*".*"\s*$/)) {
            errors.push({ line: lineNumber, message: "Missing semicolon at the end of the line." });
        }
    });
    return errors;
};


// --- IDE SUB-COMPONENTS ---
const ActivityBar: React.FC<{ onRun: () => void, onDocs: () => void }> = ({ onRun, onDocs }) => {
    const iconClass = "w-10 h-10 p-2 rounded-lg cursor-pointer transition-colors";
    const activeClass = "bg-indigo-100 text-indigo-600";
    const inactiveClass = "text-slate-500 hover:bg-slate-200";

    return (
        <div className="w-16 h-full bg-slate-100 border-r border-slate-200 flex flex-col items-center py-4 space-y-4 flex-shrink-0">
            <button className={`${iconClass} ${activeClass}`} title="Explorer"><FilesIcon /></button>
            <button className={`${iconClass} ${inactiveClass}`} title="Search (Coming Soon)"><SearchIcon /></button>
            <button onClick={onRun} className={`${iconClass} ${inactiveClass}`} title="Run Script"><PlayIcon /></button>
            <button onClick={onDocs} className={`${iconClass} ${inactiveClass}`} title="Documentation"><BookOpenIcon /></button>
        </div>
    );
};

const FileTree: React.FC<{ node: any; name: string; onFileSelect: (name: string, content: string) => void; }> = ({ node, name, onFileSelect }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (typeof node === 'string') {
        const isImageScript = name.endsWith('.imagescript');
        return (
            <div onClick={() => onFileSelect(name, node)} className="flex items-center space-x-2 pl-4 pr-2 py-1 cursor-pointer rounded-md hover:bg-slate-200/60">
                {isImageScript ? <CodeBracketIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" /> : <BookOpenIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                <span className="text-sm text-slate-700 truncate">{name}</span>
            </div>
        );
    }

    return (
        <div>
            <div onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 pr-2 py-1 cursor-pointer rounded-md hover:bg-slate-200/60">
                {isOpen ? <ChevronDownIcon className="w-4 h-4 text-slate-500 flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                <FolderIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-800">{name}</span>
            </div>
            {isOpen && (
                <div className="pl-4 border-l border-slate-300 ml-2">
                    {Object.entries(node).map(([childName, childNode]) => (
                        <FileTree key={childName} node={childNode} name={childName} onFileSelect={onFileSelect} />
                    ))}
                </div>
            )}
        </div>
    );
};

const Sidebar: React.FC<{ onFileSelect: (name: string, content: string) => void }> = ({ onFileSelect }) => {
    return (
        <div className="w-64 h-full bg-slate-100/70 border-r border-slate-200 flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-slate-200">
                <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Explorer</h2>
            </div>
            <div className="flex-grow p-2 space-y-1 overflow-y-auto">
                {Object.entries(initialFiles).map(([name, node]) => (
                    <FileTree key={name} node={node} name={name} onFileSelect={onFileSelect} />
                ))}
            </div>
        </div>
    );
};

const EditorView: React.FC<{ content: string; onContentChange: (newContent: string) => void }> = ({ content, onContentChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleScroll = () => {
        if (editorRef.current && textareaRef.current) {
            editorRef.current.scrollTop = textareaRef.current.scrollTop;
            editorRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };
    
    return (
        <div className="flex-grow relative bg-white font-mono text-sm leading-6">
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                onScroll={handleScroll}
                className="absolute inset-0 w-full h-full p-4 resize-none bg-transparent border-0 outline-none text-transparent caret-slate-800 z-10 whitespace-pre overflow-auto"
                spellCheck="false"
            />
            <div ref={editorRef} className="absolute inset-0 w-full h-full p-4 text-slate-800 bg-white overflow-auto pointer-events-none whitespace-pre"
                 dangerouslySetInnerHTML={{ __html: highlightSyntax(content) + '<br>'}} // Add a newline to prevent last line from being clipped
            />
        </div>
    );
};

const EditorPanel: React.FC<{
    tabs: Tab[];
    activeTab: number;
    onTabClick: (index: number) => void;
    onTabClose: (index: number) => void;
    onContentChange: (newContent: string) => void;
}> = ({ tabs, activeTab, onTabClick, onTabClose, onContentChange }) => {
    const activeTabData = tabs[activeTab];

    if (!activeTabData) {
        return (
            <div className="flex-grow h-full flex flex-col items-center justify-center bg-white text-center">
                <FilesIcon className="w-16 h-16 text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold text-slate-600">No file open</h3>
                <p className="text-slate-500">Select a file from the explorer to begin editing.</p>
            </div>
        )
    }

    return (
        <div className="flex-grow h-full flex flex-col bg-white overflow-hidden">
            <div className="flex border-b border-slate-200 flex-shrink-0">
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        onClick={() => onTabClick(index)}
                        className={`flex items-center justify-between pl-4 pr-2 py-2 border-r border-slate-200 cursor-pointer transition-colors ${index === activeTab ? 'bg-white text-slate-800' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        <div className="flex items-center space-x-2">
                           <CodeBracketIcon className="w-4 h-4 text-indigo-500" />
                           <span className="text-sm font-medium">{tab.name}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onTabClose(index);}} className="ml-4 w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-300/50">
                           <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <EditorView content={activeTabData.content} onContentChange={onContentChange} />
        </div>
    );
};

const BottomPanel: React.FC<{activeTab: string; onTabChange: (tab: string) => void; lintErrors: LintError[], outputLog: string}> = ({ activeTab, onTabChange, lintErrors, outputLog }) => {
    const TabButton: React.FC<{name: string, icon: React.ReactNode, count?: number}> = ({ name, icon, count }) => (
        <button onClick={() => onTabChange(name)} className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 ${activeTab === name ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {icon}
            <span>{name}</span>
            {count !== undefined && count > 0 && <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full">{count}</span>}
        </button>
    );

    return (
        <div className="h-48 bg-slate-50 border-t border-slate-200 flex flex-col flex-shrink-0">
            <div className="flex items-center border-b border-slate-200">
                <TabButton name="Problems" icon={<AlertTriangleIcon className="w-4 h-4"/>} count={lintErrors.length}/>
                <TabButton name="Output" icon={<TerminalIcon className="w-4 h-4"/>}/>
            </div>
            <div className="flex-grow p-2 overflow-y-auto font-mono text-xs">
                {activeTab === 'Problems' && (
                    <div>
                        {lintErrors.length === 0 ? <span className="text-slate-500">No problems have been detected.</span> :
                        lintErrors.map(err => (
                            <div key={err.line} className="flex items-center space-x-2 text-slate-700 p-0.5">
                                <AlertTriangleIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                <span><span className="font-bold">L{err.line}:</span> {err.message}</span>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'Output' && <pre className="text-slate-600 whitespace-pre-wrap">{outputLog || 'Run a script to see its output prompt here.'}</pre>}
            </div>
        </div>
    )
}

const ResultPanel: React.FC<{ result: GenerationResult }> = ({ result }) => {
    return (
        <div className="w-[450px] h-full bg-slate-100/70 border-l border-slate-200 flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-slate-200">
                <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Result</h2>
            </div>
            <div className="flex-grow p-2 flex items-center justify-center">
                {result.status === 'idle' && (
                    <div className="text-center text-slate-500">
                        <SparklesIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-medium">Run a script to generate an image.</p>
                    </div>
                )}
                 {result.status === 'loading' && (
                    <div className="flex flex-col items-center justify-center text-slate-500">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                        <p className="font-medium">Generating...</p>
                    </div>
                )}
                 {result.status === 'error' && (
                    <div className="text-center text-red-600 bg-red-100/50 p-4 rounded-lg border border-red-200/50">
                        <AlertTriangleIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-bold">Generation Failed</p>
                        <p className="text-sm">{result.data}</p>
                    </div>
                )}
                {result.status === 'success' && result.data && (
                    <img src={result.data} alt="Generated result" className="w-full h-full object-contain rounded-md" />
                )}
            </div>
        </div>
    )
}

const StatusBar: React.FC<{ lintErrorsCount: number }> = ({ lintErrorsCount }) => {
    return (
        <div className="h-8 bg-slate-100 border-t border-slate-200 flex items-center justify-between px-4 text-sm flex-shrink-0">
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-slate-200/70 px-2 rounded-md">
                 <AlertTriangleIcon className="w-4 h-4"/>
                 <span className="font-medium">{lintErrorsCount}</span>
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-slate-600 font-medium">{`{ } ImageScript`}</span>
            </div>
        </div>
    );
};

// --- MAIN IDE COMPONENT ---
const ImageScriptIDE: React.FC<{ onOpenDocs: () => void }> = ({ onOpenDocs }) => {
    const [tabs, setTabs] = useState<Tab[]>([{ name: "Welcome.md", content: initialFiles["Welcome.md"] as string }]);
    const [activeTab, setActiveTab] = useState(0);
    const [lintErrors, setLintErrors] = useState<LintError[]>([]);
    const [outputLog, setOutputLog] = useState('');
    const [activeBottomTab, setActiveBottomTab] = useState('Problems');
    const [generationResult, setGenerationResult] = useState<GenerationResult>({ status: 'idle', data: null });
    
    useEffect(() => {
        if (tabs[activeTab]) {
            setLintErrors(lintScript(tabs[activeTab].content));
        }
    }, [tabs, activeTab]);

    const handleFileSelect = (name: string, content: string) => {
        const existingTabIndex = tabs.findIndex(tab => tab.name === name);
        if (existingTabIndex !== -1) {
            setActiveTab(existingTabIndex);
        } else {
            setTabs([...tabs, { name, content }]);
            setActiveTab(tabs.length);
        }
    };
    
    const handleTabClick = (index: number) => setActiveTab(index);

    const handleTabClose = (index: number) => {
        const newTabs = tabs.filter((_, i) => i !== index);
        setTabs(newTabs);
        if (activeTab >= index && activeTab > 0) {
            setActiveTab(activeTab - 1);
        } else if (activeTab >= newTabs.length) {
            setActiveTab(newTabs.length - 1);
        }
    };

    const handleContentChange = useCallback((newContent: string) => {
        if (tabs[activeTab]) {
            const newTabs = [...tabs];
            newTabs[activeTab].content = newContent;
            setTabs(newTabs);
        }
    }, [tabs, activeTab]);
    
    const handleRun = async () => {
        if (!tabs[activeTab] || !tabs[activeTab].name.endsWith('.imagescript')) {
            setOutputLog("Error: Only .imagescript files can be run.");
            setActiveBottomTab('Output');
            return;
        }

        const script = tabs[activeTab].content;
        setGenerationResult({ status: 'loading', data: null });
        setOutputLog('Parsing script...');
        setActiveBottomTab('Output');

        try {
            const finalPrompt = parseImageScript(script);
            setOutputLog(`> PARSED PROMPT:\n\n${finalPrompt}`);
            
            const imageB64 = await generateImage(finalPrompt, '1:1');
            const imageUrl = `data:image/png;base64,${imageB64}`;
            setGenerationResult({ status: 'success', data: imageUrl });

        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred";
            setGenerationResult({ status: 'error', data: message });
             setOutputLog((prev) => prev + `\n\n> GENERATION FAILED:\n\n${message}`);
        }
    };

    return (
        <div className="w-full h-full bg-white flex p-4 box-border">
            <div className="w-full h-full flex bg-white rounded-xl shadow-2xl shadow-slate-300/40 border border-slate-200/80 overflow-hidden">
                <ActivityBar onRun={handleRun} onDocs={onOpenDocs} />
                <Sidebar onFileSelect={handleFileSelect} />
                <div className="flex-grow flex flex-col h-full overflow-hidden">
                    <EditorPanel 
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabClick={handleTabClick}
                        onTabClose={handleTabClose}
                        onContentChange={handleContentChange}
                    />
                    <BottomPanel activeTab={activeBottomTab} onTabChange={setActiveBottomTab} lintErrors={lintErrors} outputLog={outputLog} />
                    <StatusBar lintErrorsCount={lintErrors.length} />
                </div>
                <ResultPanel result={generationResult} />
            </div>
        </div>
    );
};

export default ImageScriptIDE;
