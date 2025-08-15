
import React, { useState, useCallback, useEffect } from 'react';
import type { NodeData, NodeType } from '../types';
import { 
    PlusIcon, UploadIcon, SparklesIcon, MagicWandIcon, CubeIcon, PencilIcon, FrameIcon,
    PaintBrushIcon, CameraIcon, SwirlIcon, PlanetIcon, FaceSmileIcon, DownloadIcon, EyeIcon, TrashIcon,
    PencilSquareIcon, MicrophoneIcon, VideoCameraIcon, PlayIcon, StopIcon,
    BrainCircuitIcon, MoonIcon, BookOpenIcon, CodeBracketIcon, QuestionMarkCircleIcon
} from './Icons';
import { describeImage, generateImage, generatePodcastScript, enhancePrompt, parseImageScript } from '../services/geminiService';

interface NodeProps {
  node: NodeData;
  onUpdate: (id: string, data: Partial<NodeData['data']>) => void;
  onAddNextNode: (parentNodeId: string, event: React.MouseEvent) => void;
  onDrag: (id: string, newPosition: { x: number; y: number }) => void;
  onDelete: (id: string) => void;
  onPreview: (url: string) => void;
  onRegenerate: (id: string) => void;
  onOpenDocs: () => void;
}

const nodeTitle: Record<NodeType, string> = {
    'source-upload': 'Upload Image',
    'source-generate': 'Generate (Prompt)',
    'source-imagescript': 'Generate (ImageScript)',
    'op-style': 'Change Style (Custom)',
    'op-3d': 'Make 3D',
    'op-edit': 'Edit Image',
    'op-resize': 'Resize & Reframe',
    'op-prompt-magic': 'Creative Boost',
    'op-dreamscape': 'Dreamscape',
    'op-storybook': 'Storybook Style',
    'op-glitchmancy': 'Artistic Glitch',
    'op-oil-painting': 'Oil Painting',
    'op-watercolor': 'Watercolor',
    'op-pencil-sketch': 'Pencil Sketch',
    'op-charcoal-drawing': 'Charcoal Drawing',
    'op-comic-book': 'Comic Book',
    'op-pop-art': 'Pop Art',
    'op-impressionism': 'Impressionism',
    'op-abstract': 'Abstract',
    'op-pointillism': 'Pointillism',
    'op-stained-glass': 'Stained Glass',
    'op-vintage-photo': 'Vintage Photo',
    'op-bw': 'Black & White',
    'op-long-exposure': 'Long Exposure',
    'op-bokeh': 'Bokeh',
    'op-hdr': 'HDR',
    'op-duotone': 'Duotone',
    'op-pinhole': 'Pinhole Camera',
    'op-lomo': 'Lomography',
    'op-tilt-shift': 'Tilt-Shift',
    'op-night-vision': 'Night Vision',
    'op-pixelate': 'Pixelate',
    'op-glitch': 'Glitch Art',
    'op-kaleidoscope': 'Kaleidoscope',
    'op-ascii': 'ASCII Art',
    'op-low-poly': 'Low Poly',
    'op-halftone': 'Halftone',
    'op-anaglyph': 'Anaglyph 3D',
    'op-scanlines': 'Scanlines',
    'op-invert': 'Invert Colors',
    'op-liquify': 'Liquify',
    'op-cyberpunk': 'Cyberpunk',
    'op-steampunk': 'Steampunk',
    'op-fantasy': 'Fantasy',
    'op-sci-fi': 'Sci-Fi',
    'op-minimalist': 'Minimalist',
    'op-vaporwave': 'Vaporwave',
    'op-gothic': 'Gothic',
    'op-art-deco': 'Art Deco',
    'op-grunge': 'Grunge',
    'op-hologram': 'Hologram',
    'op-stickerize': 'Stickerize',
    'op-lego': 'Lego Bricks',
    'op-claymation': 'Claymation',
    'op-blueprint': 'Blueprint',
    'op-neon-glow': 'Neon Glow',
    'op-generate-podcast': 'Generate Podcast',
    'op-veo-video': 'Generate Video (Veo)',
};

const promptRecipes: Partial<Record<NodeType, (base: string, custom: string) => string>> = {
    'source-generate': (_, custom) => custom,
    'op-style': (base, custom) => `${base}, in the style of ${custom}`,
    'op-3d': (base, custom) => `A 3D render of: ${base}. ${custom || 'photorealistic'}`,
    'op-edit': (base, custom) => `${base}, edited to ${custom}`,
    'op-resize': (base, _) => base,
    'op-prompt-magic': (base, custom) => custom || base, // Uses the enhanced prompt
    'op-dreamscape': (base, _) => `${base}, in a surreal, dreamy, ethereal style, with swirling colors and abstract shapes, vaporous, atmospheric`,
    'op-storybook': (base, _) => `${base}, in the style of a classic children's storybook illustration, with charming characters and a whimsical feel`,
    'op-glitchmancy': (base, _) => `${base}, an artistic glitch effect, with beautiful digital decay, chromatic aberration, and pixel sorting aesthetics`,
    'op-oil-painting': (base, _) => `${base}, in a lush, textured oil painting style`,
    'op-watercolor': (base, _) => `${base}, in a soft, blended watercolor style`,
    'op-pencil-sketch': (base, _) => `${base}, as a detailed, monochrome pencil sketch`,
    'op-charcoal-drawing': (base, _) => `${base}, as a dramatic charcoal drawing`,
    'op-comic-book': (base, _) => `${base}, in a bold, graphic comic book art style with halftone dots`,
    'op-pop-art': (base, _) => `${base}, in the style of Andy Warhol pop art`,
    'op-impressionism': (base, _) => `${base}, in the style of Impressionist painting with visible brushstrokes`,
    'op-abstract': (base, _) => `An abstract interpretation of ${base}`,
    'op-pointillism': (base, _) => `${base}, in the style of pointillism`,
    'op-stained-glass': (base, _) => `${base}, as a vibrant stained glass window`,
    'op-vintage-photo': (base, _) => `${base}, as a faded, sepia-toned vintage photograph from the 1920s`,
    'op-bw': (base, _) => `${base}, as a high-contrast black and white photograph`,
    'op-long-exposure': (base, _) => `${base}, with motion blur and light trails, as a long exposure photograph`,
    'op-bokeh': (base, _) => `${base}, with a soft, out-of-focus background with beautiful bokeh`,
    'op-hdr': (base, _) => `${base}, as a high-dynamic-range (HDR) image with intense detail and color`,
    'op-duotone': (base, _) => `${base}, in a two-color duotone effect, blue and yellow`,
    'op-pinhole': (base, _) => `${base}, as if taken with a pinhole camera, with vignetting and soft focus`,
    'op-lomo': (base, _) => `${base}, as a lomography photo with saturated colors and vignetting`,
    'op-tilt-shift': (base, _) => `${base}, as a tilt-shift photo, making it look like a miniature model`,
    'op-night-vision': (base, _) => `${base}, as seen through green night vision goggles`,
    'op-pixelate': (base, _) => `A pixel art version of ${base}`,
    'op-glitch': (base, _) => `${base}, with digital glitch effects, datamoshing, and artifacts`,
    'op-kaleidoscope': (base, _) => `A kaleidoscopic, symmetrical version of ${base}`,
    'op-ascii': (base, _) => `An ASCII art representation of ${base}`,
    'op-low-poly': (base, _) => `A low-poly, faceted version of ${base}`,
    'op-halftone': (base, _) => `${base}, using a halftone dot pattern`,
    'op-anaglyph': (base, _) => `${base}, as a red and cyan anaglyph 3D image`,
    'op-scanlines': (base, _) => `${base}, with horizontal scanlines, as if on an old CRT monitor`,
    'op-invert': (base, _) => `${base}, with all colors inverted`,
    'op-liquify': (base, _) => `${base}, with a warped, liquified effect`,
    'op-cyberpunk': (base, _) => `${base}, in a neon-drenched, high-tech cyberpunk setting`,
    'op-steampunk': (base, _) => `${base}, reimagined with steampunk gears, brass, and steam power`,
    'op-fantasy': (base, _) => `${base}, in a high-fantasy, magical setting`,
    'op-sci-fi': (base, _) => `${base}, in a futuristic, science-fiction setting with spaceships and aliens`,
    'op-minimalist': (base, _) => `A minimal, clean, and simple representation of ${base}`,
    'op-vaporwave': (base, _) => `${base}, in a vaporwave aesthetic with pastel colors, glitches, and classical statues`,
    'op-gothic': (base, _) => `${base}, in a dark, gothic style`,
    'op-art-deco': (base, _) => `${base}, in a glamorous Art Deco style`,
    'op-grunge': (base, _) => `${base}, with a gritty, textured grunge aesthetic`,
    'op-hologram': (base, _) => `A glowing, translucent hologram of ${base}`,
    'op-stickerize': (base, _) => `${base}, as a die-cut vinyl sticker with a white border`,
    'op-lego': (base, _) => `${base}, made out of Lego bricks`,
    'op-claymation': (base, _) => `${base}, as a claymation model`,
    'op-blueprint': (base, _) => `A technical blueprint drawing of ${base}`,
    'op-neon-glow': (base, _) => `${base}, as a vibrant neon sign`,
};


const Node: React.FC<NodeProps> = ({ node, onUpdate, onAddNextNode, onDrag, onDelete, onPreview, onRegenerate, onOpenDocs }) => {
  const [prompt, setPrompt] = useState(node.data.prompt || '');
  const [stylePrompt, setStylePrompt] = useState(node.data.stylePrompt || '');
  const [enhancedPrompt, setEnhancedPrompt] = useState(node.data.enhancedPrompt || '');
  const [imageScript, setImageScript] = useState(node.data.imageScript || '');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(node.data.aspectRatio || '1:1');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoGenStep, setVideoGenStep] = useState(0);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest('.node-header')) {
      return;
    }
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y,
    });
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      onDrag(node.id, { x: newX, y: newY });
    }
  }, [isDragging, dragStart, node.id, onDrag]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onUpdate(node.id, { isLoading: true, error: undefined });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = (event.target?.result as string).split(',')[1];
      const mimeType = file.type;
      
      onUpdate(node.id, { 
        inputImageUrl: event.target?.result as string, 
        inputImageMimeType: mimeType,
      });

      try {
        const description = await describeImage(base64Image, mimeType);
        onUpdate(node.id, { basePrompt: description, isLoading: false, outputImageUrl: event.target?.result as string });
      } catch (err) {
        onUpdate(node.id, { isLoading: false, error: 'Could not describe image.' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGeneratePodcast = async () => {
    onUpdate(node.id, { isLoading: true, error: undefined, script: undefined });
    try {
        if (!node.data.basePrompt) {
            throw new Error("Cannot generate podcast without a base prompt from an image.");
        }
        const script = await generatePodcastScript(node.data.basePrompt);
        onUpdate(node.id, { isLoading: false, script: script });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        onUpdate(node.id, { isLoading: false, error: errorMessage });
    }
  };

  const handleGenerateVideo = async () => {
      onUpdate(node.id, { isLoading: true, error: undefined, videoGenComplete: false });
  };
  
  const videoGenSteps = ["Analyzing Scene...", "Generating Storyboard...", "Composing Shots...", "Rendering Video..."];
  useEffect(() => {
      let interval: number;
      if (node.type === 'op-veo-video' && node.data.isLoading) {
          setVideoGenStep(0);
          interval = window.setInterval(() => {
              setVideoGenStep(prev => {
                  if (prev >= videoGenSteps.length - 1) {
                      clearInterval(interval);
                      onUpdate(node.id, { isLoading: false, videoGenComplete: true });
                      return prev;
                  }
                  return prev + 1;
              });
          }, 1200);
      }
      return () => clearInterval(interval);
  }, [node.data.isLoading, node.type, node.id]);


  const handleGenerate = async (options: { aspect?: string, promptOverride?: string } = {}) => {
    // Invalidate and remove all downstream nodes before generating a new image
    onRegenerate(node.id);
    
    if (node.type === 'op-generate-podcast') {
        return handleGeneratePodcast();
    }
    if (node.type === 'op-veo-video') {
        return handleGenerateVideo();
    }

    const aspectRatio = options.aspect || selectedAspectRatio;
    const dataToUpdate: Partial<NodeData['data']> = { 
        isLoading: true, 
        error: undefined, 
        prompt, 
        stylePrompt, 
        aspectRatio, 
        script: undefined,
        imageScript
    };

    onUpdate(node.id, dataToUpdate);

    try {
        let finalPrompt = '';
        if(node.type === 'source-imagescript') {
            finalPrompt = parseImageScript(imageScript);
        } else {
            const base = node.data.basePrompt || '';
            const custom = options.promptOverride || stylePrompt || prompt;
            
            const recipe = promptRecipes[node.type];
            if (recipe) {
                finalPrompt = recipe(base, custom);
            } else {
                console.error(`No prompt recipe for node type: ${node.type}`);
                finalPrompt = base; // Fallback to base prompt
            }
        }
      
      if (!finalPrompt || !finalPrompt.trim()) {
        onUpdate(node.id, { isLoading: false, error: "Prompt cannot be empty. Please write a prompt or script." });
        return;
      }

      const imageB64 = await generateImage(finalPrompt, aspectRatio);
      const imageUrl = `data:image/png;base64,${imageB64}`;
      onUpdate(node.id, { isLoading: false, outputImageUrl: imageUrl, basePrompt: finalPrompt, enhancedPrompt: node.type === 'op-prompt-magic' ? finalPrompt : undefined });
      setIsEditing(false); // Exit editing mode on successful generation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      onUpdate(node.id, { isLoading: false, error: errorMessage });
    }
  };

  const handleEnhancePrompt = async () => {
    if (!node.data.basePrompt) return;
    onUpdate(node.id, { isLoading: true, error: undefined });
    try {
        const newPrompt = await enhancePrompt(node.data.basePrompt);
        setEnhancedPrompt(newPrompt);
        onUpdate(node.id, { isLoading: false, enhancedPrompt: newPrompt });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        onUpdate(node.id, { isLoading: false, error: errorMessage });
    }
  };

  React.useEffect(() => {
    const handleSpeechEnd = () => setIsPlaying(false);
    
    if ('speechSynthesis' in window) {
        speechSynthesis.addEventListener('end', handleSpeechEnd);
        return () => {
            speechSynthesis.removeEventListener('end', handleSpeechEnd);
            speechSynthesis.cancel();
        };
    }
    return () => {};
  }, []);

  const togglePlay = () => {
    if (!('speechSynthesis' in window)) {
        alert("Sorry, your browser doesn't support speech synthesis.");
        return;
    }
    
    if (isPlaying) {
        speechSynthesis.cancel();
        setIsPlaying(false);
    } else {
        if (node.data.script) {
            const utterance = new SpeechSynthesisUtterance(node.data.script);
            speechSynthesis.speak(utterance);
            setIsPlaying(true);
        }
    }
  };


  const NodeIcon = () => {
    const type = node.type;
    const className = "w-5 h-5";

    if (type.startsWith('op-') && type.includes('-')) {
        if (['oil-painting', 'watercolor', 'pencil-sketch', 'charcoal-drawing', 'comic-book', 'pop-art', 'impressionism', 'abstract', 'pointillism', 'stained-glass'].some(s => type.includes(s))) return <PaintBrushIcon className={className} />;
        if (['vintage-photo', 'bw', 'long-exposure', 'bokeh', 'hdr', 'duotone', 'pinhole', 'lomo', 'tilt-shift', 'night-vision'].some(s => type.includes(s))) return <CameraIcon className={className} />;
        if (['pixelate', 'glitch', 'kaleidoscope', 'ascii', 'low-poly', 'halftone', 'anaglyph', 'scanlines', 'invert', 'liquify'].some(s => type.includes(s))) return <SwirlIcon className={className} />;
        if (['cyberpunk', 'steampunk', 'fantasy', 'sci-fi', 'minimalist', 'vaporwave', 'gothic', 'art-deco', 'grunge', 'hologram'].some(s => type.includes(s))) return <PlanetIcon className={className} />;
        if (['stickerize', 'lego', 'claymation', 'blueprint', 'neon-glow'].some(s => type.includes(s))) return <FaceSmileIcon className={className} />;
    }

    switch (node.type) {
      case 'source-upload': return <UploadIcon className={className} />;
      case 'source-generate': return <SparklesIcon className={className} />;
      case 'source-imagescript': return <CodeBracketIcon className={className} />;
      case 'op-style': return <MagicWandIcon className={className} />;
      case 'op-3d': return <CubeIcon className={className} />;
      case 'op-edit': return <PencilIcon className={className} />;
      case 'op-resize': return <FrameIcon className={className} />;
      case 'op-prompt-magic': return <BrainCircuitIcon className={className} />;
      case 'op-dreamscape': return <MoonIcon className={className} />;
      case 'op-storybook': return <BookOpenIcon className={className} />;
      case 'op-glitchmancy': return <SwirlIcon className={className} />;
      case 'op-generate-podcast': return <MicrophoneIcon className={className} />;
      case 'op-veo-video': return <VideoCameraIcon className={className} />;
      default: return <MagicWandIcon className={className} />; // Fallback
    }
  };

  const renderContent = () => {
    if (node.type === 'op-veo-video' && node.data.isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-sm text-slate-500 font-medium">{videoGenSteps[videoGenStep]}</p>
            </div>
        )
    }

    if (node.data.isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
                <p className="mt-4 text-sm text-slate-500">{node.data.prompt || "Processing..."}</p>
            </div>
        );
    }

    if (node.data.error) {
        const retryAction = () => handleGenerate({ aspect: node.data.aspectRatio });
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{node.data.error}</p>
                <button onClick={retryAction} className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transform transition-transform active:scale-95">Retry</button>
            </div>
        )
    }

    if (node.data.outputImageUrl && !isEditing) {
        const handleDownload = () => {
            const link = document.createElement('a');
            link.href = node.data.outputImageUrl!;
            const fileName = (node.data.basePrompt || 'imagescript-generated').replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `${fileName.substring(0, 50)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        return (
            <div className="w-full h-full relative group bg-slate-100 rounded-b-lg">
                <img src={node.data.outputImageUrl} alt={node.data.basePrompt || "Generated content"} className="w-full h-full object-cover rounded-b-lg" />
                <button 
                  onClick={(e) => onAddNextNode(node.id, e)}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border-2 border-indigo-400/50 hover:border-indigo-500 rounded-full flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 hover:shadow-lg hover:shadow-indigo-500/30"
                  aria-label="Add next step"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2 space-x-2 rounded-b-lg">
                    <button onClick={() => setIsEditing(true)} title="Edit Node" className="w-9 h-9 rounded-full bg-white/80 text-slate-700 hover:bg-white hover:text-indigo-600 backdrop-blur-sm flex items-center justify-center transition-all transform hover:scale-110">
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handleDownload} title="Download Image" className="w-9 h-9 rounded-full bg-white/80 text-slate-700 hover:bg-white hover:text-indigo-600 backdrop-blur-sm flex items-center justify-center transition-all transform hover:scale-110">
                        <DownloadIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onPreview(node.data.outputImageUrl!)} title="Preview Image" className="w-9 h-9 rounded-full bg-white/80 text-slate-700 hover:bg-white hover:text-indigo-600 backdrop-blur-sm flex items-center justify-center transition-all transform hover:scale-110">
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(node.id)} title="Delete Node & Branch" className="w-9 h-9 rounded-full bg-white/80 text-slate-700 hover:bg-white hover:text-red-600 backdrop-blur-sm flex items-center justify-center transition-all transform hover:scale-110">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    const actionButtonClasses = "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center space-x-2 transform active:scale-[0.98] hover:shadow-lg hover:shadow-indigo-500/30 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed";

    switch (node.type) {
        case 'source-upload':
            return (
                <div className="flex flex-col items-center justify-center h-full p-3">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-50 hover:border-indigo-400 transition-colors">
                        <UploadIcon className="w-10 h-10 text-slate-400 mb-2"/>
                        <span className="text-slate-500 font-medium">Click to upload</span>
                    </button>
                </div>
            );
        case 'source-generate':
            return (
                <div className="flex flex-col h-full p-3 space-y-3">
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A majestic lion on a futuristic throne..." className="flex-grow w-full bg-slate-100 text-slate-800 p-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none" />
                    <button onClick={() => handleGenerate()} disabled={!prompt.trim()} className={actionButtonClasses}>
                        <SparklesIcon className="w-5 h-5"/>
                        <span>Generate</span>
                    </button>
                </div>
            );
        case 'source-imagescript':
            return (
                <div className="flex flex-col h-full p-3 space-y-2 bg-gray-800 rounded-b-lg">
                    <div className="flex items-center justify-end">
                        <button onClick={onOpenDocs} className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 transition-colors">
                            <QuestionMarkCircleIcon className="w-4 h-4"/>
                            <span>Docs</span>
                        </button>
                    </div>
                    <textarea 
                        value={imageScript}
                        onChange={(e) => setImageScript(e.target.value)}
                        placeholder={'// A new language for images...\ncreate creature "cyborg fox" {\n  description: "glowing neon eyes";\n  action: "sprinting through a city";\n}\n\nset scene "cyberpunk metropolis" {\n  lighting: "rainy, neon-drenched";\n}'}
                        className="flex-grow w-full bg-black/50 font-mono text-cyan-300 p-2 text-xs rounded-md border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none selection:bg-indigo-500/50"
                        spellCheck="false"
                    />
                    <button onClick={() => handleGenerate()} disabled={!imageScript.trim()} className={actionButtonClasses}>
                        <SparklesIcon className="w-5 h-5"/>
                        <span>Execute Script</span>
                    </button>
                </div>
            )
        case 'op-style':
        case 'op-3d':
        case 'op-edit':
            const placeholderText: Record<string, string> = {
                'op-style': "cinematic lighting, epic, hyperdetailed...",
                'op-3d': "as a claymation model...",
                'op-edit': "change the car to red, add a spoiler..."
            };
            const applyIcon: Record<string, React.ReactNode> = {
                'op-style': <MagicWandIcon className="w-5 h-5"/>,
                'op-3d': <CubeIcon className="w-5 h-5"/>,
                'op-edit': <PencilIcon className="w-5 h-5"/>
            }
            return (
                <div className="flex flex-col h-full p-3 space-y-3">
                    <p className="text-xs text-slate-500 bg-slate-100 p-2 rounded-md truncate border border-slate-200">Base: {node.data.basePrompt || "No base prompt"}</p>
                    <textarea value={stylePrompt} onChange={(e) => setStylePrompt(e.target.value)} placeholder={placeholderText[node.type]} className="flex-grow w-full bg-slate-100 text-slate-800 p-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none" />
                    <button onClick={() => handleGenerate()} disabled={!node.data.basePrompt || !stylePrompt.trim()} className={actionButtonClasses}>
                        {applyIcon[node.type]}
                        <span>Apply</span>
                    </button>
                </div>
            );
        case 'op-resize':
            const aspectRatios = [ { label: '1:1', value: '1:1' }, { label: '16:9', value: '16:9' }, { label: '9:16', value: '9:16' }, { label: '4:3', value: '4:3' }, { label: '3:4', value: '3:4' }];
            return (
                 <div className="flex flex-col h-full p-3 space-y-3">
                    <p className="text-xs text-slate-500 bg-slate-100 p-2 rounded-md truncate border border-slate-200">Base: {node.data.basePrompt || "No base prompt"}</p>
                    <div className="flex-grow flex flex-col justify-center items-center">
                        <p className="text-sm font-medium text-slate-600 mb-3">Select a new aspect ratio:</p>
                        <div className="grid grid-cols-3 gap-2 w-full">
                            {aspectRatios.map(ratio => (
                                <button key={ratio.value} onClick={() => { setSelectedAspectRatio(ratio.value); handleGenerate({ aspect: ratio.value }); }} disabled={!node.data.basePrompt} className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all transform active:scale-95 disabled:bg-slate-200 disabled:cursor-not-allowed ${selectedAspectRatio === ratio.value && !node.data.outputImageUrl ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                    {ratio.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        case 'op-prompt-magic':
            return (
                <div className="flex flex-col h-full p-3 space-y-3">
                    <p className="text-xs text-slate-500 bg-slate-100 p-2 rounded-md truncate border border-slate-200">Base: {node.data.basePrompt || "No base prompt"}</p>
                    <textarea value={enhancedPrompt} onChange={(e) => setEnhancedPrompt(e.target.value)} placeholder="Click 'Boost Prompt' to let AI expand your idea..." className="flex-grow w-full bg-slate-100 text-slate-800 p-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none" />
                    <button onClick={handleEnhancePrompt} disabled={!node.data.basePrompt} className={`w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center space-x-2 transform active:scale-[0.98] disabled:bg-slate-300`}>
                        <SparklesIcon className="w-5 h-5" />
                        <span>Boost Prompt</span>
                    </button>
                    <button onClick={() => handleGenerate({promptOverride: enhancedPrompt})} disabled={!enhancedPrompt} className={actionButtonClasses}>
                        <PaintBrushIcon className="w-5 h-5"/>
                        <span>Generate with Boost</span>
                    </button>
                </div>
            );
        case 'op-generate-podcast':
            if (node.data.script) {
                return (
                    <div className="flex flex-col h-full p-4 space-y-3">
                        <div className="flex-grow p-2 text-xs text-slate-700 bg-slate-100 rounded-lg overflow-y-auto border border-slate-200">
                           {node.data.script}
                        </div>
                        <button onClick={togglePlay} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center space-x-2 transform active:scale-[0.98]">
                           {isPlaying ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                           <span>{isPlaying ? 'Stop' : 'Play Podcast'}</span>
                        </button>
                    </div>
                );
            }
            return (
                <div className="flex flex-col h-full p-3 space-y-3 justify-between">
                    <p className="text-xs text-slate-500 bg-slate-100 p-2 rounded-md truncate border border-slate-200">Base: {node.data.basePrompt || "No base prompt"}</p>
                    <div className="text-center flex-grow flex items-center justify-center px-4">
                        <p className="text-slate-600 font-medium">Generate a short podcast from the image description.</p>
                    </div>
                    <button onClick={() => handleGenerate()} disabled={!node.data.basePrompt} className={actionButtonClasses}>
                        <MicrophoneIcon className="w-5 h-5" />
                        <span>Generate Script</span>
                    </button>
                </div>
            );
        case 'op-veo-video':
            if (node.data.videoGenComplete) {
                 return (
                    <div className="flex flex-col h-full p-3 space-y-3 items-center justify-center bg-slate-800 text-white rounded-b-lg text-center">
                        <VideoCameraIcon className="w-12 h-12 text-indigo-400" />
                        <h4 className="font-bold text-lg">Veo Integration</h4>
                        <p className="text-sm text-slate-300">True video generation is coming soon to the API. Stay tuned!</p>
                    </div>
                );
            }
            return (
                 <div className="flex flex-col h-full p-3 space-y-3 justify-between">
                    <p className="text-xs text-slate-500 bg-slate-100 p-2 rounded-md truncate border border-slate-200">Base: {node.data.basePrompt || "No base prompt"}</p>
                    <div className="text-center flex-grow flex items-center justify-center px-4">
                        <p className="text-slate-600 font-medium">Generate an animated video from the image.</p>
                    </div>
                    <button onClick={() => handleGenerate()} disabled={!node.data.basePrompt} className={actionButtonClasses}>
                        <VideoCameraIcon className="w-5 h-5" />
                        <span>Generate</span>
                    </button>
                </div>
            );

        default:
            // Generic handler for all new fixed-style nodes
            return (
                <div className="flex flex-col h-full p-3 space-y-3 justify-between">
                    <p className="text-xs text-slate-500 bg-slate-100 p-2 rounded-md truncate border border-slate-200">Base: {node.data.basePrompt || "No base prompt"}</p>
                    <div className="text-center flex-grow flex items-center justify-center px-4">
                        <p className="text-slate-600 font-medium">Apply the "{nodeTitle[node.type]}" effect.</p>
                    </div>
                    <button onClick={() => handleGenerate()} disabled={!node.data.basePrompt} className={actionButtonClasses}>
                        <NodeIcon />
                        <span>Apply</span>
                    </button>
                </div>
            )
    }
  };

  const wrapperClasses = `absolute bg-white w-64 h-64 rounded-xl shadow-xl shadow-slate-200/80 border border-slate-200/80 flex flex-col transition-all duration-300 ${isEditing ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`;

  return (
    <div
      id={`node-wrapper-${node.id}`}
      className={wrapperClasses}
      style={{ left: node.position.x, top: node.position.y, transform: isDragging ? 'scale(1.02)' : 'scale(1)' }}
      onMouseDown={handleMouseDown}
    >
      <div className="node-header flex items-center p-2.5 bg-white border-b border-slate-200/80 rounded-t-xl cursor-grab active:cursor-grabbing">
        <span className="text-indigo-500 mr-2"><NodeIcon /></span>
        <h3 className="text-sm font-bold text-slate-700">{nodeTitle[node.type]}</h3>
      </div>
      <div className="flex-grow min-h-0">
          {renderContent()}
      </div>
    </div>
  );
};

export default Node;
